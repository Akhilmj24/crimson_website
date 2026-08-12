// @ts-nocheck
import express from 'express';
import campaignRoutes from './campaignRoutes';
import documentRoutes from './documentRoutes';
import invoiceRoutes from './invoiceRoutes';
import proposalRoutes from './proposalRoutes';
import crmRoutes from './crmRoutes';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';

const router = express.Router();

// Mount aggregated routers
router.use('/', campaignRoutes);
router.use('/', documentRoutes);
router.use('/', invoiceRoutes);
router.use('/', proposalRoutes);
router.use('/', crmRoutes);
router.use('/', authRoutes);
router.use('/', productRoutes);

export default router;
