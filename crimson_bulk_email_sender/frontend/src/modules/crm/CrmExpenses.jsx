import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Search, Plus, Edit, Trash2, X, Filter, Loader2, DollarSign, Calendar, FileText, ArrowDownRight } from 'lucide-react';

export default function CrmExpenses() {
  const {
    expenses,
    expensesTotal,
    isLoading,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchDashboard
  } = useCrm();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Form state
  const [editingExpense, setEditingExpense] = useState(null); // null for create, object for edit
  const [formData, setFormData] = useState({
    category: 'Office Expenses',
    amount: '',
    date: new Date().toISOString().substring(0, 10),
    vendor: '',
    paymentMethod: 'Cash',
    description: '',
    attachment: ''
  });

  useEffect(() => {
    fetchExpenses({ search, category: categoryFilter, page, limit });
  }, [search, categoryFilter, page]);

  const handleResetForm = () => {
    setEditingExpense(null);
    setFormData({
      category: 'Office Expenses',
      amount: '',
      date: new Date().toISOString().substring(0, 10),
      vendor: '',
      paymentMethod: 'Cash',
      description: '',
      attachment: ''
    });
  };

  const handleStartEdit = (exp) => {
    setEditingExpense(exp);
    setFormData({
      category: exp.category || 'Office Expenses',
      amount: exp.amount.toString(),
      date: new Date(exp.date).toISOString().substring(0, 10),
      vendor: exp.vendor || '',
      paymentMethod: exp.paymentMethod || 'Cash',
      description: exp.description || '',
      attachment: exp.attachment || ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Valid amount is required');
      return;
    }
    if (!formData.date) {
      alert('Date is required');
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
      } else {
        await createExpense(payload);
      }
      handleResetForm();
      fetchExpenses({ search, category: categoryFilter, page, limit });
      fetchDashboard();
      alert('Expense saved successfully');
    } catch (err) {
      alert(err.message || 'Error saving expense');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        fetchExpenses({ search, category: categoryFilter, page, limit });
        fetchDashboard();
      } catch (err) {
        alert(err.message || 'Error deleting expense');
      }
    }
  };

  const categories = ['Office Expenses', 'Travel', 'Marketing', 'Salary', 'Utilities', 'Miscellaneous'];

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Expenses Management</h1>
        </div>
      </header>

      {/* Grid Layout: Form on Left (1/3), List on Right (2/3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        {/* Left Column: Form Card */}
        <div className="card" style={{ height: 'fit-content', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
          </h2>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
              <select
                className="invoice-form-item-input"
                style={{ height: '36px' }}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
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
              <select
                className="invoice-form-item-input"
                style={{ height: '36px' }}
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Check">Check</option>
                <option value="Other">Other</option>
              </select>
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
              <label>Receipt URL / Alphanumeric Attachment</label>
              <input
                type="text"
                className="invoice-form-item-input"
                placeholder="e.g. receipt_july_2026.pdf"
                value={formData.attachment}
                onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
              />
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
                placeholder="Search vendor or description..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={12} style={{ color: 'var(--text-muted)' }} />
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '6px 10px', fontSize: '12px' }}
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Table list card */}
          <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
            {isLoading && expenses.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Loader2 size={24} className="spin" style={{ color: 'var(--secondary)', margin: '0 auto 8px' }} />
                <p>Loading expense logs...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div style={{ padding: '45px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No expenses logged matching search criteria.
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Date</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Category</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Vendor & Description</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Payment</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>Amount</th>
                        <th style={{ padding: '10px 12px', width: '70px', textAlign: 'center', color: 'var(--text-secondary)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp) => (
                        <tr key={exp._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                            {new Date(exp.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: '500' }}>
                            <span className="badge category-badge" style={{ fontSize: '11px', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                              {exp.category}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: '600' }}>{exp.vendor || '-'}</div>
                            {exp.description && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{exp.description}</div>}
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{exp.paymentMethod}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: 'rgb(239, 68, 68)' }}>
                            - ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => handleStartEdit(exp)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDelete(exp._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
    </div>
  );
}
