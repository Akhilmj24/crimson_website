const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const { getOnamAdTemplate } = require('./template');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parsing
app.use(cors());
app.use(express.json());

// Serve static dashboard assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint to check if server-side SMTP is configured
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
    smtpPort: process.env.SMTP_PORT || ''
  });
});

// SSE HTTP POST Endpoint to send bulk emails with real-time progress stream
app.post('/api/send-emails', async (req, res) => {
  const { emails, smtpConfig } = req.body;

  // Set headers for Server-Sent Events (SSE) to stream progress in real time
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendProgress = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    sendProgress({ error: 'Invalid or empty email array list.' });
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

  let transporter = null;
  let isMockMode = false;

  // If credentials are missing, run in Simulation mode for user demo/testing
  if (!host || !user || !pass) {
    isMockMode = true;
    sendProgress({
      message: 'SMTP credentials missing. Running in Simulation (MOCK) Mode...',
      mock: true
    });
  } else {
    try {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure, // true for 465, false for other ports
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false // avoids self-signed cert issues
        }
      });
      
      // Verify SMTP connection
      await transporter.verify();
      sendProgress({ message: `Successfully connected to SMTP server (${host}). Starting queue...` });
    } catch (verifyError) {
      console.error('SMTP Connection Verify Failed:', verifyError);
      sendProgress({ error: `SMTP Connection Failed: ${verifyError.message}. Aborting queue.` });
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
      sendProgress({
        index: i + 1,
        total: emails.length,
        email: recipient,
        status: 'success',
        message: `[MOCK] E-mail sent successfully to ${recipient}`
      });
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
        console.log(`Email sent: ${info.messageId}`);

        sendProgress({
          index: i + 1,
          total: emails.length,
          email: recipient,
          status: 'success',
          message: `E-mail sent successfully. ID: ${info.messageId}`
        });
      } catch (sendError) {
        console.error(`Failed to send to ${recipient}:`, sendError);
        sendProgress({
          index: i + 1,
          total: emails.length,
          email: recipient,
          status: 'error',
          message: `Failed: ${sendError.message}`
        });
      }

      // Add a staggered delay (1.5 seconds) to prevent throttling/spam triggers
      if (i < emails.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  sendProgress({ done: true, message: 'All email transmissions finished!' });
  res.end();
});

// Start listening
app.listen(PORT, () => {
  console.log(`Crimson Bulk Email Sender server is running on http://localhost:${PORT}`);
});
