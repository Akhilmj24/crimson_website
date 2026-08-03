import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Search, Plus, Edit, Trash2, X, Loader2, Linkedin, Twitter, Facebook } from 'lucide-react';

export default function CrmContacts() {
  const {
    contacts,
    contactsTotal,
    isLoading,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact
  } = useCrm();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    notes: ''
  });

  useEffect(() => {
    fetchContacts({ search, page, limit });
  }, [search, page]);

  const handleOpenCreate = () => {
    setCurrentContact(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      twitter: '',
      facebook: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact) => {
    setCurrentContact(contact);
    setFormData({
      name: contact.name || '',
      company: contact.company || '',
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      linkedin: contact.socialLinks?.linkedin || '',
      twitter: contact.socialLinks?.twitter || '',
      facebook: contact.socialLinks?.facebook || '',
      notes: contact.notes ? contact.notes.join(' | ') : ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Contact Name is required');
      return;
    }

    const payload = {
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      socialLinks: {
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        facebook: formData.facebook
      },
      notes: formData.notes.split('|').map(n => n.trim()).filter(Boolean)
    };

    try {
      if (currentContact) {
        await updateContact(currentContact._id, payload);
      } else {
        await createContact(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Error saving contact');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
      } catch (err) {
        alert(err.message || 'Error deleting contact');
      }
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Contacts Management</h1>
        </div>
        <button className="btn-add-item-row" onClick={handleOpenCreate} style={{ marginTop: 0, width: 'auto' }}>
          <Plus size={16} />
          Add New Contact
        </button>
      </header>

      {/* Search Filter */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search contacts by name, email, company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        {isLoading && contacts.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)', margin: '0 auto 12px' }} />
            <p>Loading contacts list...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No contacts found. Create one using the "Add New Contact" button!
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Name</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Company</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Email</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Phone</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Social Networks</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '600' }}>{contact.name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{contact.company || '-'}</td>
                      <td style={{ padding: '14px 16px' }}>{contact.email || '-'}</td>
                      <td style={{ padding: '14px 16px' }}>{contact.phone || '-'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {contact.socialLinks?.linkedin && (
                            <a href={contact.socialLinks.linkedin} target="_blank" rel="noreferrer" style={{ color: '#0077b5' }} title="LinkedIn">
                              <Linkedin size={16} />
                            </a>
                          )}
                          {contact.socialLinks?.twitter && (
                            <a href={contact.socialLinks.twitter} target="_blank" rel="noreferrer" style={{ color: '#1da1f2' }} title="Twitter">
                              <Twitter size={16} />
                            </a>
                          )}
                          {contact.socialLinks?.facebook && (
                            <a href={contact.socialLinks.facebook} target="_blank" rel="noreferrer" style={{ color: '#1877f2' }} title="Facebook">
                              <Facebook size={16} />
                            </a>
                          )}
                          {!contact.socialLinks?.linkedin && !contact.socialLinks?.twitter && !contact.socialLinks?.facebook && '-'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleOpenEdit(contact)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(contact._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {contactsTotal > limit && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Showing {(page - 1) * limit + 1} - {Math.min(page * limit, contactsTotal)} of {contactsTotal} contacts
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
                    disabled={page * limit >= contactsTotal}
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
              <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{currentContact ? 'Edit Contact' : 'Create Contact'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Contact Name *</label>
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
                <label>Company Name</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Athen Gardens"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="invoice-form-item-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. Akhil@example.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 9744050505"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Trivandrum, Kerala"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <h4 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Social Profiles</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <input
                    type="text"
                    className="invoice-form-item-input"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="LinkedIn URL"
                  />
                  <input
                    type="text"
                    className="invoice-form-item-input"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="Twitter URL"
                  />
                  <input
                    type="text"
                    className="invoice-form-item-input"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="Facebook URL"
                  />
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
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
