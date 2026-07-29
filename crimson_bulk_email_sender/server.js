const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const { getOnamAdTemplate } = require('./template');
const Campaign = require('./models/Campaign');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crimson_emails';
let dbConnected = false;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    dbConnected = true;
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    console.log('Running in Fallback Mode (campaign histories stored in-memory)');
  });

// In-Memory fallback storage
const inMemoryCampaigns = [];

// Helper persistence wrappers
async function createCampaignRecord({ subject, emails, smtpHost, smtpUser }) {
  const recipients = emails.map(email => ({ email, status: 'pending', message: 'Waiting in queue...' }));
  
  if (dbConnected) {
    try {
      const campaign = new Campaign({
        subject,
        totalEmails: emails.length,
        smtpHost: smtpHost || 'Simulation Mode',
        smtpUser: smtpUser || 'None',
        recipients,
        logs: [{ text: `Campaign initialized with ${emails.length} recipients.`, type: 'info' }]
      });
      await campaign.save();
      return { id: campaign._id.toString(), instance: campaign };
    } catch (err) {
      console.error('Failed to save Campaign to MongoDB, using memory:', err.message);
    }
  }

  // Fallback
  const id = 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const campaign = {
    _id: id,
    subject,
    totalEmails: emails.length,
    successCount: 0,
    errorCount: 0,
    status: 'sending',
    smtpHost: smtpHost || 'Simulation Mode',
    smtpUser: smtpUser || 'None',
    recipients,
    logs: [{ timestamp: new Date(), text: `Campaign initialized with ${emails.length} recipients.`, type: 'info' }],
    sentAt: new Date()
  };
  inMemoryCampaigns.push(campaign);
  return { id, instance: campaign };
}

async function updateCampaignRecipientStatus(campaignInfo, email, status, message) {
  const { id } = campaignInfo;
  if (dbConnected && !id.startsWith('mem_')) {
    try {
      await Campaign.updateOne(
        { _id: id, 'recipients.email': email },
        { 
          $set: { 
            'recipients.$.status': status,
            'recipients.$.message': message
          }
        }
      );
      const incField = status === 'success' ? { successCount: 1 } : { errorCount: 1 };
      await Campaign.updateOne({ _id: id }, { $inc: incField });
      return;
    } catch (err) {
      console.error('Failed to update recipient in MongoDB:', err.message);
    }
  }

  // Fallback memory
  const campaign = inMemoryCampaigns.find(c => c._id === id);
  if (campaign) {
    const recipient = campaign.recipients.find(r => r.email === email);
    if (recipient) {
      recipient.status = status;
      recipient.message = message;
    }
    if (status === 'success') {
      campaign.successCount++;
    } else {
      campaign.errorCount++;
    }
  }
}

async function updateCampaignLog(campaignInfo, text, type = '') {
  const { id } = campaignInfo;
  const logEntry = { timestamp: new Date(), text, type };
  if (dbConnected && !id.startsWith('mem_')) {
    try {
      await Campaign.updateOne(
        { _id: id },
        { $push: { logs: logEntry } }
      );
      return;
    } catch (err) {
      console.error('Failed to save log in MongoDB:', err.message);
    }
  }

  // Fallback memory
  const campaign = inMemoryCampaigns.find(c => c._id === id);
  if (campaign) {
    campaign.logs.push(logEntry);
  }
}

async function finalizeCampaign(campaignInfo, status) {
  const { id } = campaignInfo;
  if (dbConnected && !id.startsWith('mem_')) {
    try {
      await Campaign.updateOne(
        { _id: id },
        { $set: { status } }
      );
      return;
    } catch (err) {
      console.error('Failed to finalize campaign in MongoDB:', err.message);
    }
  }

  // Fallback memory
  const campaign = inMemoryCampaigns.find(c => c._id === id);
  if (campaign) {
    campaign.status = status;
  }
}

// Enable CORS and body parsing
app.use(cors());
app.use(express.json());

// Serve static dashboard assets from frontend build directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// API Endpoint to check if server-side SMTP is configured and DB status
app.get('/api/smtp-status', (req, res) => {
  const isConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
  
  res.json({
    configured: isConfigured,
    smtpUser: process.env.SMTP_USER || '',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || '',
    dbConnected: dbConnected
  });
});

// GET endpoint to fetch dispatch history
app.get('/api/campaigns', async (req, res) => {
  if (dbConnected) {
    try {
      const campaigns = await Campaign.find().sort({ sentAt: -1 });
      return res.json(campaigns);
    } catch (err) {
      console.error('Failed to retrieve campaigns from database:', err.message);
    }
  }
  
  // Return memory array sorted by sentAt descending
  const sortedMemory = [...inMemoryCampaigns].sort((a, b) => b.sentAt - a.sentAt);
  res.json(sortedMemory);
});

