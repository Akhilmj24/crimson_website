import React from 'react';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePreview from '../components/InvoicePreview';
import ProposalPreview from '../components/ProposalPreview';
import CustomConfirmModal from '../components/CustomConfirmModal';
import { useInvoice } from '../context/InvoiceContext';

export default function InvoiceGenerator() {
  const { invoiceConfirmModal, setInvoiceConfirmModal } = useInvoice();

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1>Interactive Invoice & Quotation Generator</h1>
      </header>

      <div className="invoice-split-grid">
        <InvoiceForm />
        <InvoicePreview />
      </div>

      {/* Offscreen Proposal Preview so we can capture it for the combined PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0', width: '800px', height: 'auto', pointerEvents: 'none' }}>
        <ProposalPreview hideToolbar={true} />
      </div>

      <CustomConfirmModal
        isOpen={invoiceConfirmModal.isOpen}
        title="Change Quotation Number"
        message="Are you sure you want to change the quotation / serial number?"
        onConfirm={() => {
          if (invoiceConfirmModal.onConfirm) invoiceConfirmModal.onConfirm();
          setInvoiceConfirmModal({ isOpen: false, onConfirm: null });
        }}
        onCancel={() => {
          setInvoiceConfirmModal({ isOpen: false, onConfirm: null });
        }}
      />
    </div>
  );
}
