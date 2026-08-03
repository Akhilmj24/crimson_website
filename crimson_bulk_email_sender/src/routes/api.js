const express = require('express');
const campaignRoutes = require('./campaignRoutes');
const documentRoutes = require('./documentRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const proposalRoutes = require('./proposalRoutes');

const router = express.Router();

// Mount aggregated routers
router.use('/', campaignRoutes);
router.use('/', documentRoutes);
router.use('/', invoiceRoutes);
router.use('/', proposalRoutes);

module.exports = router;
