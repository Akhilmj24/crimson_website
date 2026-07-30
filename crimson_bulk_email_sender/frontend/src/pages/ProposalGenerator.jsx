import React from 'react';
import ProposalForm from '../components/ProposalForm';
import ProposalPreview from '../components/ProposalPreview';
import InvoicePreview from '../components/InvoicePreview';
import CustomConfirmModal from '../components/CustomConfirmModal';
import { useProposal } from '../context/ProposalContext';

export default function ProposalGenerator() {
  const { proposalConfirmModal, setProposalConfirmModal } = useProposal();

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1>Interactive Business Proposal Creator</h1>
      </header>

      <div className="invoice-split-grid">
        <ProposalForm />
        <ProposalPreview />
      </div>

      {/* Offscreen Invoice Preview so we can capture it for the combined PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0', width: '800px', height: 'auto', pointerEvents: 'none' }}>
        <InvoicePreview hideToolbar={true} />
      </div>

      <CustomConfirmModal
        isOpen={proposalConfirmModal.isOpen}
        title="Change Serial Number"
        message="Are you sure you want to change the quotation / serial number?"
        onConfirm={() => {
          if (proposalConfirmModal.onConfirm) proposalConfirmModal.onConfirm();
          setProposalConfirmModal({ isOpen: false, onConfirm: null });
        }}
        onCancel={() => {
          setProposalConfirmModal({ isOpen: false, onConfirm: null });
        }}
      />
    </div>
  );
}
