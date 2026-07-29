import React from 'react';
import { ProposalProvider } from '../context/ProposalContext';
import ProposalForm from '../components/ProposalForm';
import ProposalPreview from '../components/ProposalPreview';

export default function ProposalGenerator() {
  return (
    <ProposalProvider>
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <header style={{ marginBottom: '24px' }}>
          <h1>Interactive Business Proposal Creator</h1>
        </header>

        <div className="invoice-split-grid">
          <ProposalForm />
          <ProposalPreview />
        </div>
      </div>
    </ProposalProvider>
  );
}
