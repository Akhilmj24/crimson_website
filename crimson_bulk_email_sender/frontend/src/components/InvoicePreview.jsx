import React from 'react';
import { ExternalLink, FileText, Download } from 'lucide-react';
import { useInvoice } from '../context/InvoiceContext';
import { trackAsyncAction } from '../utils/apiButtonTracker';

export default function InvoicePreview({ hideToolbar = false }) {
  const {
    invoiceMeta,
    customerDetails,
    sellerDetails,
    invoiceItems,
    termsAndConditions,
    handleDownloadPDF,
    handleDownloadCombinedPDF,
    handleDownloadDocx,
    gstEnabled,
    showGstin,
    showTotal
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
        {!hideToolbar && (
          <div className="invoice-preview-toolbar">
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Live A4 Preview</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-download-pdf" onClick={(e) => trackAsyncAction(e, handleDownloadPDF)} style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#ffffff' }}>
                <ExternalLink size={14} />
                Download PDF Invoice
              </button>
              <button type="button" className="btn-download-pdf" onClick={(e) => trackAsyncAction(e, handleDownloadCombinedPDF)} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff' }}>
                <Download size={14} />
                Download Proposal + Invoice PDF
              </button>
              <button type="button" className="btn-download-pdf" onClick={(e) => trackAsyncAction(e, handleDownloadDocx)} style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff' }}>
                <FileText size={14} />
                Download DOCX
              </button>
            </div>
          </div>
        )}

        {/* Print Document A4 Canvas Container */}
        <div className="invoice-preview-canvas" id="invoice-pdf-area">
          {/* Header */}
          <div className="invoice-preview-header">
            <div>
              <img
                src="/logo.png"
                alt="Sprinpak Logo"
                className="invoice-preview-logo"
                crossOrigin="anonymous"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150x50?text=Sprinpak'; }}
              />
            </div>
            <div className="invoice-preview-title-area">
              <div className="invoice-preview-title">Proforma Invoice</div>
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
              <div className="invoice-preview-section-title">Proforma For</div>
              <div className="invoice-preview-client-name">{customerDetails.name}</div>
              <div className="invoice-preview-text-line">{customerDetails.attnSalutation ? `${customerDetails.attnSalutation} ` : ''}{customerDetails.attn}</div>
              <div className="invoice-preview-text-line">Phone: {customerDetails.phone}</div>
              <div className="invoice-preview-text-line">Destination: {customerDetails.destination}</div>
            </div>

            <div className="invoice-preview-address-box">
              <div className="invoice-preview-section-title">{sellerDetails.name}</div>
              <div className="invoice-preview-text-line" style={{ fontSize: '11px', marginTop: '4px' }}>
                <strong>Office:</strong> {sellerDetails.office}
              </div>
              {showGstin && sellerDetails.gstin && (
                <div className="invoice-preview-text-line" style={{ marginTop: '6px' }}>
                  <strong>GSTIN:</strong> {sellerDetails.gstin}
                </div>
              )}
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
                  <th style={{ width: '5%', textAlign: 'center' }}>Sr</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Image</th>
                  <th style={{ width: '40%' }}>Goods & Service Description</th>
                  <th style={{ width: '11%', textAlign: 'center' }}>Quantity</th>
                  <th style={{ width: '11%', textAlign: 'right' }}>Rate</th>
                  {gstEnabled && (
                    <th style={{ width: '10%', textAlign: 'center' }}>GST</th>
                  )}
                  <th style={{ width: '11%', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, idx) => {
                  const itemSubtotal = item.qty * item.price;
                  const itemGst = gstEnabled ? itemSubtotal * (item.gstRate / 100) : 0;
                  const itemTotal = itemSubtotal + itemGst;
                  return (
                    <tr key={item.id}>
                      <td className="center" style={{ color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '6px' }}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.description}
                            crossOrigin="anonymous"
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'inline-block' }}
                          />
                        ) : (
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>No image</span>
                        )}
                      </td>
                      <td>
                        <div className="invoice-preview-item-title">{item.description}</div>
                        {item.size && (
                          <div className="invoice-preview-item-desc" style={{ marginTop: '2px', fontStyle: 'italic', fontSize: '11px', color: '#64748b' }}>
                            Size: {item.size}
                          </div>
                        )}
                      </td>
                      <td className="center">{formatNumber(item.qty)}</td>
                      <td className="right">{formatCurrency(item.price)}</td>
                      {gstEnabled && (
                        <td className="center">{item.gstRate}%</td>
                      )}
                      <td className="right" style={{ fontWeight: '700', color: '#990f02' }}>{formatCurrency(itemTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary and totals */}
          {(showTotal || !gstEnabled) && (
            <div className="invoice-preview-summary-section">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                {showTotal && (
                  <table className="invoice-preview-summary-table">
                    <tbody>
                      {gstEnabled ? (
                        <>
                          <tr>
                            <td>Subtotal (excl. GST):</td>
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
                        </>
                      ) : (
                        <tr className="grand-total-row">
                          <td>Total:</td>
                          <td>{formatCurrency(subtotal)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
                {!gstEnabled && (
                  <div style={{
                    marginTop: showTotal ? '8px' : '0px',
                    color: '#475569',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    fontWeight: '500',
                    textAlign: 'right'
                  }}>
                    5% GST will be charged extra.
                  </div>
                )}
              </div>
            </div>
          )}

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
              This is a proforma invoice. Prices are indicative and subject to final confirmation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
