import React, { useState } from 'react';
import { Lock, User, Loader2, Sparkles } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user details
      localStorage.setItem('crm_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('crm_refresh_token', data.refreshToken);
      }
      localStorage.setItem('crm_user_id', data.user.username);
      localStorage.setItem('crm_user_role', data.user.role);
      localStorage.setItem('crm_tenant_id', data.user.tenantId);

      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            padding: '10px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 199, 44, 0.3)',
            marginBottom: '16px'
          }}>
            <div style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px' }}>
              Crimson
            </div>
          </div>
          <h1>System Authentication</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Please sign in to access the email dispatcher & CRM
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--error-glow)',
            border: '1px solid var(--error)',
            borderRadius: '8px',
            padding: '12px',
            color: 'var(--error)',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label>Username</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
              <User size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '13px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
              <Lock size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '13px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-add-item-row"
            disabled={isLoading}
            style={{
              marginTop: '10px',
              padding: '12px',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              width: '100%'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Hint credentials */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--border)',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '24px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          <div><strong>Demo Administrator Login:</strong></div>
          <div style={{ marginTop: '4px' }}>Username: <span style={{ color: 'var(--secondary)' }}>admin</span></div>
          <div>Password: <span style={{ color: 'var(--secondary)' }}>admin@123</span></div>
        </div>
      </div>
    </div>
  );
}
