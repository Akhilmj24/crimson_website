import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Search, Plus, Edit, Trash2, X, Filter, Loader2, DollarSign, Calendar, FileText, ArrowDownRight, Upload, Paperclip, Download } from 'lucide-react';
import Dropdown from '../../components/Dropdown';
import { crmService } from '../../services/crmService';
import CustomConfirmModal from '../../components/CustomConfirmModal';

export default function CrmExpenses() {
  const {
    expenses,
    expensesTotal,
    expensesTotalAmount,
    isLoading,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchDashboard,
    showToast
  } = useCrm();

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [previewExpense, setPreviewExpense] = useState(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [users, setUsers] = useState([]);

  // Form state
  const [editingExpense, setEditingExpense] = useState(null); // null for create, object for edit
  const [formData, setFormData] = useState({
    category: 'Office Expenses',
    amount: '',
    date: new Date().toISOString().substring(0, 10),
    title: '',
    paymentMethod: 'Cash',
    description: '',
    attachment: '',
    attachmentName: '',
    spentBy: ''
  });

  useEffect(() => {
    fetchExpenses({ search, category: categoryFilter, page, limit });
  }, [search, categoryFilter, page]);

  const fetchUsers = async () => {
    try {
      const list = await crmService.getUsersList();
      if (Array.isArray(list)) {
        setUsers(list);
      }
    } catch (err) {
      console.error('Failed to fetch users list for expenses dropdown', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleResetForm = () => {
    fetchUsers();
    setEditingExpense(null);
    setFormData({
      category: 'Office Expenses',
      amount: '',
      date: new Date().toISOString().substring(0, 10),
      title: '',
      paymentMethod: 'Cash',
      description: '',
      attachment: '',
      attachmentName: '',
      spentBy: ''
    });
  };

  const handleStartEdit = (exp) => {
    fetchUsers();
    setEditingExpense(exp);
    setFormData({
      category: exp.category || 'Office Expenses',
      amount: exp.amount.toString(),
      date: new Date(exp.date).toISOString().substring(0, 10),
      title: exp.title || '',
      paymentMethod: exp.paymentMethod || 'Cash',
      description: exp.description || '',
      attachment: exp.attachment || '',
      attachmentName: exp.attachmentName || '',
      spentBy: exp.spentBy || ''
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds the 5MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        attachment: reader.result,
        attachmentName: file.name
      }));
    };
    reader.onerror = (error) => {
      console.error('File reading error:', error);
      showToast('Failed to read file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToast('Valid amount is required', 'error');
      return;
    }
    if (!formData.date) {
      showToast('Date is required', 'error');
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date)
    };

    try {
      if (editingExpense) {
        await updateExpense(editingExpense._id, payload);
        showToast('Expense updated successfully', 'success');
      } else {
        await createExpense(payload);
        showToast('Expense saved successfully', 'success');
      }
      handleResetForm();
      fetchExpenses({ search, category: categoryFilter, page, limit });
      fetchDashboard();
    } catch (err) {
      showToast(err.message || 'Error saving expense', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await deleteExpense(id);
      fetchExpenses({ search, category: categoryFilter, page, limit });
      fetchDashboard();
      showToast('Expense deleted successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Error deleting expense', 'error');
    }
  };

  const categories = ['Office Expenses', 'Travel', 'Marketing', 'Salary', 'Utilities', 'Miscellaneous'];

  const totalExpenseSum = expenses?.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Expenses Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Log and track operating expenses</p>
        </div>
        <div className="card px-4 py-2 flex items-center gap-2 border-l-[3px] border-error bg-error/5 mt-0 h-fit">
          <div className="text-[11px] text-text-muted uppercase font-bold">Total Expenses:</div>
          <div className="text-[18px] font-bold text-error">
            ₹{(expensesTotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </header>

      {/* Grid Layout: Form on Left (1/3), List on Right (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-6">
        {/* Left Column: Form Card */}
        <div className="card h-fit p-5">
          <h2 className="text-[15px] font-bold mb-4 border-b border-border pb-2">
            {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
          </h2>

          <form onSubmit={handleSave} className="flex flex-col gap-3.5">
            <div className="form-group">
              <label>Expense Date *</label>
              <input
                type="date"
                className="invoice-form-item-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <Dropdown
                options={categories}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                searchable={false}
                selectStyle={{ height: '36px' }}
              />
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                className="invoice-form-item-input"
                placeholder="e.g. Office rent, Internet bill, etc."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                className="invoice-form-item-input"
                placeholder="e.g. 1500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                min="0.01"
                step="0.01"
                required
              />
            </div>



            <div className="form-group">
              <label>Payment Method</label>
              <Dropdown
                options={['Cash', 'Bank Transfer', 'Card', 'UPI', 'Check', 'Other']}
                value={formData.paymentMethod}
                onChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                searchable={false}
                selectStyle={{ height: '36px' }}
              />
            </div>

            <div className="form-group">
              <label>Spent By</label>
              <Dropdown
                options={users.map(u => ({ value: u.username, label: u.name ? `${u.name} (${u.username})` : u.username }))}
                value={formData.spentBy}
                onChange={(val) => setFormData({ ...formData, spentBy: val })}
                searchable={true}
                clearable={true}
                placeholder="Select who spent..."
                selectStyle={{ height: '36px' }}
              />
            </div>

            <div className="form-group">
              <label>Description / Notes</label>
              <textarea
                className="invoice-form-item-input"
                rows="2"
                placeholder="Details of expense..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Receipt Attachment</label>
              {!formData.attachment ? (
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: '8px',
                    padding: '20px 10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(0,0,0,0.2)',
                    transition: 'all 0.2s',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const event = { target: { files: [file] } };
                      handleFileChange(event);
                    }
                  }}
                >
                  <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Drag & drop or <span style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>browse</span>
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Supports PNG, JPG, PDF up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12.5px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <FileText size={16} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }} title={formData.attachmentName}>
                      {formData.attachmentName || 'Uploaded File'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, attachment: '', attachmentName: '' }))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleResetForm}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  flexGrow: 1,
                  fontSize: '13px'
                }}
              >
                Clear
              </button>
              <button
                type="submit"
                className="btn-add-item-row"
                style={{ marginTop: 0, width: 'auto', padding: '8px 24px', flexGrow: 2, fontSize: '13px' }}
              >
                {editingExpense ? 'Update' : 'Save'} Expense
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: List Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filters card */}
          <div className="card" style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', flexGrow: 1 }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search title or description..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={12} style={{ color: 'var(--text-muted)' }} />
              <Dropdown
                placeholder="All Categories"
                options={categories}
                value={categoryFilter}
                onChange={(val) => { setCategoryFilter(val); setPage(1); }}
                searchable={false}
                clearable={true}
                style={{ width: '150px' }}
                selectStyle={{ height: '32px', padding: '4px 10px', background: 'rgba(0,0,0,0.2)' }}
              />
            </div>
          </div>

          {/* Table list card */}
          <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
            {isLoading && expenses?.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Loader2 size={24} className="spin" style={{ color: 'var(--secondary)', margin: '0 auto 8px' }} />
                <p>Loading expense logs...</p>
              </div>
            ) : expenses?.length === 0 ? (
              <div style={{ padding: '45px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No expenses logged matching search criteria.
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <div className="overflow-x-auto w-full max-w-full custom-scrollbar"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Date</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Category</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Title & Description</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Payment</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Spent By</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>Amount</th>
                        <th style={{ padding: '10px 12px', width: '70px', textAlign: 'center', color: 'var(--text-secondary)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp) => (
                        <tr 
                          key={exp._id} 
                          className="clickable-row"
                          onClick={() => setPreviewExpense(exp)}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
                        >
                          <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                            {new Date(exp.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: '500' }}>
                            <span className="badge category-badge" style={{ fontSize: '11px', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                              {exp.category}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div 
                                style={{ fontWeight: '600', cursor: 'pointer', textDecoration: 'underline decoration-dotted', textUnderlineOffset: '3px' }} 
                                onClick={() => setPreviewExpense(exp)}
                                title="Click to view detailed receipt preview"
                              >
                                {exp.title || '-'}
                              </div>
                              {exp.attachment && (
                                <button
                                  onClick={() => setPreviewExpense(exp)}
                                  title={exp.attachmentName || "View attachment preview"}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', padding: '2px' }}
                                >
                                  <Paperclip size={13} />
                                </button>
                              )}
                            </div>
                            {exp.description && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{exp.description}</div>}
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{exp.paymentMethod}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                            {(() => {
                              const spentByUser = users.find(u => u.username === exp.spentBy);
                              return spentByUser ? (spentByUser.name || spentByUser.username) : (exp.spentBy || '-');
                            })()}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: 'rgb(239, 68, 68)' }}>
                            - ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(exp);
                                }} 
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(exp._id);
                                }} 
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>

                {expensesTotal > limit && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Showing {(page - 1) * limit + 1} - {Math.min(page * limit, expensesTotal)} of {expensesTotal} items
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        Prev
                      </button>
                      <button
                        disabled={page * limit >= expensesTotal}
                        onClick={() => setPage(page + 1)}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <CustomConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* EXPENSE PREVIEW MODAL */}
      {previewExpense && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(13, 12, 10, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'rgba(26, 24, 21, 0.98)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            width: '90%',
            maxWidth: previewExpense.attachment ? '950px' : '500px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            overflow: 'hidden',
            fontFamily: "'Outfit', sans-serif"
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#F5F2EB' }}>Expense Details</h3>
                <span className="badge" style={{ marginTop: '4px', display: 'inline-block', textTransform: 'uppercase' }}>{previewExpense.category}</span>
              </div>
              <button 
                onClick={() => setPreviewExpense(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'grid', gridTemplateColumns: previewExpense.attachment ? '1fr 1.5fr' : '1fr', gap: '24px', padding: '24px', overflowY: 'auto' }} className="grid-responsive">
              {/* Left Column: Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'rgba(231, 76, 60, 0.04)', borderLeft: '4px solid var(--error)', padding: '14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>Amount Paid</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'rgb(239, 68, 68)' }}>
                    - ₹{previewExpense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Title</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{previewExpense.title}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Date of Expense</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {new Date(previewExpense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Payment Method</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{previewExpense.paymentMethod}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Spent By</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {(() => {
                        const spentByUser = users.find(u => u.username === previewExpense.spentBy);
                        return spentByUser ? (spentByUser.name || spentByUser.username) : (previewExpense.spentBy || '-');
                      })()}
                    </span>
                  </div>
                  {previewExpense.description && (
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Description / Notes</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', lineHeight: '1.4' }}>{previewExpense.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Attachment Preview */}
              {previewExpense.attachment && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                      Receipt Attachment: <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontFamily: 'monospace' }}>{previewExpense.attachmentName || 'receipt'}</span>
                    </span>
                    
                    {/* Download Button */}
                    <a 
                      href={previewExpense.attachment} 
                      download={previewExpense.attachmentName || 'receipt'}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--primary)',
                        color: '#fff',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <Download size={13} />
                      Download file
                    </a>
                  </div>

                  <div style={{
                    flexGrow: 1,
                    minHeight: '300px',
                    border: '1px dashed var(--border)',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {previewExpense.attachment.startsWith('data:image/') ? (
                      <img 
                        src={previewExpense.attachment} 
                        alt="Receipt attachment" 
                        style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '4px' }} 
                      />
                    ) : previewExpense.attachment.startsWith('data:application/pdf') ? (
                      <object
                        data={previewExpense.attachment}
                        type="application/pdf"
                        width="100%"
                        height="420px"
                        style={{ borderRadius: '4px' }}
                      >
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          Unable to render PDF preview inline. Use download button above to view.
                        </div>
                      </object>
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Preview not available for this file type. Please download to view.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 24px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
              <button 
                onClick={() => setPreviewExpense(null)} 
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: 'bold',
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
