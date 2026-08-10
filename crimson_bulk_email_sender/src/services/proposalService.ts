// @ts-nocheck
import Proposal from '../models/Proposal';
import AppError from '../utils/AppError';

const getProposalById = async (id) => {
  const proposal = await Proposal.findById(id);
  if (!proposal) {
    throw new AppError('Proposal draft not found', 404);
  }
  return proposal;
};

const getAllProposals = async (filter: any = {}) => {
  return await Proposal.find(filter).sort({ updatedAt: -1 });
};

const createProposal = async (data) => {
  const proposal = new Proposal(data);
  await proposal.save();
  return proposal;
};

const updateProposal = async (id, data) => {
  const proposal = await Proposal.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true
  });
  if (!proposal) {
    throw new AppError('Proposal draft not found for update', 404);
  }
  return proposal;
};

const deleteProposal = async (id) => {
  const proposal = await Proposal.findByIdAndDelete(id);
  if (!proposal) {
    throw new AppError('Proposal draft not found for deletion', 404);
  }
  return proposal;
};

export default { 
  getProposalById,
  getAllProposals,
  createProposal,
  updateProposal,
  deleteProposal
 };
