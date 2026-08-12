import React, { useState, useEffect } from 'react';
import { crmService } from '../../services/crmService';
import { Plus, Trash2, Key, Loader2, Users, ShieldAlert, XCircle, ShieldCheck, CheckSquare, Square, Save, Eye, EyeOff } from 'lucide-react';
import Dropdown from '../../components/Dropdown';
import SalutationDropdown from '../../components/SalutationDropdown';

const ALL_RESOURCES = [
  'campaign.dispatcher',
  'campaign.settings',
  'campaign.history',
  'docs.invoice',
  'docs.proposal',
  'docs.history',
  'products.list',
  'crm.dashboard',
  'crm.leads',
  'crm.contacts',
  'crm.companies',
  'crm.deals',
  'crm.tasks',
  'crm.activities',
  'crm.reports',
  'crm.settings',
  'crm.orders',
  'crm.accounts',
  'crm.expenses'
];

const ALL_ACTIONS = ['view', 'create', 'edit', 'delete'];

// Define permission mapping for each role for UI display
const ROLE_PERMISSIONS = {
  super_admin: {
    '*': ['view', 'create', 'edit', 'delete'] 
  },
  Admin: {
    '*': ['view', 'create', 'edit', 'delete'] 
  },
  Manager: {
    'campaign.dispatcher': ['view', 'create', 'edit', 'delete'],
    'campaign.settings': ['view', 'edit'],
    'campaign.history': ['view'],
    'docs.invoice': ['view', 'create', 'edit', 'delete'],
    'docs.proposal': ['view', 'create', 'edit', 'delete'],
    'docs.history': ['view', 'create', 'edit', 'delete'],
    'products.list': ['view', 'create', 'edit', 'delete'],
    'crm.dashboard': ['view'],
    'crm.leads': ['view', 'create', 'edit', 'delete'],
    'crm.contacts': ['view', 'create', 'edit', 'delete'],
    'crm.companies': ['view', 'create', 'edit', 'delete'],
    'crm.deals': ['view', 'create', 'edit', 'delete'],
    'crm.tasks': ['view', 'create', 'edit', 'delete'],
    'crm.activities': ['view', 'create', 'edit', 'delete'],
    'crm.reports': ['view'],
    'crm.settings': ['view', 'edit'],
    'crm.orders': ['view', 'create', 'edit', 'delete'],
    'crm.accounts': ['view', 'create', 'edit'],
    'crm.expenses': ['view', 'create', 'edit', 'delete']
  },
  Agent: {
    'campaign.dispatcher': ['view', 'create', 'edit'],
    'campaign.settings': [],
    'campaign.history': ['view'],
    'docs.invoice': ['view', 'create', 'edit'],
    'docs.proposal': ['view', 'create', 'edit'],
    'docs.history': ['view', 'create', 'edit'],
    'products.list': ['view', 'create', 'edit'],
    'crm.dashboard': ['view'],
    'crm.leads': ['view', 'create', 'edit'],
    'crm.contacts': ['view', 'create', 'edit'],
    'crm.companies': ['view'],
    'crm.deals': ['view', 'create', 'edit'],
    'crm.tasks': ['view', 'create', 'edit'],
    'crm.activities': ['view', 'create', 'edit'],
    'crm.reports': [],
    'crm.settings': [],
    'crm.orders': ['view', 'create', 'edit'],
    'crm.accounts': ['view', 'create'],
    'crm.expenses': ['view', 'create']
  }
};

