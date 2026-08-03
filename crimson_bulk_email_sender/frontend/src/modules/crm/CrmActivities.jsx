import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Phone, Mail, Users, MessageSquare, Plus, Clock, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function CrmActivities() {
  const {
    activities,
    leads,
    contacts,
    companies,
    isLoading,
    fetchActivities,
    createActivity,
    fetchLeads,
    fetchContacts,
    fetchCompanies
  } = useCrm();

  const [formData, setFormData] = useState({
    type: 'Call', // Call, Meeting, Email, Note, WhatsApp, Task
    title: '',
    description: '',
    customerSelection: '' // format: "customerModel:customerId"
  });

  useEffect(() => {
    fetchActivities();
    fetchLeads({ limit: 100 });
    fetchContacts({ limit: 100 });
    fetchCompanies({ limit: 100 });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Activity Title is required');
      return;
    }

    let payload = {
      type: formData.type,
      title: formData.title,
      description: formData.description
    };

    if (formData.customerSelection) {
      const [model, id] = formData.customerSelection.split(':');
      payload.customerModel = model;
      payload.customer = id;
    }

    try {
      await createActivity(payload);
      setFormData({
        type: 'Call',
        title: '',
        description: '',
        customerSelection: ''
      });
      alert('Activity logged successfully');
      fetchActivities();
    } catch (err) {
      alert(err.message || 'Error logging activity');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Call': return <Phone size={14} />;
      case 'Meeting': return <Users size={14} />;
      case 'Email': return <Mail size={14} />;
      case 'WhatsApp': return <MessageCircle size={14} />;
      case 'Note': return <MessageSquare size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'Call': return '#3b82f6';
      case 'Meeting': return '#10b981';
      case 'Email': return '#ec4899';
      case 'WhatsApp': return '#25d366';
      case 'Note': return 'var(--secondary)';
      default: return 'var(--text-muted)';
    }
  };

  // Compile options list for Customer association
  const customerOptions = [
    ...leads.map(l => ({ id: l._id, name: `${l.name} (Lead)`, model: 'Lead' })),
    ...contacts.map(c => ({ id: c._id, name: `${c.name} (Contact)`, model: 'Contact' })),
    ...companies.map(co => ({ id: co._id, name: `${co.name} (Company)`, model: 'Company' }))
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Activity Logs & Interactions</h1>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* Left Side: Form to Log Interaction */}
        <div>
          <div className="card">
            <div className="card-title">
              <Plus size={16} />
              Log New Interaction
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Interaction Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="invoice-form-item-input"
                  style={{ height: '36px' }}
                >
                  <option value="Call">📞 Call / Telephone</option>
                  <option value="Meeting">🤝 Meeting</option>
                  <option value="Email">📧 E-mail Sent</option>
                  <option value="WhatsApp">💬 WhatsApp Message</option>
                  <option value="Note">📝 General Notes / Internal Log</option>
                  <option value="Task">⏱️ Task update</option>
                </select>
              </div>

              <div className="form-group">
                <label>Associated Client (Optional)</label>
                <select
                  value={formData.customerSelection}
                  onChange={(e) => setFormData({ ...formData, customerSelection: e.target.value })}
                  className="invoice-form-item-input"
                  style={{ height: '36px' }}
                >
                  <option value="">No associated client</option>
                  {customerOptions.map(c => (
                    <option key={`${c.model}:${c.id}`} value={`${c.model}:${c.id}`}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Title / Subject *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="invoice-form-item-input"
                  placeholder="e.g. Discussed bulk jackfruit chips MOQ pricing"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description / Details</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="invoice-form-item-input"
                  rows="4"
                  placeholder="Enter details of conversation or notes..."
                />
              </div>

              <button type="submit" className="btn-add-item-row" style={{ marginTop: '10px' }}>
                Save Log Entry
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Timeline View */}
        <div>
          <div className="card">
            <div className="card-title">
              <Clock size={16} />
              Chronological Interaction Timeline
            </div>

            {isLoading && activities.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)', margin: '0 auto 12px' }} />
                <p>Loading timeline details...</p>
              </div>
            ) : activities.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No interaction logs recorded. Use the form to log your first client call or meeting notes!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '14px' }}>
                {/* Vertical timeline line */}
                <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '26px', width: '2px', background: 'var(--border)' }}></div>

                {activities.map((act) => {
                  const iconColor = getColor(act.type);
                  const actDate = new Date(act.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  const actTime = new Date(act.timestamp).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={act._id} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1 }}>
                      {/* Left Icon circle */}
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'var(--bg-dark)',
                        border: `2px solid ${iconColor}`,
                        color: iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 10px rgba(0,0,0,0.5)`
                      }}>
                        {getIcon(act.type)}
                      </div>

                      {/* Content block */}
                      <div style={{ flexGrow: 1, background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{act.title}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{actDate} at {actTime}</span>
                        </div>

                        {act.description && (
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'pre-line' }}>
                            {act.description}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.03)', marginTop: '10px', paddingTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <span>
                            {act.customer ? (
                              <span>Client: <strong style={{ color: 'var(--secondary)' }}>{act.customer.name}</strong> ({act.customerModel})</span>
                            ) : (
                              <span>Client: <em>None</em></span>
                            )}
                          </span>
                          <span>Logged by: {act.createdBy}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
