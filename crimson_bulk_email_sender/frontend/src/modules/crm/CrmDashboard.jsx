import React, { useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Users, FileText, CheckCircle2, XCircle, TrendingUp, Calendar, Clock, RefreshCw, Loader2, ArrowRight, DollarSign } from 'lucide-react';

export default function CrmDashboard() {
  const {
    dashboardStats,
    isLoading,
    fetchDashboard
  } = useCrm();

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading && !dashboardStats) {
    return (
      <div className="empty-state">
        <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)' }} />
        <p>Loading CRM metrics...</p>
      </div>
    );
  }

  const stats = dashboardStats || {
    totalLeads: 0,
    totalCustomers: 0,
    openDeals: 0,
    wonDeals: 0,
    lostDeals: 0,
    revenue: 0,
    recentActivities: [],
    upcomingFollowUps: [],
    leadMetrics: { totalLeads: 0, newLeads: 0, contactedLeads: 0, proposalSentLeads: 0, convertedLeads: 0, lostLeads: 0 },
    orderMetrics: { totalOrders: 0, pendingOrders: 0, processingOrders: 0, completedOrders: 0 },
    financialMetrics: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, outstandingPayments: 0 }
  };

  const leadMetrics = stats.leadMetrics || { totalLeads: 0, newLeads: 0, contactedLeads: 0, proposalSentLeads: 0, convertedLeads: 0, lostLeads: 0 };
  const orderMetrics = stats.orderMetrics || { totalOrders: 0, pendingOrders: 0, processingOrders: 0, completedOrders: 0 };
  const financialMetrics = stats.financialMetrics || { totalRevenue: 0, totalExpenses: 0, netProfit: 0, outstandingPayments: 0 };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>CRM Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Real-time pipeline metrics, financial logs, and customer interactions
          </p>
        </div>
        <button className="btn-icon-label" onClick={fetchDashboard} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          Refresh Stats
        </button>
      </header>

      {/* SECTION 1: Financial Metrics Grid */}
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Financial Performance</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>

        {/* Revenue Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(74, 222, 128, 0.15)', padding: '12px', borderRadius: '12px', color: 'rgb(74, 222, 128)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Total Revenue</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
              ₹{financialMetrics.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '12px', borderRadius: '12px', color: 'rgb(239, 68, 68)' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Total Expenses</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
              ₹{financialMetrics.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: financialMetrics.netProfit >= 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)', padding: '12px', borderRadius: '12px', color: financialMetrics.netProfit >= 0 ? '#3b82f6' : 'rgb(239, 68, 68)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Net Profit</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: financialMetrics.netProfit >= 0 ? 'rgb(74, 222, 128)' : 'rgb(239, 68, 68)', marginTop: '2px' }}>
              ₹{financialMetrics.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Outstanding Payments Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '12px', borderRadius: '12px', color: 'rgb(245, 158, 11)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Outstanding Payments</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
              ₹{financialMetrics.outstandingPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: Pipeline breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>

        {/* Leads breakdown */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Users size={16} style={{ color: '#3b82f6' }} />
            Leads Pipeline ({leadMetrics.totalLeads} Total)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>New: <strong>{leadMetrics.newLeads}</strong></span>
              <span>Contacted: <strong>{leadMetrics.contactedLeads}</strong></span>
              <span>Proposal Sent: <strong>{leadMetrics.proposalSentLeads}</strong></span>
              <span>Converted: <strong style={{ color: 'rgb(74, 222, 128)' }}>{leadMetrics.convertedLeads}</strong></span>
            </div>

            {/* Custom Visual CSS Bar Chart */}
            <div style={{ height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', margin: '6px 0' }}>
              {leadMetrics.totalLeads > 0 ? (
                <>
                  <div style={{ width: `${(leadMetrics.newLeads / leadMetrics.totalLeads) * 100}%`, background: '#3b82f6' }} title={`New: ${leadMetrics.newLeads}`}></div>
                  <div style={{ width: `${(leadMetrics.contactedLeads / leadMetrics.totalLeads) * 100}%`, background: '#eab308' }} title={`Contacted: ${leadMetrics.contactedLeads}`}></div>
                  <div style={{ width: `${(leadMetrics.proposalSentLeads / leadMetrics.totalLeads) * 100}%`, background: '#a855f7' }} title={`Proposal Sent: ${leadMetrics.proposalSentLeads}`}></div>
                  <div style={{ width: `${(leadMetrics.convertedLeads / leadMetrics.totalLeads) * 100}%`, background: '#22c55e' }} title={`Converted: ${leadMetrics.convertedLeads}`}></div>
                  <div style={{ width: `${(leadMetrics.lostLeads / leadMetrics.totalLeads) * 100}%`, background: '#ef4444' }} title={`Lost: ${leadMetrics.lostLeads}`}></div>
                </>
              ) : (
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}></div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span> New</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }}></span> Contacted</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }}></span> Proposal</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span> Converted</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span> Lost</span>
            </div>
          </div>
        </div>

        {/* Orders breakdown */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FileText size={16} style={{ color: 'var(--secondary)' }} />
            Orders Operations ({orderMetrics.totalOrders} Total)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>Pending: <strong>{orderMetrics.pendingOrders}</strong></span>
              <span>Processing: <strong>{orderMetrics.processingOrders}</strong></span>
              <span>Completed: <strong style={{ color: 'rgb(74, 222, 128)' }}>{orderMetrics.completedOrders}</strong></span>
            </div>

            {/* Custom Visual CSS Bar Chart */}
            <div style={{ height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', margin: '6px 0' }}>
              {orderMetrics.totalOrders > 0 ? (
                <>
                  <div style={{ width: `${(orderMetrics.pendingOrders / orderMetrics.totalOrders) * 100}%`, background: '#f59e0b' }} title={`Pending: ${orderMetrics.pendingOrders}`}></div>
                  <div style={{ width: `${(orderMetrics.processingOrders / orderMetrics.totalOrders) * 100}%`, background: '#3b82f6' }} title={`Processing: ${orderMetrics.processingOrders}`}></div>
                  <div style={{ width: `${(orderMetrics.completedOrders / orderMetrics.totalOrders) * 100}%`, background: '#10b981' }} title={`Completed: ${orderMetrics.completedOrders}`}></div>
                  <div style={{ width: `${((orderMetrics.totalOrders - orderMetrics.pendingOrders - orderMetrics.processingOrders - orderMetrics.completedOrders) / orderMetrics.totalOrders) * 100}%`, background: '#64748b' }} title={`Other lifecycle stages`}></div>
                </>
              ) : (
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}></div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span> Pending</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span> Processing</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Completed</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }}></span> Others</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: Upcoming and Activity logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

        {/* Left Side: Upcoming Follow Ups */}
        <div className="card">
          <div className="card-title">
            <Calendar size={16} />
            Upcoming Follow Ups
          </div>

          {stats.upcomingFollowUps.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No follow-ups scheduled for the upcoming days. Keep it up!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.upcomingFollowUps.map((follow) => {
                const followDate = new Date(follow.date).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                return (
                  <div key={follow._id} style={{ display: 'flex', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--secondary)' }}>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{follow.customer?.name || 'Customer Check-in'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{follow.reminder}</div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {followDate}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {follow.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Recent Activity Timeline */}
        <div className="card">
          <div className="card-title">
            <TrendingUp size={16} />
            Recent Activity Logs
          </div>

          {stats.recentActivities.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No activity logs recorded. Actions will be logged here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '8px' }}>
              {/* Timeline line */}
              <div style={{ position: 'absolute', top: '8px', bottom: '8px', left: '12px', width: '1px', background: 'var(--border)' }}></div>

              {stats.recentActivities.map((act) => {
                const actTime = new Date(act.timestamp || act.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                const actDate = new Date(act.timestamp || act.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

                let dotColor = 'var(--text-muted)';
                if (act.action === 'CREATE') dotColor = 'var(--success)';
                if (act.action === 'DELETE') dotColor = 'var(--error)';
                if (act.action === 'STAGE_CHANGE') dotColor = 'var(--secondary)';

                return (
                  <div key={act._id} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, marginTop: '7px', boxShadow: `0 0 8px ${dotColor}` }}></div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                        {act.details}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span>by <strong>{act.createdBy}</strong></span>
                        <span>•</span>
                        <span>{actDate} at {actTime}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