// DELETE endpoint to delete a campaign history record
app.delete('/api/campaigns/:id', async (req, res) => {
  const { id } = req.params;
  
  if (dbConnected && !id.startsWith('mem_')) {
    try {
      const result = await Campaign.findByIdAndDelete(id);
      if (result) {
        return res.json({ success: true, message: 'Campaign record deleted successfully from database.' });
      }
      return res.status(404).json({ success: false, error: 'Campaign record not found.' });
    } catch (err) {
      console.error('Failed to delete campaign from database:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // Memory fallback deletion
  const index = inMemoryCampaigns.findIndex(c => c._id === id);
  if (index !== -1) {
    inMemoryCampaigns.splice(index, 1);
    return res.json({ success: true, message: 'Campaign record deleted successfully from memory backup.' });
  }
  
  res.status(404).json({ success: false, error: 'Campaign record not found in memory.' });
});

// SSE HTTP POST Endpoint to send bulk emails with real-time progress stream
app.post('/api/send-emails', async (req, res) => {
  const { emails, smtpConfig } = req.body;

  // Set headers for Server-Sent Events (SSE) to stream progress in real time
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    res.write(`data: ${JSON.stringify({ error: 'Invalid or empty email array list.' })}\n\n`);
    res.end();
    return;
  }

  // Resolve SMTP configuration (frontend override OR server-side env)
  const host = smtpConfig?.host || process.env.SMTP_HOST;
  const port = parseInt(smtpConfig?.port || process.env.SMTP_PORT || '587');
  const secure = smtpConfig?.secure !== undefined ? smtpConfig.secure : (process.env.SMTP_SECURE === 'true');
  const user = smtpConfig?.user || process.env.SMTP_USER;
  const pass = smtpConfig?.pass || process.env.SMTP_PASS;
  const fromName = smtpConfig?.fromName || process.env.SMTP_FROM_NAME || 'Crimson Group LLP';
  const fromEmail = smtpConfig?.fromEmail || process.env.SMTP_FROM_EMAIL || 'crimsongroupllp@gmail.com';

  // Initialize DB Campaign Record
  const campaignInfo = await createCampaignRecord({
    subject: '🎁 Celebrate Onam with Crimson Corporate Gift Combos',
    emails,
    smtpHost: host,
    smtpUser: user
  });

  const sendProgress = (data) => {
    res.write(`data: ${JSON.stringify({ ...data, campaignId: campaignInfo.id })}\n\n`);
  };

  let transporter = null;
  let isMockMode = false;

  // If credentials are missing, run in Simulation mode for user demo/testing
  if (!host || !user || !pass) {
    isMockMode = true;
    const msg = 'SMTP credentials missing. Running in Simulation (MOCK) Mode...';
    sendProgress({ message: msg, mock: true });
    await updateCampaignLog(campaignInfo, msg, 'warning');
  } else {
    try {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      // Verify SMTP connection
      await transporter.verify();
      const msg = `Successfully connected to SMTP server (${host}). Starting queue...`;
      sendProgress({ message: msg });
      await updateCampaignLog(campaignInfo, msg, 'info');
    } catch (verifyError) {
      console.error('SMTP Connection Verify Failed:', verifyError);
      const errMsg = `SMTP Connection Failed: ${verifyError.message}. Aborting queue.`;
      sendProgress({ error: errMsg });
      await updateCampaignLog(campaignInfo, errMsg, 'error');
      await finalizeCampaign(campaignInfo, 'failed');
      res.end();
      return;
    }
  }

  // Staggered loop through email list
  for (let i = 0; i < emails.length; i++) {
    const recipient = emails[i].trim();
    if (!recipient) continue;

    sendProgress({
      index: i + 1,
      total: emails.length,
      email: recipient,
      status: 'sending',
      message: `Sending email to ${recipient}...`
    });

    if (isMockMode) {
      // Simulate network delay for mock sending (1 second)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const successMsg = `[MOCK] E-mail sent successfully to ${recipient}`;
      
      sendProgress({
        index: i + 1,
        total: emails.length,
        email: recipient,
        status: 'success',
        message: successMsg
      });
      
      await updateCampaignRecipientStatus(campaignInfo, recipient, 'success', '[MOCK] Delivered successfully');
      await updateCampaignLog(campaignInfo, successMsg, 'success');
    } else {
      try {
        const mailOptions = {
          from: `"${fromName}" <${fromEmail}>`,
          to: recipient,
          subject: '🎁 Celebrate Onam with Crimson Corporate Gift Combos',
          html: getOnamAdTemplate(),
          attachments: [
            {
              filename: 'onam_flyer.jpg',
              path: path.join(__dirname, 'onam_flyer.jpg'),
              cid: 'onam_flyer'
            }
          ]
        };

        const info = await transporter.sendMail(mailOptions);
        const successMsg = `E-mail sent successfully. ID: ${info.messageId}`;
        console.log(`Email sent to ${recipient}: ${info.messageId}`);

        sendProgress({
          index: i + 1,
          total: emails.length,
          email: recipient,
          status: 'success',
          message: successMsg
        });

        await updateCampaignRecipientStatus(campaignInfo, recipient, 'success', `Delivered. ID: ${info.messageId}`);
        await updateCampaignLog(campaignInfo, `E-mail sent to ${recipient}. ID: ${info.messageId}`, 'success');
      } catch (sendError) {
        console.error(`Failed to send to ${recipient}:`, sendError);
        const failMsg = `Failed: ${sendError.message}`;
        
        sendProgress({
          index: i + 1,
          total: emails.length,
          email: recipient,
          status: 'error',
          message: failMsg
        });

        await updateCampaignRecipientStatus(campaignInfo, recipient, 'error', failMsg);
        await updateCampaignLog(campaignInfo, `Failed to send to ${recipient}: ${sendError.message}`, 'error');
      }

      // Add a staggered delay (1.5 seconds) to prevent throttling/spam triggers
      if (i < emails.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  const finishedMsg = 'All email transmissions finished!';
  sendProgress({ done: true, message: finishedMsg });
  await updateCampaignLog(campaignInfo, finishedMsg, 'info');
  await finalizeCampaign(campaignInfo, 'completed');
  res.end();
});

// Start listening
app.listen(PORT, () => {
  console.log(`Crimson Bulk Email Sender server is running on http://localhost:${PORT}`);
});
