import React from 'react';
import { FileText, Download } from 'lucide-react';
import { useProposal } from '../context/ProposalContext';
import { useInvoice } from '../context/InvoiceContext';
import { trackAsyncAction } from '../utils/apiButtonTracker';

export default function ProposalPreview({ hideToolbar = false }) {
  const {
    sender,
    recipient,
    meta,
    sections,
    handleDownloadPDF,
    handleDownloadDocx,
    formatDate
  } = useProposal();

  const { handleDownloadCombinedPDF } = useInvoice();

  return (
    <div className="invoice-preview-section">
      <div className="invoice-preview-card">
        {!hideToolbar && (
          <div className="invoice-preview-toolbar">
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Live A4 Proposal Preview
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-download-pdf" onClick={(e) => trackAsyncAction(e, handleDownloadPDF)} style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#ffffff' }}>
                <Download size={14} />
                Download PDF
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
        <div className="invoice-preview-canvas" id="proposal-pdf-area" style={{ padding: '35px 45px', position: 'relative' }}>
          {/* Logo & Sender Header */}
          <div className="invoice-preview-header" style={{ marginBottom: '12px' }}>
            {/* Logo image from public/logo.png */}
            <div>
              <img
                src="/logo.png"
                alt="Logo"
                crossOrigin="anonymous"
                style={{ height: '54px', maxWidth: '200px', objectFit: 'contain' }}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150x50?text=Crimson'; }}
              />
            </div>

            {/* Sender details */}
            <div className="invoice-preview-title-area" style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: '800', color: '#990f02', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                {sender.company || 'Company'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {sender.address}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {sender.email}
              </div>
              {sender.phone && (
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {sender.phone}
                </div>
              )}
            </div>
          </div>

          {/* Styled red divider line */}
          <div style={{
            height: '2px',
            backgroundColor: '#990f02',
            marginBottom: '12px',
            borderRadius: '1px'
          }}></div>

          {/* Recipient and Date Section */}
          <div className="invoice-preview-addresses" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="invoice-preview-address-box" style={{ padding: '0', flex: '1' }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: '800', color: '#990f02', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
                {recipient.company || 'COMPANY NAME'}
              </div>
              {recipient.name && recipient.name.trim() ? (
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>
                  {recipient.name.toLowerCase().startsWith('attn') ? recipient.name : `${recipient.salutation ? `${recipient.salutation} ` : ''}${recipient.name}`}
                </div>
              ) : null}
              {recipient.title && recipient.title.trim() ? (
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '2px' }}>
                  {recipient.title}
                </div>
              ) : null}
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {recipient.address}
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#475569', letterSpacing: '0.5px' }}>
              {formatDate(meta.date)}
            </div>
          </div>

          {/* Subject block */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              SUBJECT
            </div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#990f02' }}>
              {meta.subject || 'Proposal Subject'}
            </div>
          </div>

          {/* Salutation & Intro */}
          <div style={{ fontSize: '12px', lineHeight: '1.5', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: '600' }}>
              {!recipient.name || !recipient.name.trim() ? 'Dear Sir/Madam,' : meta.salutation}
            </div>

            {meta.intro && meta.intro.split('\n').map((para, idx) => (
              para.trim() && <p key={idx} style={{ margin: '0' }}>{para}</p>
            ))}
          </div>

          {/* Dynamic Sections */}
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sections.map((section) => (
              <div key={section.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#990f02', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {section.title || 'SECTION TITLE'}
                </div>
                <div style={{ fontSize: '12px', lineHeight: '1.5', color: '#334155', whiteSpace: 'pre-line' }}>
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Closing & Sign-off Block */}
          <div style={{ marginTop: '15px', fontSize: '12px', lineHeight: '1.5', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: '0' }}>
              We would be pleased to discuss your required quantity, customization preferences, delivery schedule, and commercial quotation and prepare a suitable proposal for your organization.
            </p>
            <p style={{ margin: '0' }}>
              We look forward to the opportunity to be part of your Onam celebrations and help you share a taste of tradition and a gift of happiness with the people who matter to your organization.
            </p>

            <div style={{ fontSize: '12px', color: '#1e293b' }}>
              <div style={{ fontStyle: 'italic', color: '#475569' }}>Warm regards,</div>
              <div style={{ fontWeight: '700', color: '#990f02', marginTop: '4px' }}>Akhil</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
