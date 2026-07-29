import React from 'react';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePreview from '../components/InvoicePreview';

export default function InvoiceGenerator() {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1>Interactive Invoice & Quotation Generator</h1>
      </header>

      <div className="invoice-split-grid">
        <InvoiceForm />
        <InvoicePreview />
      </div>
    </div>
  );
}
