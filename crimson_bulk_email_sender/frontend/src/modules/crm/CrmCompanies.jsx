import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Search, Plus, Edit, Trash2, X, Loader2, Globe, Building } from 'lucide-react';

export default function CrmCompanies() {
  const {
    companies,
    companiesTotal,
    contacts,
    isLoading,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    fetchContacts
  } = useCrm();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    address: '',
    contacts: [], // Selected contact IDs
    notes: ''
  });

  useEffect(() => {
    fetchCompanies({ search, page, limit });
    fetchContacts({ limit: 100 }); // Get list of contacts for dropdown select
  }, [search, page]);

  const handleOpenCreate = () => {
    setCurrentCompany(null);
    setFormData({
      name: '',
      industry: '',
      website: '',
      address: '',
      contacts: [],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (company) => {
    setCurrentCompany(company);
    setFormData({
      name: company.name || '',
      industry: company.industry || '',
      website: company.website || '',
      address: company.address || '',
      contacts: company.contacts ? company.contacts.map(c => c._id || c) : [],
      notes: company.notes ? company.notes.join(' | ') : ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Company Name is required');
      return;
    }

    const payload = {
      name: formData.name,
      industry: formData.industry,
      website: formData.website,
      address: formData.address,
      contacts: formData.contacts,
      notes: formData.notes.split('|').map(n => n.trim()).filter(Boolean)
    };

    try {
      if (currentCompany) {
        await updateCompany(currentCompany._id, payload);
      } else {
        await createCompany(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Error saving company');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await deleteCompany(id);
      } catch (err) {
        alert(err.message || 'Error deleting company');
      }
    }
  };

  const handleContactToggle = (contactId) => {
    setFormData(prev => {
      const isSelected = prev.contacts.includes(contactId);
      const newContacts = isSelected
        ? prev.contacts.filter(id => id !== contactId)
        : [...prev.contacts, contactId];
      return { ...prev, contacts: newContacts };
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Companies Management</h1>
        </div>
        <button className="btn-add-item-row" onClick={handleOpenCreate} style={{ marginTop: 0, width: 'auto' }}>
          <Plus size={16} />
          Add New Company
        </button>
      </header>

      {/* Search Filter */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search companies by name or industry..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Companies List */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        {isLoading && companies.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)', margin: '0 auto 12px' }} />
            <p>Loading companies list...</p>
          </div>
        ) : companies.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No companies found. Create one using the "Add New Company" button!
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Company Name</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Industry</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Website</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Address</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Contacts Count</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building size={16} style={{ color: 'var(--secondary)' }} />
                          {company.name}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{company.industry || '-'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {company.website ? (
                          <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Globe size={14} />
                            {company.website}
                          </a>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{company.address || '-'}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span className="badge success">
                          {company.contacts ? company.contacts.length : 0} Associated
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleOpenEdit(company)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(company._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {companiesTotal > limit && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Showing {(page - 1) * limit + 1} - {Math.min(page * limit, companiesTotal)} of {companiesTotal} companies
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
                    disabled={page * limit >= companiesTotal}
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{currentCompany ? 'Edit Company' : 'Create Company'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Company Name *</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Crimson Foods LLP"
                  required
                />
              </div>

              <div className="form-group">
                <label>Industry</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. FMCG / Food Production"
                />
              </div>

              <div className="form-group">
                <label>Website URL</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="e.g. www.crimsonfoods.com"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Address</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Trivandrum, Kerala"
                />
              </div>

              {/* Associated Contacts selection checkboxes */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Select Associated Contacts</label>
                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', maxH: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {contacts.length === 0 ? (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No contacts available. Create contacts first.</span>
                  ) : (
                    contacts.map(c => (
                      <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', fontWeight: 'normal', fontSize: '13px', cursor: 'pointer', marginBottom: 0 }}>
                        <input
                          type="checkbox"
                          checked={formData.contacts.includes(c._id)}
                          onChange={() => handleContactToggle(c._id)}
                        />
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </label>
                    ))
                  )}
                </div>
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
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
