import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Plus, Edit, Trash2, X, Loader2, Calendar, DollarSign, MessageSquare, Clock } from 'lucide-react';
import Dropdown from '../../components/Dropdown';

export default function CrmDeals() {
  const {
    deals: rawDeals = [],
    leads: rawLeads = [],
    contacts: rawContacts = [],
    companies: rawCompanies = [],
    orders: rawOrders = [],
    payments: rawPayments = [],
    settings,
    users = [],
    isLoading,
    fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    fetchLeads,
    fetchContacts,
    fetchCompanies,
    fetchOrders,
    fetchPayments,
    fetchSettings,
    fetchUsers,
    updateLead
  } = useCrm();

  const deals = rawDeals.filter(Boolean);
  const leads = rawLeads.filter(Boolean);
  const contacts = rawContacts.filter(Boolean);
  const companies = rawCompanies.filter(Boolean);
  const orders = rawOrders.filter(Boolean);
  const payments = rawPayments.filter(Boolean);

  const [pipelineType, setPipelineType] = useState('Both');
  const [errors, setErrors] = useState({});

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

  const mapLeadStatusToStage = (status, stages) => {
    if (!status) return 'New';
    if (stages.includes(status)) return status;
    const sLower = status.toLowerCase();
    if (sLower.includes('new')) return stages.find(s => s.toLowerCase().includes('new')) || stages[0];
    if (sLower.includes('contacted')) return stages.find(s => s.toLowerCase().includes('contact')) || stages[0];
    if (sLower.includes('proposal')) return stages.find(s => s.toLowerCase().includes('proposal')) || stages[0];
    if (sLower.includes('negotiation')) return stages.find(s => s.toLowerCase().includes('negotiat')) || stages[0];
    if (sLower.includes('confirm') || sLower.includes('won') || sLower.includes('closed')) {
      return stages.find(s => s.toLowerCase().includes('won') || s.toLowerCase().includes('confirm') || s.toLowerCase().includes('success')) || stages[stages.length - 2] || stages[0];
    }
    if (sLower.includes('lost')) return stages.find(s => s.toLowerCase().includes('lost')) || stages[stages.length - 1] || stages[0];
    return stages[0];
  };

  const mapStageToLeadStatus = (stage) => {
    if (!stage) return 'New';
    const sLower = stage.toLowerCase();
    if (sLower.includes('new')) return 'New';
    if (sLower.includes('contacted')) return 'Contacted';
    if (sLower.includes('proposal')) return 'Proposal Sent';
    if (sLower.includes('negotiation')) return 'Negotiation';
    if (sLower.includes('won') || sLower.includes('confirm') || sLower.includes('closed')) return 'Order Confirmed';
    if (sLower.includes('lost')) return 'Lost';
    return 'New';
  };

  const checkOrderPaymentCompletion = (dealOrName, customerId) => {
    const dealName = typeof dealOrName === 'string' ? dealOrName : dealOrName?.name || '';
    const orderMatch = dealName.match(/ORD-\d+/i);
    const orderNum = orderMatch ? orderMatch[0].toUpperCase() : null;

    const matchingOrder = orders.find(o => 
      (orderNum && o.orderNumber?.toUpperCase() === orderNum) ||
      (customerId && (o.leadId === customerId || o._id === customerId))
    );

    if (!matchingOrder) {
      return { isComplete: true, order: null, totalPaid: 0, totalAmount: 0 };
    }

    if (matchingOrder.paymentStatus === 'Paid' || matchingOrder.status === 'Completed') {
      return { isComplete: true, order: matchingOrder, totalPaid: matchingOrder.totalAmount || 0, totalAmount: matchingOrder.totalAmount || 0 };
    }

    const orderPayments = payments.filter(p => p.orderId === matchingOrder._id);
    const totalPaid = orderPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const isComplete = totalPaid >= (matchingOrder.totalAmount || 0) - 0.01;

    return {
      isComplete,
      order: matchingOrder,
      totalPaid,
      totalAmount: matchingOrder.totalAmount || 0
    };
  };

  useEffect(() => {
    fetchDeals();
    fetchLeads({ limit: 100 });
    fetchContacts({ limit: 100 });
    fetchCompanies({ limit: 100 });
    if (fetchOrders) fetchOrders({ limit: 200 });
    if (fetchPayments) fetchPayments();
    fetchSettings();
    if (fetchUsers) fetchUsers();
  }, []);

  const handleOpenCreate = (stage = 'New') => {
    setCurrentDeal(null);
    setErrors({});
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
    if (deal.isLeadDeal) {
      alert(`This deal is managed directly under Lead: "${deal.name.replace(' - Order/Deal', '')}". Please update the quotation in the Leads module.`);
      return;
    }
    setCurrentDeal(deal);
    setErrors({});
    const customerId = deal.customer?._id || deal.customer || '';
    setFormData({
      name: deal.name || '',
      customerSelection: deal.customerModel && customerId ? `${deal.customerModel}:${customerId}` : '',
      value: deal.value || 0,
      closingDate: deal.closingDate ? new Date(deal.closingDate).toISOString().substring(0, 10) : '',
      stage: deal.stage || 'New',
      assignedUser: deal.assignedUser || '',
      notes: deal.notes ? deal.notes.join(' | ') : ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Reset and validate
    const validationErrors = {};
    if (!formData.name.trim()) {
      validationErrors.name = 'Deal Name is required';
    }
    if (!formData.customerSelection) {
      validationErrors.customerSelection = 'Customer assignment is required';
    }
    if (formData.value < 0) {
      validationErrors.value = 'Deal Value must be non-negative';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const [customerModel, customerId] = formData.customerSelection.split(':');

    if (formData.stage === 'Won') {
      const { isComplete, order, totalPaid, totalAmount } = checkOrderPaymentCompletion(formData.name, customerId);
      if (!isComplete && order) {
        alert(`Cannot save deal in "Won" stage because payment is not completed.\nOrder: ${order.orderNumber}\nPaid: ₹${(totalPaid || 0).toFixed(2)} / Total: ₹${(totalAmount || 0).toFixed(2)}\nPlease record the full payment in Orders Management first.`);
        return;
      }
    }

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
    const dragId = e.dataTransfer.getData('text/plain');
    
    if (dragId.startsWith('lead_')) {
      const leadId = dragId.replace('lead_', '');
      const lead = leads.find(l => l._id === leadId);
      if (lead) {
        if (targetStage === 'Won') {
          alert("A Lead cannot be moved to the 'Won' stage without placing an order and completing payment. Please click 'Place Order' inside the Lead details modal and record payment first.");
          return;
        }
        const targetLeadStatus = mapStageToLeadStatus(targetStage);
        if (lead.status !== targetLeadStatus) {
          try {
            // Strip immutable system fields to prevent Mongoose / MongoDB errors
            const { _id, id, createdAt, updatedAt, __v, statusHistory, createdBy, tenantId, ...cleanLead } = lead;
            await updateLead(leadId, { ...cleanLead, status: targetLeadStatus });
          } catch (err) {
            alert(err.message || 'Error dropping lead');
          }
        }
      }
    } else {
      const deal = deals.find(d => d._id === dragId);
      if (deal && deal.stage !== targetStage) {
        if (targetStage === 'Won') {
          const customerId = deal.customer?._id || deal.customer;
          const { isComplete, order, totalPaid, totalAmount } = checkOrderPaymentCompletion(deal, customerId);
          if (!isComplete && order) {
            alert(`Cannot move deal to "Won" stage because payment is not completed.\nOrder: ${order.orderNumber}\nPaid: ₹${(totalPaid || 0).toFixed(2)} / Grand Total: ₹${(totalAmount || 0).toFixed(2)}\nPlease record full payment in Orders Management first.`);
            return;
          }
        }
        
        try {
          // Strip immutable fields & nested populated objects (like customer) to match DB schema
          const { _id, id, createdAt, updatedAt, __v, createdBy, tenantId, customer, ...cleanDeal } = deal;
          const customerId = customer?._id || customer;
          await updateDeal(dragId, {
            ...cleanDeal,
            customer: customerId,
            stage: targetStage
          });
        } catch (err) {
          alert(err.message || 'Error dropping deal');
        }
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
      <header className="history-header" style={{ marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <h1>Sales Pipeline</h1>
        </div>
      </header>

      {/* Kanban Board */}
      {isLoading && deals.length === 0 ? (
        <div className="empty-state">
          <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)' }} />
          <p>Loading sales board...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stagesList.length}, 1fr)`, gap: '16px', minHeight: '600px', overflowX: 'auto', paddingBottom: '20px' }}>
          {(() => {
            const leadsWithDbDeals = new Set(
              deals
                .filter(d => d.customer)
                .map(d => (d.customer?._id || d.customer).toString())
            );

            return stagesList.map(stage => {
              const mappedLeadDeals = leads
                .filter(l => 
                  l.quotation?.products?.length > 0 && 
                  !leadsWithDbDeals.has(l._id.toString()) &&
                  mapLeadStatusToStage(l.status, stagesList) === stage
                )
                .map(l => ({
                  _id: `lead_${l._id}`, // This matches the dragId format lead_id
                  name: `${l.name} - Order/Deal`,
                  customer: { name: l.company || l.name },
                  value: l.quotation.totalAmount || 0,
                  closingDate: l.quotation.expectedDeliveryDate,
                  stage: stage,
                  assignedUser: l.assignedUser,
                  notes: l.notes || [],
                  isLeadDeal: true,
                  leadId: l._id,
                  products: l.quotation.products
                }));

              const dbDeals = deals.filter(d => d.stage === stage);
              const stageDeals = pipelineType !== 'Leads' ? [...dbDeals, ...mappedLeadDeals] : [];
              
              // For stageLeads, exclude leads that have quotations (since they are now represented as deals)
              // or already have a DB order/deal
              const stageLeads = pipelineType !== 'Deals' 
                ? leads.filter(l => 
                    mapLeadStatusToStage(l.status, stagesList) === stage && 
                    !leadsWithDbDeals.has(l._id.toString()) &&
                    (!l.quotation?.products || l.quotation.products.length === 0)
                  ) 
                : [];
            
            const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            const totalItemsCount = stageDeals.length + stageLeads.length;

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
                      {stageDeals.length > 0 && `₹${totalValue.toLocaleString('en-IN')} | `}{totalItemsCount} items
                    </div>
                  </div>
                </div>

                {/* Unified Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1, overflowY: 'auto' }}>
                  {/* Render Lead Cards */}
                  {stageLeads.map(lead => (
                    <div
                      key={`lead-${lead._id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, `lead_${lead._id}`)}
                      className="card"
                      style={{ padding: '14px', background: 'rgba(255, 199, 44, 0.03)', border: '1px solid rgba(255, 199, 44, 0.15)', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: '8px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{lead.name}</span>
                        <span className="badge pending" style={{ fontSize: '9px', padding: '1px 4px', borderRadius: '4px' }}>Lead</span>
                      </div>
                      {lead.company && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lead.company}</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span className={`badge ${lead.priority === 'High' ? 'sending' : lead.priority === 'Medium' ? 'warning' : 'completed'}`} style={{ fontSize: '9px' }}>
                          {lead.priority}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{lead.source}</span>
                      </div>
                    </div>
                  ))}

                  {/* Render Deal Cards */}
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
                            {!deal.isLeadDeal && (
                              <button onClick={() => handleDelete(deal._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {deal.customer?.name || 'Unknown Client'}
                        </div>

                        {deal.products && deal.products.length > 0 && (
                          <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', marginBottom: '4px' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '3px', marginBottom: '3px' }}>Items & Order Details:</div>
                            {deal.products.map((p, pIdx) => (
                              <div key={pIdx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>• {p.name}</span>
                                <span>x{p.quantity} (₹{p.unitPrice})</span>
                              </div>
                            ))}
                          </div>
                        )}

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
            });
          })()}
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
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Deal Name *</label>
                <input
                  type="text"
                  className={`invoice-form-item-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                  }}
                  placeholder="e.g. 5,000 pouches matte printing order"
                  required
                />
                {errors.name && <span style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Associated Customer *</label>
                <Dropdown
                  placeholder="Select Lead, Contact, or Company"
                  options={customerOptions.map(c => ({ value: `${c.model}:${c.id}`, label: c.name }))}
                  value={formData.customerSelection}
                  onChange={(val) => {
                    setFormData({ ...formData, customerSelection: val });
                    if (errors.customerSelection) setErrors(prev => ({ ...prev, customerSelection: null }));
                  }}
                  error={errors.customerSelection}
                  searchable={true}
                  required={true}
                  selectStyle={{ height: '36px' }}
                />
                {errors.customerSelection && <span style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.customerSelection}</span>}
              </div>

              <div className="form-group">
                <label>Deal Value (₹) *</label>
                <input
                  type="number"
                  className={`invoice-form-item-input ${errors.value ? 'error' : ''}`}
                  value={formData.value}
                  onChange={(e) => {
                    setFormData({ ...formData, value: Number(e.target.value) || 0 });
                    if (errors.value) setErrors(prev => ({ ...prev, value: null }));
                  }}
                  required
                />
                {errors.value && <span style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.value}</span>}
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
                <Dropdown
                  placeholder="Unassigned"
                  options={users.map(u => ({ value: u.username, label: `${u.username} (${u.role})` }))}
                  value={formData.assignedUser}
                  onChange={(val) => setFormData({ ...formData, assignedUser: val })}
                  searchable={true}
                  clearable={true}
                  selectStyle={{ height: '36px' }}
                />
              </div>

              <div className="form-group">
                <label>Pipeline Stage</label>
                <Dropdown
                  options={stagesList}
                  value={formData.stage}
                  onChange={(val) => setFormData({ ...formData, stage: val })}
                  searchable={false}
                  selectStyle={{ height: '36px' }}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
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
