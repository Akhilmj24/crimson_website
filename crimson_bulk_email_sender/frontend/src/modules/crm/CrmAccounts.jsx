import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { CreditCard, DollarSign, Clock, CheckCircle, Plus, Search, X, Loader2, FileText, ArrowUpRight } from 'lucide-react';

export default function CrmAccounts() {
  const {
    orders: rawOrders = [],
    payments: rawPayments = [],
    fetchOrders,
    fetchPayments,
    createPayment,
    isLoading,
    dashboardStats,
    fetchDashboard
  } = useCrm();

  const orders = rawOrders.filter(Boolean);
  const payments = rawPayments.filter(Boolean);

  const [activeSubTab, setActiveSubTab] = useState('eligible'); // 'eligible' | 'payments'

  // Record payment form states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    notes: '',
    paymentDate: new Date().toISOString().substring(0, 10)
  });

  useEffect(() => {
    fetchOrders({ limit: 100 });
    fetchPayments();
    fetchDashboard();
  }, []);

  // Filter completed/outstanding orders eligible for payment
  const eligibleOrders = orders.filter(o => o.status !== 'Cancelled' && o.paymentStatus !== 'Paid');

  // Record payment submit handler
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const amt = parseFloat(paymentForm.amount);
    if (!amt || amt <= 0) {
      alert('Valid payment amount is required');
      return;
    }

    try {
      await createPayment({
        orderId: selectedOrder._id,
        amount: amt,
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference,
        notes: paymentForm.notes,
        paymentDate: new Date(paymentForm.paymentDate)
      });

      // Refreshes
      fetchOrders({ limit: 100 });
      fetchPayments();
      fetchDashboard();

      setIsPaymentModalOpen(false);
      setSelectedOrder(null);
      setPaymentForm({
        amount: '',
        paymentMethod: 'Bank Transfer',
        transactionReference: '',
        notes: '',
        paymentDate: new Date().toISOString().substring(0, 10)
      });
      alert('Payment recorded successfully');
    } catch (err) {
      alert(err.message || 'Error recording payment');
    }
  };

  const handleOpenRecordPayment = (order) => {
    setSelectedOrder(order);

    // Find outstanding balance
    const orderPmts = payments.filter(p => p.orderId === order._id);
    const paidSum = orderPmts.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = order.totalAmount - paidSum;

    setPaymentForm(prev => ({
      ...prev,
      amount: outstanding.toString()
    }));
    setIsPaymentModalOpen(true);
  };

  // Summarize financial stats from dashboardStats or local collections
  const financialStats = dashboardStats?.financialMetrics || {
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    outstandingPayments: orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => {
      const paid = payments.filter(p => p.orderId === o._id).reduce((s, p) => s + p.amount, 0);
      return sum + Math.max(0, o.totalAmount - paid);
    }, 0)
  };

  const completedPaidCount = orders.filter(o => o.status === 'Completed' && o.paymentStatus === 'Paid').length;
  const pendingPaymentsCount = orders.filter(o => o.status === 'Completed' && o.paymentStatus !== 'Paid').length;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Income Module</h1>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(74, 222, 128, 0.1)', color: 'rgb(74, 222, 128)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Revenue</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
              ₹{financialStats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Outstanding Amount</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
              ₹{financialStats.outstandingPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'rgb(59, 130, 246)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Paid Completed Orders</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
              {completedPaidCount} Orders
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'rgb(245, 158, 11)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completed Outstanding</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
              {pendingPaymentsCount} Orders
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveSubTab('eligible')}
          style={{
            padding: '10px 20px',
            background: activeSubTab === 'eligible' ? 'var(--primary)' : 'transparent',
            color: '#fff',
            border: activeSubTab === 'eligible' ? 'none' : '1px solid transparent',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          Outstanding Orders
        </button>
        <button
          onClick={() => setActiveSubTab('payments')}
          style={{
            padding: '10px 20px',
            background: activeSubTab === 'payments' ? 'var(--primary)' : 'transparent',
            color: '#fff',
            border: activeSubTab === 'payments' ? 'none' : '1px solid transparent',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          Payments received log ({payments.length})
        </button>
      </div>

      {/* Tables section */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)', margin: '0 auto 12px' }} />
            <p>Loading accounts transactions...</p>
          </div>
        ) : activeSubTab === 'eligible' ? (
          /* Eligible orders tab */
          eligibleOrders.length === 0 ? (
            <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No outstanding orders found. All completed orders are fully paid!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Order #</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Customer</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Order Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>Order Total</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>Total Paid</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>Outstanding Balance</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleOrders.map((o) => {
                    const orderPmts = payments.filter(p => p.orderId === o._id);
                    const paidSum = orderPmts.reduce((sum, p) => sum + p.amount, 0);
                    const balance = o.totalAmount - paidSum;

                    return (
                      <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 'bold', color: 'var(--secondary)' }}>{o.orderNumber}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: '600' }}>{o.customerName}</div>
                          {o.companyName && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.companyName}</div>}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span className={`badge ${o.status.toLowerCase().replace(/ /g, '-')}`}>{o.status}</span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '500' }}>
                          ₹{o.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', color: 'rgb(74, 222, 128)' }}>
                          ₹{paidSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 'bold', color: 'rgb(239, 68, 68)' }}>
                          ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleOpenRecordPayment(o)}
                            style={{
                              background: 'var(--primary)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CreditCard size={13} />
                            Record Payment
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Payments Log tab */
          payments.length === 0 ? (
            <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No payments recorded yet. Fill payments from Outstanding tab or from Order detail.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Payment Date</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Associated Order</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Payment Method</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Reference ID</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Payment Notes</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>Amount Received</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const matchedOrder = orders.find(o => o._id === p.orderId);
                    return (
                      <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                          {new Date(p.paymentDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {matchedOrder ? (
                            <div>
                              <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{matchedOrder.orderNumber}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>({matchedOrder.customerName})</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Order ID: {p.orderId}</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>{p.paymentMethod}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {p.transactionReference || '-'}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          {p.notes || '-'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 'bold', color: 'rgb(74, 222, 128)', fontSize: '14px' }}>
                          + ₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Record Payment Dialog */}
      {isPaymentModalOpen && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>Record Payment: {selectedOrder.orderNumber}</h2>
              <button onClick={() => { setIsPaymentModalOpen(false); setSelectedOrder(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Payment Date</label>
                <input
                  type="date"
                  className="invoice-form-item-input"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  className="invoice-form-item-input"
                  placeholder="e.g. 5000"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
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
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
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
                <label>Transaction Reference ID</label>
                <input
                  type="text"
                  className="invoice-form-item-input"
                  placeholder="e.g. TXN9481940"
                  value={paymentForm.transactionReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Payment Notes</label>
                <textarea
                  className="invoice-form-item-input"
                  rows="2"
                  placeholder="Received partial advance"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => { setIsPaymentModalOpen(false); setSelectedOrder(null); }} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-add-item-row" style={{ marginTop: 0, width: 'auto', padding: '8px 24px', fontSize: '13px' }}>
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