export default function CrmUserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState(null);
  const [editedPermissions, setEditedPermissions] = useState({});
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const handleUserClick = (user) => {
    setSelectedUserPermissions(user);
    setIsEditingPermissions(false);
    
    // Initialize editable permissions state
    let initialPerms = {};
    if (user.customPermissions && Object.keys(user.customPermissions).length > 0) {
      initialPerms = { ...user.customPermissions };
    } else {
      const rolePerms = ROLE_PERMISSIONS[user.role] || {};
      if (rolePerms['*']) {
        ALL_RESOURCES.forEach(res => {
          initialPerms[res] = [...rolePerms['*']];
        });
      } else {
        initialPerms = { ...rolePerms };
      }
    }
    
    // Ensure all resources exist in initialPerms for checkboxes to render properly
    ALL_RESOURCES.forEach(res => {
       if (!initialPerms[res]) initialPerms[res] = [];
    });

    setEditedPermissions(initialPerms);
  };

  const togglePermission = (resource, action) => {
    setEditedPermissions(prev => {
      const current = prev[resource] || [];
      const updated = current.includes(action) 
        ? current.filter(a => a !== action)
        : [...current, action];
      return { ...prev, [resource]: updated };
    });
  };

  const handleSavePermissions = async () => {
    setIsSavingPermissions(true);
    try {
      await crmService.updateUserPermissions(selectedUserPermissions._id, editedPermissions);
      // Update local state to reflect new permissions immediately without refetch
      setUsers(users.map(u => u._id === selectedUserPermissions._id ? { ...u, customPermissions: editedPermissions } : u));
      alert('Permissions saved successfully.');
      setIsEditingPermissions(false);
      setSelectedUserPermissions({ ...selectedUserPermissions, customPermissions: editedPermissions });
    } catch (err) {
      alert(err.message || 'Failed to save permissions');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // Form State
  const [username, setUsername] = useState('');
  const [salutation, setSalutation] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        salutation: salutation,
        name: name.trim(),
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
      setSalutation('');
      setName('');
      setPassword('');
      setShowPassword(false);
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
                <label>Full Name</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '120px', flexShrink: 0 }}>
                    <SalutationDropdown
                      value={salutation}
                      onChange={(val) => setSalutation(val)}
                    />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <input
                      type="text"
                      className="invoice-form-item-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Akhil M J"
                    />
                  </div>
                </div>
              </div>

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
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', paddingRight: '10px' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    style={{ border: 'none', background: 'transparent', width: '100%' }}
                    className="invoice-form-item-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Role *</label>
                <Dropdown
                  options={[
                    ...(currentUserRole === 'super_admin' || currentUserRole === 'Admin' ? [
                      { value: 'Admin', label: 'Admin (All features except managing other super_admins)' }
                    ] : []),
                    { value: 'Manager', label: 'Manager (CRM CRUD + settings, no reports)' },
                    { value: 'Agent', label: 'Agent (CRM CRUD only, no settings or reports)' }
                  ]}
                  value={role}
                  onChange={(val) => setRole(val)}
                  searchable={false}
                  selectStyle={{ height: '36px' }}
                />
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
                <div className="overflow-x-auto w-full max-w-full custom-scrollbar"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-secondary)' }}>Name</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-secondary)' }}>Username</th>
                      <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Access Role</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-secondary)' }}>Tenant ID</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-secondary)' }}>Created By</th>
                      <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr 
                        key={user._id} 
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer' }}
                        onClick={() => handleUserClick(user)}
                        className="hover-row"
                      >
                        <td style={{ padding: '12px 20px', color: 'var(--text-primary)' }}>{user.salutation ? `${user.salutation} ${user.name}` : (user.name || 'N/A')}</td>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user._id, user.username);
                              }}
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
                </table></div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Permissions Modal */}
      {selectedUserPermissions && (
        <div className="modal-overlay" onClick={() => setSelectedUserPermissions(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={24} style={{ color: 'var(--secondary)' }} />
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 'bold' }}>
                    Permissions for {selectedUserPermissions.username}
                  </h2>
                  <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Role: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{selectedUserPermissions.role}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {currentUserRole === 'super_admin' && (
                  !isEditingPermissions ? (
                    <button className="btn-add-item-row" onClick={() => setIsEditingPermissions(true)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Edit Permissions
                    </button>
                  ) : (
                    <>
                      <button className="btn-add-item-row" style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' }} onClick={() => {
                          handleUserClick(selectedUserPermissions);
                          setIsEditingPermissions(false);
                        }}>
                        Cancel
                      </button>
                      <button className="btn-add-item-row" onClick={handleSavePermissions} disabled={isSavingPermissions} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--secondary)', color: 'black' }}>
                        {isSavingPermissions ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                        Save
                      </button>
                    </>
                  )
                )}
                <button className="modal-close-btn" onClick={() => setSelectedUserPermissions(null)}>
                  <XCircle size={22} />
                </button>
              </div>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div className="overflow-x-auto w-full max-w-full custom-scrollbar"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Resource Module</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>View</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Create</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Edit</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_RESOURCES.map((resource, idx) => (
                      <tr key={resource} style={{ borderBottom: idx === ALL_RESOURCES.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                          {resource}
                        </td>
                        {ALL_ACTIONS.map(action => {
                          const hasPerm = (editedPermissions[resource] || []).includes(action);
                          return (
                            <td key={action} style={{ padding: '12px 16px', textAlign: 'center' }}>
                              {isEditingPermissions ? (
                                <button 
                                  onClick={() => togglePermission(resource, action)}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: hasPerm ? 'var(--secondary)' : 'var(--text-muted)' }}
                                >
                                  {hasPerm ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                              ) : (
                                hasPerm ? (
                                  <span style={{ 
                                    display: 'inline-block',
                                    width: '8px', height: '8px', 
                                    borderRadius: '50%', 
                                    background: action === 'delete' ? '#ef4444' : '#3b82f6',
                                    boxShadow: `0 0 5px ${action === 'delete' ? '#ef4444' : '#3b82f6'}`
                                  }}></span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>-</span>
                                )
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
              <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                These custom permissions override default role settings for this specific user.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
