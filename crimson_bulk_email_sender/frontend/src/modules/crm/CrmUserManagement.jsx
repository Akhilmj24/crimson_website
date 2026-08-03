import React, { useState, useEffect } from 'react';
import { crmService } from '../../services/crmService';
import { Plus, Trash2, Key, Loader2, Users, ShieldAlert } from 'lucide-react';

export default function CrmUserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Agent');
  const [tenantId, setTenantId] = useState('default-tenant');

  // Get current user role
  const currentUserRole = localStorage.getItem('crm_user_role') || 'Agent';
  const isAuthorized = currentUserRole === 'super_admin' || currentUserRole === 'Admin';

  const fetchUsersList = async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await crmService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load users list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        username: username.trim(),
        password,
        role
      };

      if (currentUserRole === 'super_admin') {
        payload.tenantId = tenantId.trim();
      }

      await crmService.createUser(payload);
      alert('User account created successfully!');

      // Clear form
      setUsername('');
      setPassword('');
      setRole('Agent');

      // Reload list
      fetchUsersList();
    } catch (err) {
      alert(err.message || 'Failed to create user account');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await crmService.deleteUser(id);
        alert('User account deleted.');
        fetchUsersList();
      } catch (err) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  if (!isAuthorized) {
    return (
      <div className="empty-state" style={{ borderColor: 'var(--error)' }}>
        <ShieldAlert size={36} style={{ color: 'var(--error)' }} />
        <h3>Access Denied</h3>
        <p>You do not have permission to view this page. User management is restricted to Administrators.</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>User Accounts & Staff Access</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Logged in as: <strong style={{ color: 'var(--secondary)' }}>{currentUserRole}</strong>
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Left Column: Create User Form */}
        <div>
          <div className="card">
            <div className="card-title">
              <Plus size={16} />
              Create Staff Account
            </div>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Akhil"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  className="invoice-form-item-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="invoice-form-item-input"
                  style={{ height: '36px' }}
                  required
                >
                  {(currentUserRole === 'super_admin' || currentUserRole === 'Admin') && (
                    <option value="Admin">Admin (All features except managing other super_admins)</option>
                  )}
                  <option value="Manager">Manager (CRM CRUD + settings, no reports)</option>
                  <option value="Agent">Agent (CRM CRUD only, no settings or reports)</option>
                </select>
              </div>

              {currentUserRole === 'super_admin' && (
                <div className="form-group">
                  <label>Tenant ID *</label>
                  <input
                    type="text"
                    className="invoice-form-item-input"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    placeholder="e.g. default-tenant"
                    required
                  />
                </div>
              )}

              <button type="submit" className="btn-add-item-row" style={{ marginTop: '10px' }}>
                <Key size={14} />
                Create Account
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Users List */}
        <div>
          <div className="card" style={{ padding: 0 }}>
            <div className="card-title" style={{ margin: '24px 24px 12px 24px', borderBottom: 'none', padding: 0 }}>
              <Users size={16} />
              Active Accounts
            </div>

            {isLoading && users.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)', margin: '0 auto 12px' }} />
                <p>Loading accounts list...</p>
              </div>
            ) : error ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--error)' }}>
                {error}
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active accounts found in this tenant.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-secondary)' }}>Username</th>
                      <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Access Role</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-secondary)' }}>Tenant ID</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-secondary)' }}>Created By</th>
                      <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{user.username}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                          <span className={`badge ${user.role === 'super_admin' ? 'sending' : user.role === 'Admin' ? 'success' : 'completed'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>{user.tenantId}</td>
                        <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>{user.createdBy}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                          {user.username === 'admin' ? (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Locked</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(user._id, user.username)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              title="Delete Account"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
