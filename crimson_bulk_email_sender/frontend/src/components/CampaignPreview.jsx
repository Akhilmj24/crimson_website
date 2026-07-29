import React from 'react';
import { Mail, FileText } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export default function CampaignPreview() {
  const {
    smtpMode,
    customSmtp,
    importTab,
    excelContacts,
    parsedEmails
  } = useCampaign();

  const selectedExcelCount = excelContacts.filter(c => c.checked).length;
  const firstExcelName = excelContacts.filter(c => c.checked)[0]?.name || 'recipient';

  return (
    <div className="card email-preview-card">
      <div className="card-title">
        <Mail size={18} />
        Email Campaign Preview
      </div>

      <div className="email-client-mockup">
        <div className="email-header-fields">
          <div className="email-header-line">
            <span className="email-header-label">From:</span>
            <span className="email-header-value">
              <strong>
                {smtpMode === 'custom' && customSmtp.fromName ? customSmtp.fromName : 'Crimson Group LLP'}
              </strong>{' '}
              &lt;{smtpMode === 'custom' && customSmtp.fromEmail ? customSmtp.fromEmail : 'crimsongroupllp@gmail.com'}&gt;
            </span>
          </div>
          <div className="email-header-line">
            <span className="email-header-label">To:</span>
            <span className="email-header-value italic-value">
              {importTab === 'excel'
                ? `${selectedExcelCount} selected contacts (e.g. ${firstExcelName}@domain.com)`
                : parsedEmails.length > 0
                  ? `${parsedEmails.length} recipient(s) (e.g. ${parsedEmails[0]})`
                  : 'Recipient List (None loaded)'}
            </span>
          </div>
          <div className="email-header-line">
            <span className="email-header-label">Subject:</span>
            <span className="email-header-value subject-value">🎁 Celebrate Onam with Crimson Corporate Gift Combos</span>
          </div>
          <div className="email-header-line">
            <span className="email-header-label">Attachment:</span>
            <span className="email-header-value attachment-value">
              <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
              onam_flyer.jpg (390 KB)
            </span>
          </div>
        </div>

        <div className="email-body-content">
          <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E5E0D8' }}>
            <div className="flyer-preview-frame" style={{ maxWidth: '100%', margin: '0 auto' }}>
              <img src="/onam_flyer.jpg" alt="Onam Gift Combo Flyer" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} />
            </div>

            <div style={{ marginTop: '20px', padding: '10px 0' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#990F02', display: 'block', marginBottom: '4px' }}>
                Ready to Place an Order?
              </span>
              <span style={{ fontSize: '11px', fontStyle: 'italic', fontWeight: 'bold', color: '#C21807', display: 'block', marginBottom: '10px' }}>
                We can design your branding also, it feels like your product
              </span>
              <div style={{ display: 'inline-block', backgroundColor: '#25D366', color: '#FFFFFF', fontWeight: 'bold', fontSize: '12px', padding: '8px 16px', borderRadius: '20px' }}>
                Order / Inquire on WhatsApp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
