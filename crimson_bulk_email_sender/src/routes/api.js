const express = require('express');
const campaignRoutes = require('./campaignRoutes');
const documentRoutes = require('./documentRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const proposalRoutes = require('./proposalRoutes');
const crmRoutes = require('./crmRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

// Mount aggregated routers
router.use('/', campaignRoutes);
router.use('/', documentRoutes);
router.use('/', invoiceRoutes);
router.use('/', proposalRoutes);
router.use('/', crmRoutes);
router.use('/', authRoutes);

module.exports = router;
