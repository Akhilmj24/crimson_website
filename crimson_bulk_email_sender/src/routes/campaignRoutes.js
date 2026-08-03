const express = require('express');
const campaignController = require('../controllers/campaignController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/smtp-status', campaignController.getSmtpStatus);
router.get('/campaigns', campaignController.getCampaigns);
router.delete('/campaigns/:id', auth, campaignController.deleteCampaign);
router.post('/send-emails', auth, campaignController.sendEmails);

module.exports = router;
