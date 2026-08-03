const express = require('express');
const proposalController = require('../controllers/proposalController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { validateProposal } = require('../validators/proposalValidator');

const router = express.Router();

router.get('/proposals', proposalController.getProposals);
router.get('/proposals/:id', proposalController.getProposal);
router.post('/proposals', auth, validate(validateProposal), proposalController.createProposal);
router.put('/proposals/:id', auth, validate(validateProposal), proposalController.updateProposal);
router.delete('/proposals/:id', auth, proposalController.deleteProposal);

module.exports = router;
