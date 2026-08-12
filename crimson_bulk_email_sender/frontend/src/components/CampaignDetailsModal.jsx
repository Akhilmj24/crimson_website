import React from 'react';
import { XCircle, Users, Terminal, CheckCircle2, XCircle as XCircleIcon } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export default function CampaignDetailsModal() {
  const {
    selectedCampaign,
    setSelectedCampaign,
    modalTab,
    setModalTab
  } = useCampaign();

  if (!selectedCampaign) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelectedCampaign(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 'bold' }}>
              {selectedCampaign.subject}
            </h2>
            <div style={{ display: 'flex', gap: '15px', marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span><strong>Date:</strong> {new Date(selectedCampaign.sentAt).toLocaleString()}</span>
              <span><strong>SMTP:</strong> {selectedCampaign.smtpHost}</span>
              <span><strong>Total Loaded:</strong> {selectedCampaign.totalEmails}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => setSelectedCampaign(null)}>
            <XCircle size={22} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tabs */}
          <div className="modal-tabs">
            <button
              className={`modal-tab-btn ${modalTab === 'recipients' ? 'active' : ''}`}
              onClick={() => setModalTab('recipients')}
            >
              <Users size={12} style={{ display: 'inline', marginRight: '6px' }} />
              Recipients List ({selectedCampaign.recipients.length})
            </button>
            <button
              className={`modal-tab-btn ${modalTab === 'logs' ? 'active' : ''}`}
              onClick={() => setModalTab('logs')}
            >
              <Terminal size={12} style={{ display: 'inline', marginRight: '6px' }} />
              Archived Activity Log ({selectedCampaign.logs.length})
            </button>
          </div>

          {/* Tab 1: Recipients list */}
          {modalTab === 'recipients' && (
            <div className="recipients-table-wrapper" style={{ maxHeight: '350px' }}>
              <div className="overflow-x-auto w-full max-w-full custom-scrollbar"><table className="recipients-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email Address</th>
                    <th>Status</th>
                    <th>Server Message</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCampaign.recipients.map((rec, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ fontWeight: '500' }}>{rec.email}</td>
                      <td>
                        <span className={`badge ${rec.status}`}>
                          {rec.status === 'success' && <CheckCircle2 size={10} />}
                          {rec.status === 'error' && <XCircleIcon size={10} />}
                          {rec.status}
                        </span>
                      </td>
                      <td style={{
                        color: rec.status === 'success' ? 'var(--success)' : rec.status === 'error' ? 'var(--error)' : 'var(--text-secondary)',
                        fontSize: '12px'
                      }}>
                        {rec.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}

          {/* Tab 2: Activity logs */}
          {modalTab === 'logs' && (
            <div className="log-container" style={{ height: '350px' }}>
              {selectedCampaign.logs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '100px' }}>
                  No terminal logs were archived for this campaign.
                </div>
              ) : (
                selectedCampaign.logs.map((log, i) => {
                  const timeString = log.timestamp
                    ? new Date(log.timestamp).toLocaleTimeString()
                    : 'Log';
                  return (
                    <div key={i} className={`log-entry ${log.type}`}>
                      <span className="log-time">[{timeString}]</span>
                      <span className="log-content">{log.text}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
