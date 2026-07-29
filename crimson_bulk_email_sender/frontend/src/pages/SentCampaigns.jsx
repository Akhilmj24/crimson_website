import React, { useEffect } from 'react';
import { RefreshCw, Loader2, ShieldAlert, History, Calendar, Clock, Users, CheckCircle2, XCircle, Server, FileText, Trash2 } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import CampaignDetailsModal from '../components/CampaignDetailsModal';

export default function SentCampaigns() {
  const {
    campaigns,
    loadingHistory,
    historyError,
    fetchCampaignHistory,
    deleteCampaignRecord,
    setSelectedCampaign,
    setModalTab,
    selectedCampaign
  } = useCampaign();

  // Fetch campaigns history on mount
  useEffect(() => {
    fetchCampaignHistory();
  }, []);

  return (
    <div>
      <header className="history-header">
        <h1>Campaign Dispatch History</h1>
        <button
          className="btn-icon-label"
          onClick={fetchCampaignHistory}
          disabled={loadingHistory}
        >
          <RefreshCw size={14} className={loadingHistory ? 'spin' : ''} />
          Refresh Logs
        </button>
      </header>

      {loadingHistory && campaigns.length === 0 ? (
        <div className="empty-state" style={{ borderStyle: 'solid' }}>
          <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)' }} />
          <p>Loading history records...</p>
        </div>
      ) : historyError ? (
        <div className="empty-state" style={{ borderStyle: 'solid', borderColor: 'var(--error)' }}>
          <ShieldAlert size={32} style={{ color: 'var(--error)' }} />
          <p style={{ color: 'var(--error)' }}>{historyError}</p>
          <button className="btn-secondary" onClick={fetchCampaignHistory}>Try Again</button>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <History size={24} />
          </div>
          <h3>No Campaigns Found</h3>
          <p>You haven't sent any email campaigns yet. Go to the dispatcher tab to run your first bulk campaign!</p>
        </div>
      ) : (
        <div className="history-grid">
          {campaigns.map((camp) => {
            const successRate = camp.totalEmails > 0
              ? Math.round((camp.successCount / camp.totalEmails) * 100)
              : 0;

            const formattedDate = new Date(camp.sentAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            const formattedTime = new Date(camp.sentAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={camp._id} className="history-card">
                <div className="history-card-header">
                  <div>
                    <div className="history-subject">{camp.subject}</div>
                    <span className={`badge ${camp.status}`} style={{ marginTop: '8px' }}>
                      {camp.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {formattedDate}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><Clock size={12} /> {formattedTime}</span>
                  </div>
                </div>

                <div className="history-meta">
                  <div className="history-meta-item">
                    <Users size={14} />
                    <span><strong>{camp.totalEmails}</strong> Recipients</span>
                  </div>
                  <div className="history-meta-item">
                    <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                    <span style={{ color: 'var(--success)' }}><strong>{camp.successCount}</strong> Delivered</span>
                  </div>
                  <div className="history-meta-item">
                    <XCircle size={14} style={{ color: 'var(--error)' }} />
                    <span style={{ color: 'var(--error)' }}><strong>{camp.errorCount}</strong> Failed</span>
                  </div>
                  <div className="history-meta-item">
                    <Server size={14} />
                    <span><strong>SMTP:</strong> {camp.smtpHost} ({camp.smtpUser})</span>
                  </div>
                </div>

                {/* Pill Progress Gauge */}
                <div className="stacked-progress-container">
                  <div className="stacked-bar">
                    <div
                      className="stacked-segment success"
                      style={{ width: `${(camp.successCount / camp.totalEmails) * 100}%` }}
                    />
                    <div
                      className="stacked-segment error"
                      style={{ width: `${(camp.errorCount / camp.totalEmails) * 100}%` }}
                    />
                    <div
                      className="stacked-segment pending"
                      style={{ width: `${((camp.totalEmails - camp.successCount - camp.errorCount) / camp.totalEmails) * 100}%` }}
                    />
                  </div>
                  <div className="stacked-labels">
                    <span>Delivery Success Rate: {successRate}%</span>
                    <span>ID: {camp._id}</span>
                  </div>
                </div>

                <div className="history-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setSelectedCampaign(camp);
                      setModalTab('recipients');
                    }}
                  >
                    <FileText size={13} />
                    View Detailed Logs
                  </button>
                  <button
                    className="btn-danger-outline"
                    onClick={() => deleteCampaignRecord(camp._id)}
                  >
                    <Trash2 size={13} />
                    Delete Log
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Render details modal overlay when selectedCampaign is active */}
      {selectedCampaign && <CampaignDetailsModal />}
    </div>
  );
}
