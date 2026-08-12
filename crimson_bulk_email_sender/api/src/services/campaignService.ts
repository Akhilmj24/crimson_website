// @ts-nocheck
import Campaign from '../models/Campaign';
import { isDBConnected } from '../config/db';

const inMemoryCampaigns = [];

const createCampaignRecord = async ({ subject, emails, smtpHost, smtpUser }) => {
  const recipients = emails.map(email => ({ email, status: 'pending', message: 'Waiting in queue...' }));
  const dbConnected = isDBConnected();

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
};

const updateCampaignRecipientStatus = async (campaignInfo, email, status, message) => {
  const { id } = campaignInfo;
  const dbConnected = isDBConnected();

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
};

const updateCampaignLog = async (campaignInfo, text, type = '') => {
  const { id } = campaignInfo;
  const logEntry = { timestamp: new Date(), text, type };
  const dbConnected = isDBConnected();

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
};

const finalizeCampaign = async (campaignInfo, status) => {
  const { id } = campaignInfo;
  const dbConnected = isDBConnected();

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
};

const getAllCampaigns = async () => {
  const dbConnected = isDBConnected();
  if (dbConnected) {
    try {
      return await Campaign.find().sort({ sentAt: -1 });
    } catch (err) {
      console.error('Failed to retrieve campaigns from database:', err.message);
    }
  }
  return [...inMemoryCampaigns].sort((a, b) => b.sentAt - a.sentAt);
};

const deleteCampaign = async (id) => {
  const dbConnected = isDBConnected();
  if (dbConnected && !id.startsWith('mem_')) {
    const result = await Campaign.findByIdAndDelete(id);
    return !!result;
  }
  const index = inMemoryCampaigns.findIndex(c => c._id === id);
  if (index !== -1) {
    inMemoryCampaigns.splice(index, 1);
    return true;
  }
  return false;
};

export default { 
  createCampaignRecord,
  updateCampaignRecipientStatus,
  updateCampaignLog,
  finalizeCampaign,
  getAllCampaigns,
  deleteCampaign
 };
