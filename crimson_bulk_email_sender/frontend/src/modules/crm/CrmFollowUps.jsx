import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Plus, Trash2, Calendar, Clock, Loader2, Sparkles, Bell } from 'lucide-react';

export default function CrmFollowUps() {
  const {
    followUps,
    leads,
    contacts,
    companies,
    isLoading,
    fetchFollowUps,
    createFollowUp,
    deleteFollowUp,
    fetchLeads,
    fetchContacts,
    fetchCompanies
  } = useCrm();

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reminder: '',
    customerSelection: '' // format: "customerModel:customerId"
  });

  useEffect(() => {
    fetchFollowUps();
    fetchLeads({ limit: 100 });
    fetchContacts({ limit: 100 });
    fetchCompanies({ limit: 100 });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.date) {
      alert('Follow up Date is required');
      return;
    }
    if (!formData.time) {
      alert('Follow up Time is required');
      return;
    }
    if (!formData.customerSelection) {
      alert('Customer selection is required');
      return;
    }

    const [model, id] = formData.customerSelection.split(':');
    const payload = {
      date: new Date(formData.date),
      time: formData.time,
      reminder: formData.reminder,
      customerModel: model,
      customer: id
    };

    try {
      await createFollowUp(payload);
      setFormData({
        date: '',
        time: '',
        reminder: '',
        customerSelection: ''
      });
      alert('Follow up scheduled successfully');
      fetchFollowUps();
    } catch (err) {
      alert(err.message || 'Error scheduling follow-up');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this follow-up?')) {
      try {
        await deleteFollowUp(id);
        fetchFollowUps();
      } catch (err) {
        alert(err.message || 'Error deleting follow-up');
      }
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
          <h1>Follow Up Scheduler</h1>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* Left Side: Schedule Follow Up Form */}
        <div>
          <div className="card">
            <div className="card-title">
              <Plus size={16} />
              Schedule Follow Up
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Target Customer *</label>
                <select
                  value={formData.customerSelection}
                  onChange={(e) => setFormData({ ...formData, customerSelection: e.target.value })}
                  className="invoice-form-item-input"
                  style={{ height: '36px' }}
                  required
                >
                  <option value="">Select Lead, Contact, or Company</option>
                  {customerOptions.map(c => (
                    <option key={`${c.model}:${c.id}`} value={`${c.model}:${c.id}`}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="invoice-form-item-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Time *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="invoice-form-item-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Reminder Note / Subject</label>
                <textarea
                  value={formData.reminder}
                  onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                  className="invoice-form-item-input"
                  rows="3"
                  placeholder="e.g. Call to finalize digital printing layout pricing..."
                />
              </div>

              <button type="submit" className="btn-add-item-row" style={{ marginTop: '10px' }}>
                Schedule Check-in
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Follow Ups List */}
        <div>
          <div className="card">
            <div className="card-title">
              <Bell size={16} />
              Follow Ups Queue
            </div>

            {isLoading && followUps.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)', margin: '0 auto 12px' }} />
                <p>Loading follow ups queue...</p>
              </div>
            ) : followUps.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No follow ups scheduled.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {followUps.map((follow) => {
                  const followDate = new Date(follow.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  return (
                    <div
                      key={follow._id}
                      className="card"
                      style={{ padding: '16px', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', gap: '16px' }}
                    >
                      <div style={{ background: 'rgba(255,199,44,0.15)', padding: '10px', borderRadius: '50%', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bell size={16} />
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                          {follow.customer?.name || 'Client Check-in'}
                        </div>
                        {follow.reminder && (
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{follow.reminder}</div>
                        )}
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {followDate}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {follow.time}</span>
                          <span>Source: {follow.customerModel}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(follow._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}>
                        <Trash2 size={16} />
                      </button>
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
