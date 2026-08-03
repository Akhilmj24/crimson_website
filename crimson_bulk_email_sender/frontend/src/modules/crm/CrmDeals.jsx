import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Plus, Edit, Trash2, X, Loader2, Calendar, DollarSign, MessageSquare, Clock } from 'lucide-react';

export default function CrmDeals() {
  const {
    deals,
    leads,
    contacts,
    companies,
    settings,
    isLoading,
    fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    fetchLeads,
    fetchContacts,
    fetchCompanies,
    fetchSettings
  } = useCrm();

  // Kanban Columns (Deal Stages)
  const defaultStages = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const stagesList = settings?.dealStages || defaultStages;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    customerSelection: '', // format: "customerModel:customerId"
    value: 0,
    closingDate: '',
    stage: 'New',
    assignedUser: '',
    notes: ''
  });

  // Timeline view modal
  const [activeTimelineDeal, setActiveTimelineDeal] = useState(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchDeals();
    fetchLeads({ limit: 100 });
    fetchContacts({ limit: 100 });
    fetchCompanies({ limit: 100 });
    fetchSettings();
  }, []);

  const handleOpenCreate = (stage = 'New') => {
    setCurrentDeal(null);
    setFormData({
      name: '',
      customerSelection: '',
      value: 0,
      closingDate: '',
      stage: stage,
      assignedUser: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (deal) => {
    setCurrentDeal(deal);
    setFormData({
      name: deal.name || '',
      customerSelection: deal.customer ? `${deal.customerModel}:${deal.customer._id || deal.customer}` : '',
      value: deal.value || 0,
      closingDate: deal.closingDate ? new Date(deal.closingDate).toISOString().split('T')[0] : '',
      stage: deal.stage || 'New',
      assignedUser: deal.assignedUser || '',
      notes: deal.notes ? deal.notes.join(' | ') : ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Deal Name is required');
      return;
    }
    if (!formData.customerSelection) {
      alert('Customer assignment is required');
      return;
    }

    const [customerModel, customerId] = formData.customerSelection.split(':');
    const payload = {
      name: formData.name,
      customer: customerId,
      customerModel: customerModel,
      value: Number(formData.value) || 0,
      closingDate: formData.closingDate ? new Date(formData.closingDate) : null,
      stage: formData.stage,
      assignedUser: formData.assignedUser,
      notes: formData.notes.split('|').map(n => n.trim()).filter(Boolean)
    };

    try {
      if (currentDeal) {
        await updateDeal(currentDeal._id, payload);
      } else {
        await createDeal(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Error saving deal');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await deleteDeal(id);
      } catch (err) {
        alert(err.message || 'Error deleting deal');
      }
    }
  };

  // Drag and Drop implementation
  const handleDragStart = (e, dealId) => {
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    const deal = deals.find(d => d._id === dealId);
    if (deal && deal.stage !== targetStage) {
      try {
        await updateDeal(dealId, {
          ...deal,
          customer: deal.customer?._id || deal.customer,
          stage: targetStage
        });
      } catch (err) {
        alert(err.message || 'Error dropping deal');
      }
    }
  };

  // Timeline notes operations
  const handleOpenTimeline = (deal) => {
    setActiveTimelineDeal(deal);
    setNewNote('');
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const updatedNotes = [...(activeTimelineDeal.notes || []), newNote.trim()];
    try {
      const updatedDeal = await updateDeal(activeTimelineDeal._id, {
        ...activeTimelineDeal,
        customer: activeTimelineDeal.customer?._id || activeTimelineDeal.customer,
        notes: updatedNotes
      });
      setActiveTimelineDeal(updatedDeal);
      setNewNote('');
    } catch (err) {
      alert(err.message || 'Error adding note to deal timeline');
    }
  };

  // Aggregate options list for Customers
  const customerOptions = [
    ...leads.map(l => ({ id: l._id, name: `${l.name} (Lead)`, model: 'Lead' })),
    ...contacts.map(c => ({ id: c._id, name: `${c.name} (Contact)`, model: 'Contact' })),
    ...companies.map(co => ({ id: co._id, name: `${co.name} (Company)`, model: 'Company' }))
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Sales Pipeline</h1>
        </div>
        <button className="btn-add-item-row" onClick={() => handleOpenCreate('New')} style={{ marginTop: 0, width: 'auto' }}>
          <Plus size={16} />
          Add Deal
        </button>
      </header>

      {/* Kanban Board */}
      {isLoading && deals.length === 0 ? (
        <div className="empty-state">
          <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)' }} />
          <p>Loading sales board...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stagesList.length}, 1fr)`, gap: '16px', minHeight: '600px', overflowX: 'auto', paddingBottom: '20px' }}>
          {stagesList.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage);
            const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

            return (
              <div
                key={stage}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
                style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                {/* Stage Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{stage}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      ₹{totalValue.toLocaleString('en-IN')} ({stageDeals.length})
                    </div>
                  </div>
                  <button onClick={() => handleOpenCreate(stage)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex' }}>
                    <Plus size={14} />
                  </button>
                </div>

                {/* Deal Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1, overflowY: 'auto' }}>
                  {stageDeals.map(deal => {
                    const closeDate = deal.closingDate ? new Date(deal.closingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : null;
                    return (
                      <div
                        key={deal._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal._id)}
                        className="card"
                        style={{ padding: '14px', background: 'var(--bg-card-hover)', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: '8px' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{deal.name}</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => handleOpenEdit(deal)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>
                              <Edit size={12} />
                            </button>
                            <button onClick={() => handleDelete(deal._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {deal.customer?.name || 'Unknown Client'}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '12px' }}>
                          <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>
                            ₹{deal.value?.toLocaleString('en-IN')}
                          </span>
                          
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button onClick={() => handleOpenTimeline(deal)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }} title="View Timeline Notes">
                              <MessageSquare size={12} />
                              <span style={{ fontSize: '10px' }}>{deal.notes?.length || 0}</span>
                            </button>
                            {closeDate && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--text-muted)', fontSize: '10px' }}>
                                <Calendar size={10} />
                                {closeDate}
                              </span>
                            )}
                          </div>
                        </div>
                        {deal.assignedUser && (
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'right', borderTop: '1px dashed rgba(255,255,255,0.03)', paddingTop: '4px' }}>
                            Assigned: {deal.assignedUser}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>{currentDeal ? 'Edit Deal' : 'Add New Deal'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Deal Name *</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 5,000 pouches matte printing order"
                  required
                />
              </div>

              <div className="form-group">
                <label>Associated Customer *</label>
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
                <label>Deal Value (₹) *</label>
                <input
                  type="number"
                  className="invoice-form-item-input"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Closing Target Date</label>
                <input
                  type="date"
                  className="invoice-form-item-input"
                  value={formData.closingDate}
                  onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Assigned Staff Member</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.assignedUser}
                  onChange={(e) => setFormData({ ...formData, assignedUser: e.target.value })}
                  placeholder="e.g. Akhil"
                />
              </div>

              <div className="form-group">
                <label>Pipeline Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="invoice-form-item-input"
                  style={{ height: '36px' }}
                >
                  {stagesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Notes (separated by |)</label>
                <textarea
                  className="invoice-form-item-input"
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Client requested sample pouches | Pricing negotiation started"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-add-item-row" style={{ marginTop: 0, width: 'auto', padding: '8px 24px' }}>
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline view modal */}
      {activeTimelineDeal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 'bold' }}>Timeline Notes: {activeTimelineDeal.name}</h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customer: {activeTimelineDeal.customer?.name}</span>
              </div>
              <button onClick={() => setActiveTimelineDeal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Timeline Notes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', marginBottom: '20px' }}>
              {(!activeTimelineDeal.notes || activeTimelineDeal.notes.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No timeline notes added to this deal.
                </div>
              ) : (
                activeTimelineDeal.notes.map((note, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ color: 'var(--secondary)', marginTop: '2px' }}><Clock size={14} /></div>
                    <div style={{ fontSize: '13px' }}>{note}</div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote}>
              <div className="form-group">
                <label>Add New Timeline Note</label>
                <textarea
                  className="invoice-form-item-input"
                  rows="2"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="e.g. Called client. Sample pouches approved."
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setActiveTimelineDeal(null)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                  Close
                </button>
                <button type="submit" className="btn-add-item-row" style={{ marginTop: 0, width: 'auto', padding: '6px 16px', fontSize: '13px' }}>
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
