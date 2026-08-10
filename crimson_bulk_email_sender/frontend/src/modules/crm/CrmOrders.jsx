import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Search, Edit, Trash2, X, Filter, Loader2, ShoppingBag, Eye, Calendar, DollarSign, Clock, FileText, CheckCircle, Plus, Trash } from 'lucide-react';
import Dropdown from '../../components/Dropdown';

export default function CrmOrders() {
  const {
    orders: rawOrders = [],
    ordersTotal,
    isLoading,
    fetchOrders,
    updateOrder,
    deleteOrder,
    payments: rawPayments = [],
    fetchPayments,
    createPayment
  } = useCrm();

  const orders = rawOrders.filter(Boolean);
  const payments = rawPayments.filter(Boolean);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [orderPayments, setOrderPayments] = useState([]);

  // Payment dialog state (inside detail)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('full');
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    notes: '',
    paymentDate: new Date().toISOString().substring(0, 10)
  });

  useEffect(() => {
    fetchOrders({ search, status: statusFilter, paymentStatus: paymentFilter, page, limit });
  }, [search, statusFilter, paymentFilter, page]);

  const handleOpenDetail = async (order) => {
    setSelectedOrder(order);
    setStatusNotes('');
    setIsDetailOpen(true);
    // Fetch payments for this order
    try {
      const pmts = await fetchPayments({ orderId: order._id });
      setOrderPayments(pmts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPaymentModal = () => {
    const totalPaid = orderPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalAmount = selectedOrder?.totalAmount || 0;
    const remaining = Math.max(0, totalAmount - totalPaid);
    
    setPaymentForm({
      amount: remaining.toFixed(2),
      paymentMethod: 'Bank Transfer',
      transactionReference: '',
      notes: '',
      paymentDate: new Date().toISOString().substring(0, 10)
    });
    setPaymentType('full');
    setIsPaymentModalOpen(true);
  };

  const handleUpdateStatus = async (statusVal) => {
    if (!selectedOrder) return;

    if (statusVal === 'Completed') {
      const totalPaid = orderPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalAmount = selectedOrder.totalAmount || 0;
      if (totalPaid < totalAmount - 0.01) {
        alert(`Cannot mark order as Completed. Payment is not fully received. (Paid: ₹${totalPaid.toFixed(2)} / Grand Total: ₹${totalAmount.toFixed(2)})`);
        return;
      }
    }

    try {
      const updated = await updateOrder(selectedOrder._id, {
        status: statusVal,
        statusNotes: statusNotes || `Stage changed to ${statusVal}`
      });
      setSelectedOrder(updated);
      setStatusNotes('');
      // Re-fetch list
      fetchOrders({ search, status: statusFilter, paymentStatus: paymentFilter, page, limit });
      alert('Order status updated successfully');
    } catch (err) {
      alert(err.message || 'Error updating order status');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      alert('Valid payment amount is required');
      return;
    }

    const totalPaid = orderPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalAmount = selectedOrder.totalAmount || 0;
    const remaining = totalAmount - totalPaid;
    const enteredAmount = parseFloat(paymentForm.amount);

    if (enteredAmount > remaining + 0.01) {
      alert(`Payment amount (₹${enteredAmount.toFixed(2)}) cannot exceed the remaining balance (₹${remaining.toFixed(2)}).`);
      return;
    }

    try {
      await createPayment({
        orderId: selectedOrder._id,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference,
        notes: paymentForm.notes,
        paymentDate: new Date(paymentForm.paymentDate)
      });
      
      // Re-fetch order details
      const refreshed = orders.find(o => o._id === selectedOrder._id);
      if (refreshed) {
        setSelectedOrder(refreshed);
      } else {
        // Fallback: fetch orders list and extract
        const res = await fetchOrders({ search, status: statusFilter, paymentStatus: paymentFilter, page, limit });
        const match = res.data.find(o => o._id === selectedOrder._id);
        if (match) setSelectedOrder(match);
      }

      // Re-fetch payments
      const pmts = await fetchPayments({ orderId: selectedOrder._id });
      setOrderPayments(pmts || []);

      setIsPaymentModalOpen(false);
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

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id);
        fetchOrders({ search, status: statusFilter, paymentStatus: paymentFilter, page, limit });
        setIsDetailOpen(false);
      } catch (err) {
        alert(err.message || 'Error deleting order');
      }
    }
  };

  const orderStatuses = ['Pending', 'Processing', 'Production', 'Ready for Dispatch', 'Shipped', 'Delivered', 'Completed', 'Cancelled'];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Orders Management</h1>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', flexGrow: 1, minWidth: '240px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search orders by customer or order number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <Dropdown
            placeholder="All Statuses"
            options={orderStatuses}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            searchable={false}
            clearable={true}
            style={{ width: '150px' }}
            selectStyle={{ height: '32px', padding: '4px 10px', background: 'rgba(0,0,0,0.2)' }}
          />

          <Dropdown
            placeholder="All Payments"
            options={['Unpaid', 'Partially Paid', 'Paid']}
            value={paymentFilter}
            onChange={(val) => { setPaymentFilter(val); setPage(1); }}
            searchable={false}
            clearable={true}
            style={{ width: '150px' }}
            selectStyle={{ height: '32px', padding: '4px 10px', background: 'rgba(0,0,0,0.2)' }}
          />
        </div>
      </div>

      {/* Orders Grid/Table */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        {isLoading && orders.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)', margin: '0 auto 12px' }} />
            <p>Loading confirmed orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No orders found. Set lead status to "Order Confirmed" to automatically generate orders!
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Order #</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Customer</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)' }}>Date Created</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>Amount</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Payment</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 'bold', color: 'var(--secondary)' }}>{o.orderNumber}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600' }}>{o.customerSalutation ? `${o.customerSalutation} ${o.customerName}` : o.customerName}</div>
                        {o.companyName && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.companyName}</div>}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 'bold' }}>
                        ₹{Number(o.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span className={`badge ${o.status.toLowerCase().replace(/ /g, '-')}`}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span className={`badge ${o.paymentStatus.toLowerCase().replace(/ /g, '-')}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenDetail(o)}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            color: '#fff',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={13} />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {ordersTotal > limit && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Showing {(page - 1) * limit + 1} - {Math.min(page * limit, ordersTotal)} of {ordersTotal} orders
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
                    disabled={page * limit >= ordersTotal}
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

      {/* Order Detail Modal */}
      {isDetailOpen && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 90, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Order Details: {selectedOrder.orderNumber}</h2>
                <span className={`badge ${selectedOrder.status.toLowerCase().replace(/ /g, '-')}`}>{selectedOrder.status}</span>
                <span className={`badge ${selectedOrder.paymentStatus.toLowerCase().replace(/ /g, '-')}`}>{selectedOrder.paymentStatus}</span>
              </div>
              <button onClick={() => setIsDetailOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              {/* Left Column: Summary and items */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '10px' }}>Customer Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                    <div><strong>Customer Name:</strong> {selectedOrder.customerSalutation ? `${selectedOrder.customerSalutation} ${selectedOrder.customerName}` : selectedOrder.customerName}</div>
                    <div><strong>Company Name:</strong> {selectedOrder.companyName || '-'}</div>
                    <div><strong>Email:</strong> {selectedOrder.email || '-'}</div>
                    <div><strong>Phone:</strong> {selectedOrder.phone || '-'}</div>
                    {selectedOrder.expectedDeliveryDate && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <strong>Expected Delivery Date:</strong> {new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '10px' }}>Products / Items</h3>
                  <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '8px', textAlign: 'left' }}>Item</th>
                          <th style={{ padding: '8px', width: '50px', textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '8px', width: '90px', textAlign: 'right' }}>Price</th>
                          <th style={{ padding: '8px', width: '60px', textAlign: 'center' }}>Disc %</th>
                          <th style={{ padding: '8px', width: '60px', textAlign: 'center' }}>Tax %</th>
                          <th style={{ padding: '8px', width: '90px', textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.products.map((p, idx) => {
                          const subTotal = p.quantity * p.unitPrice;
                          const discAmt = (subTotal * (p.discount || 0)) / 100;
                          const taxAmt = ((subTotal - discAmt) * (p.tax || 0)) / 100;
                          const total = subTotal - discAmt + taxAmt;

                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                              <td style={{ padding: '8px' }}>{p.name}</td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>{p.quantity}</td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>₹{p.unitPrice.toFixed(2)}</td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>{p.discount || 0}%</td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>{p.tax || 0}%</td>
                              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>₹{total.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)' }}>
                          <td colSpan="5" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold' }}>Order Grand Total:</td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold', color: 'var(--secondary)', fontSize: '13px' }}>
                            ₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payments Log */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Payments Log</h3>
                    {selectedOrder.paymentStatus !== 'Paid' && (
                      <button
                        onClick={handleOpenPaymentModal}
                        style={{
                          background: 'var(--primary)',
                          color: '#fff',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={12} />
                        Record Payment
                      </button>
                    )}
                  </div>
                  {orderPayments.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic', padding: '8px 0' }}>
                      No payments received for this order.
                    </div>
                  ) : (
                    <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {orderPayments.map((p, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px', marginBottom: '8px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>₹{p.amount.toFixed(2)} ({p.paymentMethod})</span>
                            <span style={{ color: 'var(--text-muted)' }}>{new Date(p.paymentDate).toLocaleDateString()}</span>
                          </div>
                          {p.transactionReference && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Ref: {p.transactionReference}</div>}
                          {p.notes && <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '2px' }}>Notes: {p.notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Life cycle updates & History */}
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '10px' }}>Update Order Stage</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Select Stage</label>
                      <Dropdown
                        options={orderStatuses}
                        value={selectedOrder.status}
                        onChange={(val) => handleUpdateStatus(val)}
                        searchable={false}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Timeline Notes / Reason</label>
                      <textarea
                        className="invoice-form-item-input"
                        rows="2"
                        placeholder="e.g. Shipped via Fedex Tracking #123"
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        style={{ fontSize: '12px' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '10px' }}>Timeline & History</h3>
                  <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '250px', overflowY: 'auto' }}>
                    {selectedOrder.statusHistory && selectedOrder.statusHistory.map((h, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '-23px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--background)' }}></span>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                          <span className={`badge ${h.status.toLowerCase().replace(/ /g, '-')}`}>{h.status}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '6px' }}>by {h.updatedBy || 'system'}</span>
                        </div>
                        {h.notes && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{h.notes}</div>}
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(h.createdAt || h.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '30px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder._id)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--error)',
                      color: 'var(--error)',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>Record Payment: {selectedOrder.orderNumber}</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
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
                <label>Payment Type</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="full"
                      checked={paymentType === 'full'}
                      onChange={() => {
                        setPaymentType('full');
                        const totalPaid = orderPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                        const remaining = Math.max(0, (selectedOrder?.totalAmount || 0) - totalPaid);
                        setPaymentForm({ ...paymentForm, amount: remaining.toFixed(2) });
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    Full Amount (₹{Math.max(0, (selectedOrder?.totalAmount || 0) - orderPayments.reduce((sum, p) => sum + (p.amount || 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="partial"
                      checked={paymentType === 'partial'}
                      onChange={() => {
                        setPaymentType('partial');
                        setPaymentForm({ ...paymentForm, amount: '' });
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    Partial Amount
                  </label>
                </div>
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
                  readOnly={paymentType === 'full'}
                  style={{ background: paymentType === 'full' ? 'rgba(255,255,255,0.02)' : 'transparent', color: paymentType === 'full' ? 'var(--text-muted)' : 'var(--text-primary)' }}
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <Dropdown
                  options={['Cash', 'Bank Transfer', 'Card', 'UPI', 'Check', 'Other']}
                  value={paymentForm.paymentMethod}
                  onChange={(val) => setPaymentForm({ ...paymentForm, paymentMethod: val })}
                  searchable={false}
                  selectStyle={{ height: '36px' }}
                />
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
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
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
