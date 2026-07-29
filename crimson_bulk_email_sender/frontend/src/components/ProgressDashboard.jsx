import React from 'react';
import { TrendingUp, Loader2, Terminal, Trash2, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export default function ProgressDashboard() {
  const {
    isSending,
    progressText,
    progressPercent,
    stats,
    logs,
    clearLogs,
    logContainerRef,
    recipientsStatus
  } = useCampaign();

  return (
    <div className="card progress-section">
      <div className="card-title">
        <TrendingUp size={18} />
        Transmission Progress Dashboard
      </div>

      <div className="progress-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSending && <Loader2 size={14} className="spin" style={{ color: 'var(--info)' }} />}
          {progressText}
        </span>
        <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{progressPercent}%</span>
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-val">{stats.total}</div>
          <div className="stat-lbl">Queue Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: isSending ? 'var(--info)' : 'var(--text-primary)' }}>
            {stats.sent}
          </div>
          <div className="stat-lbl">Processed</div>
        </div>
        <div className="stat-card" style={{ boxShadow: stats.success > 0 ? '0 0 10px rgba(16, 185, 129, 0.1)' : 'none' }}>
          <div className="stat-val" style={{ color: 'var(--success)' }}>{stats.success}</div>
          <div className="stat-lbl">Success</div>
        </div>
        <div className="stat-card" style={{ boxShadow: stats.error > 0 ? '0 0 10px rgba(239, 68, 68, 0.1)' : 'none' }}>
          <div className="stat-val" style={{ color: 'var(--error)' }}>{stats.error}</div>
          <div className="stat-lbl">Failed</div>
        </div>
      </div>

      {/* Activity Log console */}
      <div className="form-group" style={{ marginBottom: '24px' }}>
        <div className="log-header-container">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0' }}>
            <Terminal size={14} />
            Activity Log
          </label>
          {logs.length > 0 && (
            <button className="log-clear-btn" onClick={clearLogs} disabled={isSending}>
              <Trash2 size={11} /> Clear Logs
            </button>
          )}
        </div>
        <div className="log-container" ref={logContainerRef}>
          {logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.type}`}>
              <span className="log-time">[{log.time}]</span>
              <span className="log-content">{log.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recipients Live Status Table */}
      {recipientsStatus.length > 0 && (
        <div className="recipients-list-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div className="recipients-header">
            <Users size={16} />
            Recipient Dispatch Status
          </div>
          <div className="recipients-table-wrapper">
            <table className="recipients-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Recipient Address</th>
                  <th>Delivery Status</th>
                  <th>Server Response / Status Message</th>
                </tr>
              </thead>
              <tbody>
                {recipientsStatus.map((item, index) => (
                  <tr key={index}>
                    <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                    <td style={{ fontWeight: '500' }}>{item.email}</td>
                    <td>
                      <span className={`badge ${item.status}`}>
                        {item.status === 'sending' && <Loader2 size={10} className="spin" />}
                        {item.status === 'success' && <CheckCircle2 size={10} />}
                        {item.status === 'error' && <XCircle size={10} />}
                        {item.status}
                      </span>
                    </td>
                    <td style={{
                      color: item.status === 'success' ? 'var(--success)' : item.status === 'error' ? 'var(--error)' : 'var(--text-secondary)',
                      fontSize: '12px'
                    }}>
                      {item.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
