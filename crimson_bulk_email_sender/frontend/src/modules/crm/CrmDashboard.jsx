import React, { useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Users, FileText, CheckCircle2, XCircle, TrendingUp, Calendar, Clock, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

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
    upcomingFollowUps: []
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>CRM Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Real-time sales performance and customer interactions
          </p>
        </div>
        <button className="btn-icon-label" onClick={fetchDashboard} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          Refresh Stats
        </button>
      </header>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Leads Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Total Leads</div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginTop: '2px' }}>
              {stats.totalLeads}
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Total Customers</div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginTop: '2px' }}>
              {stats.totalCustomers}
            </div>
          </div>
        </div>

        {/* Open Deals Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '12px', borderRadius: '12px', color: 'var(--warning)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Open Deals</div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginTop: '2px' }}>
              {stats.openDeals}
            </div>
          </div>
        </div>

        {/* Won/Lost ratio */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '12px', borderRadius: '12px', color: 'var(--error)' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Deals Won / Lost</div>
            <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginTop: '2px' }}>
              <span style={{ color: 'var(--success)' }}>{stats.wonDeals} W</span>
              <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>/</span>
              <span style={{ color: 'var(--error)' }}>{stats.lostDeals} L</span>
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', gridColumn: 'span 2' }}>
          <div style={{ background: 'rgba(255, 199, 44, 0.15)', padding: '12px', borderRadius: '12px', color: 'var(--secondary)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Closed Won Revenue</div>
            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--secondary)', marginTop: '2px' }}>
              ₹{stats.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid for Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Left Side: Upcoming Follow Ups Reminder Widget */}
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
                const actTime = new Date(act.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                const actDate = new Date(act.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                
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
