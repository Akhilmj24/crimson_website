import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Search, Plus, FileSpreadsheet, Download, Upload, Edit, Trash2, X, Filter, Loader2, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function CrmLeads() {
  const {
    leads,
    leadsTotal,
    isLoading,
    settings,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    fetchSettings
  } = useCrm();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null); // null for create, object for edit
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'Website',
    status: 'New',
    priority: 'Medium',
    assignedUser: '',
    tags: '',
    notes: '',
    attachments: ''
  });

  // Load leads and settings on mount
  useEffect(() => {
    fetchLeads({ search, status: statusFilter, priority: priorityFilter, page, limit });
    fetchSettings();
  }, [search, statusFilter, priorityFilter, page]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setCurrentLead(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      source: 'Website',
      status: 'New',
      priority: 'Medium',
      assignedUser: '',
      tags: '',
      notes: '',
      attachments: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (lead) => {
    setCurrentLead(lead);
    setFormData({
      name: lead.name || '',
      company: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || 'Website',
      status: lead.status || 'New',
      priority: lead.priority || 'Medium',
      assignedUser: lead.assignedUser || '',
      tags: lead.tags ? lead.tags.join(', ') : '',
      notes: lead.notes ? lead.notes.join(' | ') : '',
      attachments: lead.attachments ? lead.attachments.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Lead Name is required');
      return;
    }

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      notes: formData.notes.split('|').map(n => n.trim()).filter(Boolean),
      attachments: formData.attachments.split(',').map(a => a.trim()).filter(Boolean)
    };

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

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '6px 10px', fontSize: '13px' }}
          >
            <option value="">All Statuses</option>
            {stagesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '6px 10px', fontSize: '13px' }}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
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
                        <td style={{ padding: '14px 16px', fontWeight: '600' }}>{lead.name}</td>
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
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{currentLead ? 'Edit Lead Details' : 'Create New Lead'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Lead Name *</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Akhil"
                  required
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Client Compay"
                />
              </div>

              <div className="form-group">
                <label>Assigned User</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.assignedUser}
                  onChange={(e) => setFormData({ ...formData, assignedUser: e.target.value })}
                  placeholder="e.g. Akhil"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="invoice-form-item-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. client@example.com"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 9744050505"
                />
              </div>

              <div className="form-group">
                <label>Lead Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="invoice-form-item-input"
                  style={{ height: '36px' }}
                >
                  {sourcesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="invoice-form-item-input"
                  style={{ height: '36px' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status / Stage</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="invoice-form-item-input"
                  style={{ height: '36px' }}
                >
                  {stagesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
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

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-add-item-row" style={{ marginTop: 0, width: 'auto', padding: '8px 24px' }}>
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
