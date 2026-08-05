import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Search, Plus, FileSpreadsheet, Download, Upload, Edit, Trash2, X, Filter, Loader2, Sparkles, Calendar, DollarSign, Clock, Trash } from 'lucide-react';
import * as XLSX from 'xlsx';
import { product as defaultProducts } from '../../context/data';
import Dropdown from '../../components/Dropdown';
import SalutationDropdown from '../../components/SalutationDropdown';

export default function CrmLeads() {
  const {
    leads: rawLeads = [],
    leadsTotal,
    users = [],
    isLoading,
    settings,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    fetchSettings,
    fetchUsers
  } = useCrm();

  const leads = rawLeads.filter(Boolean);

  const [errors, setErrors] = useState({});

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // CRUD Modal State & Tab State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'quotation' | 'history'
  const [currentLead, setCurrentLead] = useState(null); // null for create, object for edit

  // Quotation Sub-States
  const [quotationProducts, setQuotationProducts] = useState([]);
  const [quotationNotes, setQuotationNotes] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');

  const [formData, setFormData] = useState({
    salutation: '',
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    source: 'Website',
    status: 'New',
    priority: 'Medium',
    assignedUser: '',
    tags: '',
    notes: '',
    attachments: ''
  });

  // Load leads, settings and users on mount
  useEffect(() => {
    fetchLeads({ search, status: statusFilter, priority: priorityFilter, page, limit });
    fetchSettings();
    if (fetchUsers) fetchUsers();
  }, [search, statusFilter, priorityFilter, page]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setCurrentLead(null);
    setErrors({});
    setFormData({
      salutation: '',
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      source: 'Website',
      status: 'New',
      priority: 'Medium',
      assignedUser: '',
      tags: '',
      notes: '',
      attachments: ''
    });
    setQuotationProducts([]);
    setQuotationNotes('');
    setExpectedDeliveryDate('');
    setActiveTab('details');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (lead) => {
    setCurrentLead(lead);
    setErrors({});
    setFormData({
      salutation: lead.salutation || '',
      name: lead.name || '',
      company: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      address: lead.address || '',
      source: lead.source || 'Website',
      status: lead.status || 'New',
      priority: lead.priority || 'Medium',
      assignedUser: lead.assignedUser || '',
      tags: lead.tags ? lead.tags.join(', ') : '',
      notes: lead.notes ? lead.notes.join(' | ') : '',
      attachments: lead.attachments ? lead.attachments.join(', ') : ''
    });
    setQuotationProducts(lead.quotation?.products || []);
    setQuotationNotes(lead.quotation?.notes || '');
    setExpectedDeliveryDate(lead.quotation?.expectedDeliveryDate ? new Date(lead.quotation.expectedDeliveryDate).toISOString().substring(0, 10) : '');
    setActiveTab('details');
    setIsModalOpen(true);
  };

  // Handle Save with client-side form validation
  const handleSave = async (e) => {
    e.preventDefault();

    // Reset and validate
    const validationErrors = {};
    if (!formData.name.trim()) {
      validationErrors.name = 'Lead Name is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = 'Invalid email address format (e.g. client@example.com)';
    }
    if (formData.phone && !/^[+]?[0-9\s\-()]{7,15}$/.test(formData.phone)) {
      validationErrors.phone = 'Invalid phone format (must be 7-15 digits, optionally starting with +)';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setActiveTab('details');
      return;
    }

    // Compute total Amount for Quotation
    const totalAmount = quotationProducts.reduce((sum, p) => {
      const lineTotal = p.quantity * p.unitPrice;
      const discAmt = (lineTotal * (p.discount || 0)) / 100;
      const taxAmt = ((lineTotal - discAmt) * (p.tax || 0)) / 100;
      return sum + (lineTotal - discAmt + taxAmt);
    }, 0);

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      notes: formData.notes.split('|').map(n => n.trim()).filter(Boolean),
      attachments: formData.attachments.split(',').map(a => a.trim()).filter(Boolean),
      quotation: {
        products: quotationProducts,
        totalAmount,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        notes: quotationNotes
      }
    };

    // If transitioning to Order Confirmed, prompt warning
    if (formData.status === 'Order Confirmed' && (!currentLead || currentLead.status !== 'Order Confirmed')) {
      const confirmOrder = window.confirm(
        'Confirming this order will automatically generate a new Order in the Orders Module and save these quotation details. Do you want to proceed?'
      );
      if (!confirmOrder) return;
    }

    try {
      if (currentLead) {
        await updateLead(currentLead._id, payload);
      } else {
        await createLead(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Error saving lead');
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(id);
      } catch (err) {
        alert(err.message || 'Error deleting lead');
      }
    }
  };

  // Export to Excel/CSV using xlsx
  const handleExport = () => {
    const dataToExport = leads.map(l => ({
      'Salutation': l.salutation || '',
      'Lead Name': l.name,
      'Company': l.company,
      'Email': l.email,
      'Phone': l.phone,
      'Source': l.source,
      'Status': l.status,
      'Priority': l.priority,
      'Assigned User': l.assignedUser,
      'Tags': l.tags ? l.tags.join(', ') : '',
      'Notes': l.notes ? l.notes.join(' | ') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, 'crm_leads_export.xlsx');
  };

  // Import from CSV/Excel
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawRows = XLSX.utils.sheet_to_json(ws);

        let importedCount = 0;
        for (const row of rawRows) {
          const leadName = row['Lead Name'] || row['name'] || row['Name'];
          if (!leadName) continue;

          await createLead({
            salutation: String(row['Salutation'] || row['salutation'] || ''),
            name: String(leadName),
            company: String(row['Company'] || row['company'] || ''),
            email: String(row['Email'] || row['email'] || ''),
            phone: String(row['Phone'] || row['phone'] || ''),
            source: String(row['Source'] || row['source'] || 'Website'),
            status: String(row['Status'] || row['status'] || 'New'),
            priority: String(row['Priority'] || row['priority'] || 'Medium'),
            assignedUser: String(row['Assigned User'] || row['assignedUser'] || ''),
            tags: row['Tags'] ? String(row['Tags']).split(',').map(t => t.trim()) : [],
            notes: row['Notes'] ? String(row['Notes']).split('|').map(n => n.trim()) : []
          });
          importedCount++;
        }

        alert(`Successfully imported ${importedCount} leads!`);
        fetchLeads({ search, status: statusFilter, priority: priorityFilter, page, limit });
      } catch (err) {
        console.error(err);
        alert('Failed to parse file. Make sure columns match Lead schema.');
      }
    };
    reader.readAsBinaryString(file);
    // reset file input
    e.target.value = null;
  };

  // Get available settings lists
  const defaultSources = ['Website', 'Referral', 'Social Media', 'Cold Reach', 'Other'];
  const defaultTags = ['Warm', 'Cold', 'Enterprise', 'SMB', 'Important'];
  const defaultStages = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  const sourcesList = settings?.leadSources || defaultSources;
  const tagsList = settings?.tags || defaultTags;
  const stagesList = settings?.dealStages || defaultStages;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Leads Management</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Import CSV */}
          <label className="btn-icon-label" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border)' }}>
            <Upload size={14} />
            Import CSV
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleImport} style={{ display: 'none' }} />
          </label>

          {/* Export CSV */}
          <button className="btn-icon-label" onClick={handleExport} style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border)' }}>
            <Download size={14} />
            Export CSV
          </button>

          {/* Add Lead */}
          <button className="btn-add-item-row" onClick={handleOpenCreate} style={{ marginTop: 0, width: 'auto' }}>
            <Plus size={16} />
            Add New Lead
          </button>
        </div>
      </header>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', flexGrow: 1, minWidth: '240px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search leads by name, company, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />

          <Dropdown
            placeholder="All Statuses"
            options={stagesList}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            searchable={false}
            clearable={true}
            style={{ width: '150px' }}
            selectStyle={{ height: '32px', padding: '4px 10px', background: 'rgba(0,0,0,0.2)' }}
          />

          <Dropdown
            placeholder="All Priorities"
            options={['Low', 'Medium', 'High']}
            value={priorityFilter}
            onChange={(val) => { setPriorityFilter(val); setPage(1); }}
            searchable={false}
            clearable={true}
            style={{ width: '150px' }}
            selectStyle={{ height: '32px', padding: '4px 10px', background: 'rgba(0,0,0,0.2)' }}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        {isLoading && leads.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)', margin: '0 auto 12px' }} />
            <p>Loading leads catalog...</p>
          </div>
        ) : leads.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No leads found. Create one using the "Add New Lead" button or upload a CSV file!
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Name</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Company</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Email / Phone</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Source</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Priority</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Assigned</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    let priorityColor = 'var(--text-muted)';
                    if (lead.priority === 'High') priorityColor = 'var(--error)';
                    if (lead.priority === 'Medium') priorityColor = 'var(--warning)';

                    return (
                      <tr key={lead._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '600' }}>{lead.salutation ? `${lead.salutation} ${lead.name}` : lead.name}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{lead.company || '-'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div>{lead.email || '-'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{lead.phone}</div>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{lead.source}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span className={`badge ${lead.status.toLowerCase()}`} style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                            {lead.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{ color: priorityColor, fontWeight: 'bold' }}>{lead.priority}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>{lead.assignedUser || '-'}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => handleOpenEdit(lead)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(lead._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {leadsTotal > limit && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Showing {(page - 1) * limit + 1} - {Math.min(page * limit, leadsTotal)} of {leadsTotal} leads
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Previous
                  </button>
                  <button
                    disabled={page * limit >= leadsTotal}
                    onClick={() => setPage(page + 1)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CRUD Lead Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{currentLead ? 'Edit Lead Details' : 'Create New Lead'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Tabs Bar */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                style={{
                  padding: '8px 16px',
                  background: activeTab === 'details' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Lead Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quotation')}
                style={{
                  padding: '8px 16px',
                  background: activeTab === 'quotation' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Quotation / Orders
              </button>
              {currentLead && (
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === 'history' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  Status History
                </button>
              )}
            </div>

            <form onSubmit={handleSave} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {activeTab === 'details' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Lead Name *</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ width: '120px', flexShrink: 0 }}>
                        <SalutationDropdown
                          value={formData.salutation}
                          onChange={(val) => setFormData({ ...formData, salutation: val })}
                        />
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <input
                          type="text"
                          className={`invoice-form-item-input ${errors.name ? 'error' : ''}`}
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                          }}
                          placeholder="e.g. Akhil"
                          required
                        />
                      </div>
                    </div>
                    {errors.name && <span style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      className="invoice-form-item-input"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Client Company"
                    />
                  </div>

                  <div className="form-group">
                    <label>Assigned User</label>
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
                    <label>Email</label>
                    <input
                      type="text"
                      className={`invoice-form-item-input ${errors.email ? 'error' : ''}`}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                      }}
                      placeholder="e.g. client@example.com"
                    />
                    {errors.email && <span style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      className={`invoice-form-item-input ${errors.phone ? 'error' : ''}`}
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                      }}
                      placeholder="e.g. +91 9744050505"
                    />
                    {errors.phone && <span style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Address</label>
                    <input
                      type="text"
                      className="invoice-form-item-input"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. 123 Main St, Trivandrum, Kerala"
                    />
                  </div>

                  <div className="form-group">
                    <label>Lead Source</label>
                    <Dropdown
                      options={sourcesList}
                      value={formData.source}
                      onChange={(val) => setFormData({ ...formData, source: val })}
                      searchable={false}
                      selectStyle={{ height: '36px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <Dropdown
                      options={['Low', 'Medium', 'High']}
                      value={formData.priority}
                      onChange={(val) => setFormData({ ...formData, priority: val })}
                      searchable={false}
                      selectStyle={{ height: '36px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Status / Stage</label>
                    <Dropdown
                      options={stagesList}
                      value={formData.status}
                      onChange={(val) => setFormData({ ...formData, status: val })}
                      searchable={false}
                      selectStyle={{ height: '36px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input
                      type="text"
                      className="invoice-form-item-input"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="e.g. Warm, Enterprise"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Notes (separated by |)</label>
                    <textarea
                      className="invoice-form-item-input"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Note 1 | Note 2"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'quotation' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Expected Delivery Date</label>
                      <input
                        type="date"
                        className="invoice-form-item-input"
                        value={expectedDeliveryDate}
                        onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Quotation Notes</label>
                      <input
                        type="text"
                        className="invoice-form-item-input"
                        placeholder="e.g. Shipping charges extra"
                        value={quotationNotes}
                        onChange={(e) => setQuotationNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '8px', textAlign: 'left' }}>Item / Product</th>
                          <th style={{ padding: '8px', width: '70px', textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '8px', width: '100px', textAlign: 'right' }}>Price</th>
                          <th style={{ padding: '8px', width: '70px', textAlign: 'center' }}>Disc %</th>
                          <th style={{ padding: '8px', width: '70px', textAlign: 'center' }}>Tax %</th>
                          <th style={{ padding: '8px', width: '90px', textAlign: 'right' }}>Total</th>
                          <th style={{ padding: '8px', width: '40px', textAlign: 'center' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotationProducts.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                              No products added to this quotation. Click "Add Product Row" to begin.
                            </td>
                          </tr>
                        ) : (
                          quotationProducts.map((p, index) => {
                            const subTotal = p.quantity * p.unitPrice;
                            const discAmt = (subTotal * (p.discount || 0)) / 100;
                            const taxAmt = ((subTotal - discAmt) * (p.tax || 0)) / 100;
                            const rowTotal = subTotal - discAmt + taxAmt;

                            return (
                              <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <td style={{ padding: '6px' }}>
                                  <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                                    <Dropdown
                                      placeholder="-- Quick Select Product --"
                                      options={defaultProducts.map(d => ({
                                        value: d.id,
                                        label: `${d.description} (${d.size})`
                                      }))}
                                      onChange={(val) => {
                                        if (val) {
                                          const selected = defaultProducts.find(x => x.id === parseInt(val));
                                          if (selected) {
                                            const updated = [...quotationProducts];
                                            updated[index] = {
                                              name: selected.description,
                                              quantity: 1,
                                              unitPrice: selected.price,
                                              discount: 0,
                                              tax: selected.gstRate
                                            };
                                            setQuotationProducts(updated);
                                          }
                                        }
                                      }}
                                      searchable={true}
                                      selectStyle={{
                                        padding: '4px',
                                        background: 'rgba(0,0,0,0.3)',
                                        color: '#fff',
                                        border: '1px solid var(--border)',
                                        fontSize: '12px',
                                        height: '28px'
                                      }}
                                    />
                                    <input
                                      type="text"
                                      className="invoice-form-item-input"
                                      style={{ padding: '6px', fontSize: '12px', height: 'auto', marginTop: '4px' }}
                                      value={p.name}
                                      onChange={(e) => {
                                        const updated = [...quotationProducts];
                                        updated[index].name = e.target.value;
                                        setQuotationProducts(updated);
                                      }}
                                      placeholder="Custom product name..."
                                      required
                                    />
                                  </div>
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <input
                                    type="number"
                                    className="invoice-form-item-input"
                                    style={{ padding: '6px', fontSize: '12px', height: 'auto', textAlign: 'center' }}
                                    value={p.quantity}
                                    onChange={(e) => {
                                      const updated = [...quotationProducts];
                                      updated[index].quantity = Math.max(1, parseInt(e.target.value) || 0);
                                      setQuotationProducts(updated);
                                    }}
                                    min="1"
                                    required
                                  />
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <input
                                    type="number"
                                    className="invoice-form-item-input"
                                    style={{ padding: '6px', fontSize: '12px', height: 'auto', textAlign: 'right' }}
                                    value={p.unitPrice}
                                    onChange={(e) => {
                                      const updated = [...quotationProducts];
                                      updated[index].unitPrice = Math.max(0, parseFloat(e.target.value) || 0);
                                      setQuotationProducts(updated);
                                    }}
                                    min="0"
                                    required
                                  />
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <input
                                    type="number"
                                    className="invoice-form-item-input"
                                    style={{ padding: '6px', fontSize: '12px', height: 'auto', textAlign: 'center' }}
                                    value={p.discount}
                                    onChange={(e) => {
                                      const updated = [...quotationProducts];
                                      updated[index].discount = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                      setQuotationProducts(updated);
                                    }}
                                    min="0"
                                    max="100"
                                  />
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <input
                                    type="number"
                                    className="invoice-form-item-input"
                                    style={{ padding: '6px', fontSize: '12px', height: 'auto', textAlign: 'center' }}
                                    value={p.tax}
                                    onChange={(e) => {
                                      const updated = [...quotationProducts];
                                      updated[index].tax = Math.max(0, parseFloat(e.target.value) || 0);
                                      setQuotationProducts(updated);
                                    }}
                                    min="0"
                                  />
                                </td>
                                <td style={{ padding: '6px', textAlign: 'right', fontWeight: '600' }}>
                                  ₹{rowTotal.toFixed(2)}
                                </td>
                                <td style={{ padding: '6px', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = quotationProducts.filter((_, idx) => idx !== index);
                                      setQuotationProducts(updated);
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                                  >
                                    <Trash size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setQuotationProducts([...quotationProducts, { name: '', quantity: 1, unitPrice: 0, discount: 0, tax: 18 }])}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={14} />
                      Add Product Row
                    </button>

                    <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                      Quotation Grand Total:{' '}
                      <span style={{ color: 'var(--secondary)', marginLeft: '8px' }}>
                        ₹
                        {quotationProducts.reduce((sum, p) => {
                          const subTotal = p.quantity * p.unitPrice;
                          const discAmt = (subTotal * (p.discount || 0)) / 100;
                          const taxAmt = ((subTotal - discAmt) * (p.tax || 0)) / 100;
                          return sum + (subTotal - discAmt + taxAmt);
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && currentLead && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', paddingLeft: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Timeline Status History</h3>
                  {!currentLead.statusHistory || currentLead.statusHistory.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px' }}>
                      No stage changes recorded for this lead yet.
                    </div>
                  ) : (
                    <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {currentLead.statusHistory.map((h, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <span
                            style={{
                              position: 'absolute',
                              left: '-23px',
                              top: '2px',
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: 'var(--primary)',
                              border: '2px solid var(--background)'
                            }}
                          ></span>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`badge ${h.status.toLowerCase().replace(' ', '-')}`}>
                              {h.status}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                              by {h.updatedBy || 'system'}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {new Date(h.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>


                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-add-item-row" style={{ marginTop: 0, width: 'auto', padding: '8px 24px', fontSize: '13px' }}>
                    Save Lead
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
