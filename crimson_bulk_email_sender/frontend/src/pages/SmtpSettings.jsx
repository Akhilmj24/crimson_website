import React from 'react';
import { Settings, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export default function SmtpSettings() {
  const {
    smtpMode,
    setSmtpMode,
    isSending,
    smtpChecking,
    smtpError,
    serverSmtp,
    customSmtp,
    handleCustomSmtpChange
  } = useCampaign();

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <header>
        <h1>SMTP Settings Profile</h1>
      </header>

      <div className="card">
        <div className="card-title">
          <Settings size={18} />
          SMTP Server Configuration
        </div>

        <div className="mode-select">
          <div
            className={`mode-btn ${smtpMode === 'env' ? 'active' : ''}`}
            onClick={() => !isSending && setSmtpMode('env')}
          >
            Use Server .env
          </div>
          <div
            className={`mode-btn ${smtpMode === 'custom' ? 'active' : ''}`}
            onClick={() => !isSending && setSmtpMode('custom')}
          >
            Custom SMTP
          </div>
        </div>

        {/* Server SMTP Status Check */}
        {smtpMode === 'env' && (
          <div>
            {smtpChecking ? (
              <div className="info-box mock-smtp" style={{ justifyContent: 'center' }}>
                <Loader2 size={16} className="spin" />
                Checking server configurations...
              </div>
            ) : smtpError ? (
              <div className="info-box error-smtp">
                <ShieldAlert size={18} />
                <div>
                  <strong>Status Connection Issue</strong>
                  <p style={{ fontSize: '11px', marginTop: '4px' }}>{smtpError}</p>
                </div>
              </div>
            ) : serverSmtp.configured ? (
              <div className="info-box active-smtp">
                <ShieldCheck size={18} />
                <div>
                  <strong>Active Server SMTP Configured</strong>
                  <p style={{ fontSize: '11px', marginTop: '4px' }}>
                    <strong>Host:</strong> {serverSmtp.smtpHost}:{serverSmtp.smtpPort}<br />
                    <strong>Username:</strong> {serverSmtp.smtpUser}
                  </p>
                </div>
              </div>
            ) : (
              <div className="info-box mock-smtp">
                <ShieldAlert size={18} />
                <div>
                  <strong>Server .env Inactive / Missing</strong>
                  <p style={{ fontSize: '11px', marginTop: '4px' }}>
                    System will operate in <strong>Simulation (Mock) Mode</strong>.
                    Switch to "Custom SMTP" to use physical server overrides.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom SMTP Config Form */}
        {smtpMode === 'custom' && (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div className="form-group">
              <label>SMTP Host</label>
              <input
                type="text"
                value={customSmtp.host}
                onChange={(e) => handleCustomSmtpChange('host', e.target.value)}
                placeholder="smtp.gmail.com"
                disabled={isSending}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Port</label>
                <input
                  type="number"
                  value={customSmtp.port}
                  onChange={(e) => handleCustomSmtpChange('port', e.target.value)}
                  placeholder="587"
                  disabled={isSending}
                />
              </div>
              <div className="form-group checkbox-group" style={{ height: '100%', display: 'flex', alignItems: 'center', marginTop: '22px' }}>
                <input
                  type="checkbox"
                  id="smtp-secure"
                  checked={customSmtp.secure}
                  onChange={(e) => handleCustomSmtpChange('secure', e.target.checked)}
                  disabled={isSending}
                />
                <label htmlFor="smtp-secure" style={{ display: 'inline', margin: '0', cursor: 'pointer' }}>SSL/TLS (465)</label>
              </div>
            </div>

            <div className="form-group">
              <label>Username (Email)</label>
              <input
                type="text"
                value={customSmtp.user}
                onChange={(e) => handleCustomSmtpChange('user', e.target.value)}
                placeholder="your-email@gmail.com"
                disabled={isSending}
              />
            </div>

            <div className="form-group">
              <label>Password (App Password)</label>
              <input
                type="password"
                value={customSmtp.pass}
                onChange={(e) => handleCustomSmtpChange('pass', e.target.value)}
                placeholder="your-app-password"
                disabled={isSending}
              />
            </div>

            <div className="form-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
              <label>From Display Name</label>
              <input
                type="text"
                value={customSmtp.fromName}
                onChange={(e) => handleCustomSmtpChange('fromName', e.target.value)}
                disabled={isSending}
              />
            </div>

            <div className="form-group">
              <label>From Email Address</label>
              <input
                type="text"
                value={customSmtp.fromEmail}
                onChange={(e) => handleCustomSmtpChange('fromEmail', e.target.value)}
                disabled={isSending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
