// @ts-nocheck
import express from 'express';
import proposalController from '../controllers/proposalController';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import { validateProposal } from '../validators/proposalValidator';

const router = express.Router();

router.get('/proposals', proposalController.getProposals);
router.get('/proposals/:id', proposalController.getProposal);
router.post('/proposals', auth, validate(validateProposal), proposalController.createProposal);
router.put('/proposals/:id', auth, validate(validateProposal), proposalController.updateProposal);
router.delete('/proposals/:id', auth, proposalController.deleteProposal);

export default router;
