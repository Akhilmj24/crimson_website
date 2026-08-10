// @ts-nocheck
import express from 'express';
import campaignController from '../controllers/campaignController';
import auth from '../middlewares/auth';

const router = express.Router();

router.get('/smtp-status', campaignController.getSmtpStatus);
router.get('/campaigns', campaignController.getCampaigns);
router.delete('/campaigns/:id', auth, campaignController.deleteCampaign);
router.post('/send-emails', auth, campaignController.sendEmails);

export default router;
