import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Save, Plus, Trash2, Key, Settings, RefreshCw, Shield, Users } from 'lucide-react';
import Dropdown from '../../components/Dropdown';

export default function CrmSettings() {
  const {
    settings,
    isLoading,
    fetchSettings,
    updateSettings,
    currentTenant,
    setCurrentTenant,
    currentUser,
    setCurrentUser,
    currentUserRole,
    setCurrentUserRole
  } = useCrm();

  // Settings form states
  const [sourcesText, setSourcesText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [stagesText, setStagesText] = useState('');

  // Active testing credentials states
  const [testTenant, setTestTenant] = useState(currentTenant);
  const [testUser, setTestUser] = useState(currentUser);
  const [testRole, setTestRole] = useState(currentUserRole);

  useEffect(() => {
    fetchSettings().then(res => {
      if (res) {
        setSourcesText(res.leadSources ? res.leadSources.join(', ') : '');
        setTagsText(res.tags ? res.tags.join(', ') : '');
        setStagesText(res.dealStages ? res.dealStages.join(', ') : '');
      }
    });
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const payload = {
      leadSources: sourcesText.split(',').map(s => s.trim()).filter(Boolean),
      tags: tagsText.split(',').map(t => t.trim()).filter(Boolean),
      dealStages: stagesText.split(',').map(st => st.trim()).filter(Boolean)
    };

    try {
      await updateSettings(payload);
      alert('CRM Settings saved successfully!');
    } catch (err) {
      alert(err.message || 'Error saving settings');
    }
  };

  const handleSaveTestCredentials = (e) => {
    e.preventDefault();
    setCurrentTenant(testTenant);
    setCurrentUser(testUser);
    setCurrentUserRole(testRole);
    alert('Test Context updated successfully! Reloading CRM data...');
    // reload page to apply new headers
    window.location.reload();
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>CRM Settings</h1>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        
        {/* Left Column: CRM Custom Fields / Pipelines */}
        <div>
          <div className="card">
            <div className="card-title">
              <Settings size={16} />
              CRM Taxonomy Customization
            </div>
            
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label>Lead Sources (comma separated)</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={sourcesText}
                  onChange={(e) => setSourcesText(e.target.value)}
                  placeholder="Website, Referral, Event, Partner"
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Defines dropdown choices for lead acquisition source.</span>
              </div>

              <div className="form-group">
                <label>CRM Contact Tags (comma separated)</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="Warm, Cold, Enterprise, SMB, VIP"
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Labels to tag leads and contacts.</span>
              </div>

              <div className="form-group">
                <label>Deal Stages / Sales Pipeline (comma separated)</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={stagesText}
                  onChange={(e) => setStagesText(e.target.value)}
                  placeholder="New, Contacted, Proposal, Negotiation, Won, Lost"
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Defines the Kanban board columns and pipeline tracking.</span>
              </div>

              <button type="submit" className="btn-add-item-row" disabled={isLoading} style={{ marginTop: '10px', width: 'auto', display: 'inline-flex', alignSelf: 'flex-start', padding: '10px 24px' }}>
                <Save size={14} />
                Save CRM Taxonomy
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Testing Credentials & Context (Roles/Tenants) */}
        <div>
          <div className="card">
            <div className="card-title">
              <Shield size={16} />
              Active User Context (Tenant & Role Sim)
            </div>
            
            <div style={{ background: 'rgba(153, 15, 2, 0.05)', border: '1px dashed var(--primary-light)', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Configure your simulation headers below to test permissions (`Admin`, `Manager`, `Agent`) and database tenant separation.
            </div>

            <form onSubmit={handleSaveTestCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Active Tenant ID</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={testTenant}
                  onChange={(e) => setTestTenant(e.target.value)}
                  placeholder="e.g. default-tenant"
                  required
                />
              </div>

              <div className="form-group">
                <label>Simulated Username / ID</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={testUser}
                  onChange={(e) => setTestUser(e.target.value)}
                  placeholder="e.g. Akhil"
                  required
                />
              </div>

              <div className="form-group">
                <label>Simulated Permission Role</label>
                <Dropdown
                  options={[
                    { value: 'Admin', label: 'Admin (Full Access to Dashboard, Leads, Contacts, Deals, Reports, Settings)' },
                    { value: 'Manager', label: 'Manager (Access to CRM CRUDs, read reports, read/edit settings)' },
                    { value: 'Agent', label: 'Agent (Can only view/edit owned leads/deals. No Settings or Reports)' }
                  ]}
                  value={testRole}
                  onChange={(val) => setTestRole(val)}
                  searchable={false}
                  selectStyle={{ height: '36px' }}
                />
              </div>

              <button type="submit" className="btn-add-item-row" style={{ marginTop: '10px', width: 'auto', display: 'inline-flex', alignSelf: 'flex-start', padding: '10px 24px', borderColor: 'var(--secondary)' }}>
                <Key size={14} />
                Switch Session User
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
