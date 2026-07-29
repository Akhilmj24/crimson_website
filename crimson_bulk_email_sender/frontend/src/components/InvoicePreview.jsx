import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useInvoice } from '../context/InvoiceContext';

export default function InvoicePreview() {
  const {
    invoiceMeta,
    customerDetails,
    sellerDetails,
    invoiceItems,
    termsAndConditions,
    handleDownloadPDF
  } = useInvoice();

  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatNumber = (num) => {
    return num.toLocaleString('en-IN');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const gstAmount = invoiceItems.reduce((sum, item) => sum + (item.qty * item.price * (item.gstRate / 100)), 0);
  const grandTotal = subtotal + gstAmount;

  return (
    <div className="invoice-preview-section">
      <div className="invoice-preview-card">
        <div className="invoice-preview-toolbar">
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Live A4 Quotation Preview</span>
          <button type="button" className="btn-download-pdf" onClick={handleDownloadPDF}>
            <ExternalLink size={14} />
            Download PDF Invoice
          </button>
        </div>

        {/* Print Document A4 Canvas Container */}
        <div className="invoice-preview-canvas" id="invoice-pdf-area">
          {/* Header */}
          <div className="invoice-preview-header">
            <div>
              <img
                src="/logo.png"
                alt="Sprinpak Logo"
                className="invoice-preview-logo"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150x50?text=Sprinpak'; }}
              />
            </div>
            <div className="invoice-preview-title-area">
              <div className="invoice-preview-title">Pre-Quotation</div>
              <table className="invoice-preview-meta-table">
                <tbody>
                  <tr>
                    <td>Quote No:</td>
                    <td>{invoiceMeta.quoteNo}</td>
                  </tr>
                  <tr>
                    <td>Date:</td>
                    <td>{formatDate(invoiceMeta.date)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="invoice-preview-divider"></div>

          {/* Address boxes */}
          <div className="invoice-preview-addresses">
            <div className="invoice-preview-address-box">
              <div className="invoice-preview-section-title">Quotation For</div>
              <div className="invoice-preview-client-name">{customerDetails.name}</div>
              <div className="invoice-preview-text-line">Attn: {customerDetails.attn}</div>
              <div className="invoice-preview-text-line">Phone: {customerDetails.phone}</div>
              <div className="invoice-preview-text-line">Destination: {customerDetails.destination}</div>
            </div>

            <div className="invoice-preview-address-box">
              <div className="invoice-preview-section-title">{sellerDetails.name}</div>
              <div className="invoice-preview-text-line" style={{ fontSize: '11px', marginTop: '4px' }}>
                <strong>Office:</strong> {sellerDetails.office}
              </div>
              <div className="invoice-preview-text-line" style={{ marginTop: '6px' }}>
                <strong>GSTIN:</strong> {sellerDetails.gstin}
              </div>
              <div className="invoice-preview-text-line">
                <strong>Phone:</strong> {sellerDetails.phone} | <strong>Email:</strong> {sellerDetails.email}
              </div>
            </div>
          </div>

          {/* Products list table */}
          <div className="invoice-preview-table-container">
            <table className="invoice-preview-table">
              <thead>
                <tr>
                  <th style={{ width: '4%', textAlign: 'center' }}>#</th>
                  <th style={{ width: '38%' }}>Pouch / Finish</th>
                  <th style={{ width: '22%' }}>Size</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Qty</th>
                  <th style={{ width: '6%', textAlign: 'center' }}>SKUs</th>
                  <th style={{ width: '8%', textAlign: 'right' }}>Price/pc</th>
                  <th style={{ width: '14%', textAlign: 'right' }}>GST</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, idx) => {
                  const itemTotal = item.qty * item.price;
                  const itemGst = itemTotal * (item.gstRate / 100);
                  return (
                    <tr key={item.id}>
                      <td className="center" style={{ color: '#64748b' }}>{idx + 1}</td>
                      <td>
                        <div className="invoice-preview-item-title">{item.description.split('\n')[0]}</div>
                        <div className="invoice-preview-item-desc">
                          {item.description.split('\n').slice(1).join('\n')}
                        </div>
                      </td>
                      <td>
                        <div className="invoice-preview-item-title">{item.size.split('\n')[0]}</div>
                        <div className="invoice-preview-item-desc">
                          {item.size.split('\n').slice(1).join('\n')}
                        </div>
                      </td>
                      <td className="center">{formatNumber(item.qty)}</td>
                      <td className="center">{item.skus !== undefined ? item.skus : 1}</td>
                      <td className="right">{formatCurrency(item.price)}</td>
                      <td className="right">
                        {formatCurrency(itemGst)}
                        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                          ({item.gstRate}%)
                        </div>
                      </td>
                      <td className="right" style={{ fontWeight: '600' }}>{formatCurrency(itemTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary and totals */}
          <div className="invoice-preview-summary-section">
            <table className="invoice-preview-summary-table">
              <tbody>
                <tr>
                  <td>Subtotal:</td>
                  <td>{formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td>Basic Total (excl. GST):</td>
                  <td>{formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td>GST Amount:</td>
                  <td>{formatCurrency(gstAmount)}</td>
                </tr>
                <tr className="grand-total-row">
                  <td>Total (incl. GST):</td>
                  <td>{formatCurrency(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="invoice-preview-footer">
            <div className="invoice-preview-signature-block">
              <div>
                <strong>Prepared by:</strong> {invoiceMeta.preparedBy}
              </div>
              <div style={{ fontStyle: 'italic' }}>
                This is electronically generated and does not require signature.
              </div>
            </div>

            {termsAndConditions.length > 0 && (
              <div className="invoice-preview-terms-box">
                <div className="invoice-preview-terms-title">Terms & Conditions</div>
                <ol className="invoice-preview-terms-list">
                  {termsAndConditions.map((term, i) => (
                    <li key={i}>{term}</li>
                  ))}
                </ol>
              </div>
            )}

            <div className="invoice-preview-footer-note">
              This is a pre-quotation. Prices are indicative and subject to final confirmation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
