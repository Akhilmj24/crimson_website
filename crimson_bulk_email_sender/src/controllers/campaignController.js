const path = require('path');
const nodemailer = require('nodemailer');
const campaignService = require('../services/campaignService');
const { getOnamAdTemplate } = require('../../template');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { isDBConnected } = require('../config/db');

const getSmtpStatus = catchAsync(async (req, res, next) => {
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
    dbConnected: isDBConnected()
  });
});

const getCampaigns = catchAsync(async (req, res, next) => {
  const campaigns = await campaignService.getAllCampaigns();
  res.json(campaigns);
});

const deleteCampaign = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleted = await campaignService.deleteCampaign(id);
  if (!deleted) {
    return next(new AppError('Campaign record not found', 404));
  }
  res.json({ success: true, message: 'Campaign record deleted successfully.' });
});

const sendEmails = async (req, res) => {
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
  const fromName = smtpConfig?.fromName || process.env.SMTP_FROM_NAME || 'Crimson Eats LLP';
  const fromEmail = smtpConfig?.fromEmail || process.env.SMTP_FROM_EMAIL || 'crimsoneatsllp@gmail.com';

  // Initialize DB Campaign Record
  const campaignInfo = await campaignService.createCampaignRecord({
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
    await campaignService.updateCampaignLog(campaignInfo, msg, 'warning');
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
      await campaignService.updateCampaignLog(campaignInfo, msg, 'info');
    } catch (verifyError) {
      console.error('SMTP Connection Verify Failed:', verifyError);
      const errMsg = `SMTP Connection Failed: ${verifyError.message}. Aborting queue.`;
      sendProgress({ error: errMsg });
      await campaignService.updateCampaignLog(campaignInfo, errMsg, 'error');
      await campaignService.finalizeCampaign(campaignInfo, 'failed');
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
      
      await campaignService.updateCampaignRecipientStatus(campaignInfo, recipient, 'success', '[MOCK] Delivered successfully');
      await campaignService.updateCampaignLog(campaignInfo, successMsg, 'success');
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
              path: path.join(__dirname, '../../onam_flyer.jpg'),
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

        await campaignService.updateCampaignRecipientStatus(campaignInfo, recipient, 'success', `Delivered. ID: ${info.messageId}`);
        await campaignService.updateCampaignLog(campaignInfo, `E-mail sent to ${recipient}. ID: ${info.messageId}`, 'success');
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

        await campaignService.updateCampaignRecipientStatus(campaignInfo, recipient, 'error', failMsg);
        await campaignService.updateCampaignLog(campaignInfo, `Failed to send to ${recipient}: ${sendError.message}`, 'error');
      }

      // Add a staggered delay (1.5 seconds) to prevent throttling/spam triggers
      if (i < emails.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  const finishedMsg = 'All email transmissions finished!';
  sendProgress({ done: true, message: finishedMsg });
  await campaignService.updateCampaignLog(campaignInfo, finishedMsg, 'info');
  await campaignService.finalizeCampaign(campaignInfo, 'completed');
  res.end();
};

module.exports = {
  getSmtpStatus,
  getCampaigns,
  deleteCampaign,
  sendEmails
};
