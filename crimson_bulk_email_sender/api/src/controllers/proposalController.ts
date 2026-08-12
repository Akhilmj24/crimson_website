// @ts-nocheck
import proposalService from '../services/proposalService';
import catchAsync from '../utils/catchAsync';

const getProposals = catchAsync(async (req, res, next) => {
  const proposals = await proposalService.getAllProposals();
  res.json(proposals);
});

const getProposal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const proposal = await proposalService.getProposalById(id);
  res.json(proposal);
});

const createProposal = catchAsync(async (req, res, next) => {
  const proposal = await proposalService.createProposal(req.body);
  res.status(201).json(proposal);
});

const updateProposal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const proposal = await proposalService.updateProposal(id, req.body);
  res.json(proposal);
});

const deleteProposal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await proposalService.deleteProposal(id);
  res.json({ success: true, message: 'Proposal draft deleted successfully.' });
});

export default { 
  getProposals,
  getProposal,
  createProposal,
  updateProposal,
  deleteProposal
 };
