import React, { useState } from 'react';
import { Lock, User, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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
      localStorage.setItem('crm_user_name', data.user.name || data.user.username);
      localStorage.setItem('crm_user_role', data.user.role);
      localStorage.setItem('crm_tenant_id', data.user.tenantId);
      localStorage.setItem('crm_custom_permissions', JSON.stringify(data.user.customPermissions || {}));

      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="card w-full max-w-[420px] p-10">
        <div className="text-center mb-8">
          <div className="">
            <img src="/logo-op.png" alt="Logo" className="h-20 w-20 object-contain" />
          </div>
          <h1>System Authentication</h1>
          <p className="text-text-secondary text-[13px] mt-1">
            Please sign in to access the email dispatcher & CRM
          </p>
        </div>

        {error && (
          <div className="bg-error-glow border border-error rounded-lg p-3 text-error text-[13px] mb-5 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label>Username</label>
            <div className="flex items-center gap-2 bg-black/20 border border-border rounded-lg px-3 py-2">
              <User size={16} className="text-text-muted" />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent border-0 text-text-primary outline-none w-full text-[13px]"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="flex items-center gap-2 bg-black/20 border border-border rounded-lg px-3 py-2">
              <Lock size={16} className="text-text-muted shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-0 text-text-primary outline-none w-full text-[13px]"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-muted hover:text-text-primary focus:outline-none shrink-0"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-add-item-row mt-2.5 p-3 justify-center font-bold text-sm w-full"
            disabled={isLoading}
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
        {/* <div className="bg-white/[0.02] border border-dashed border-border rounded-lg p-3 mt-6 text-[11px] text-text-muted text-center">
          <div><strong>Demo Administrator Login:</strong></div>
          <div className="mt-1">Username: <span className="text-secondary">admin</span></div>
          <div>Password: <span className="text-secondary">admin@123</span></div>
        </div> */}
      </div>
    </div>
  );
}
