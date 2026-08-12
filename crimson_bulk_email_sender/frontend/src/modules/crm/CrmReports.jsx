import React, { useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { BarChart3, TrendingUp, Users, RefreshCw, Loader2, Award, DollarSign, Activity } from 'lucide-react';

export default function CrmReports() {
  const {
    reportsStats,
    isLoading,
    fetchReports
  } = useCrm();

  useEffect(() => {
    fetchReports();
  }, []);

  if (isLoading && !reportsStats) {
    return (
      <div className="empty-state">
        <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)' }} />
        <p>Analyzing CRM metrics and compiling report database...</p>
      </div>
    );
  }

  const r = reportsStats || {
    totalLeads: 0,
    leadConversionRate: 0,
    winLossRatio: 0,
    revenueByStage: {},
    staffPerformance: {},
    wonCount: 0,
    lostCount: 0,
    totalDealsValue: 0,
    wonDealsValue: 0
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>CRM Analytics Reports</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Comprehensive analytics covering pipeline health, staff efficiency, and conversion ratios.
          </p>
        </div>
        <button className="btn-icon-label" onClick={fetchReports} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          Recalculate
        </button>
      </header>

      {/* Reports Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '30px' }}>
        
        {/* Lead Conversion Progress */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            <Users size={16} />
            Lead Conversion Rate
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--secondary)' }}>
            {r.leadConversionRate.toFixed(1)}%
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', height: '10px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ background: 'var(--secondary)', width: `${Math.min(r.leadConversionRate, 100)}%`, height: '100%', borderRadius: '10px', transition: 'width 0.8s ease-in-out' }}></div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Percentage of leads converted to Won customers.
          </div>
        </div>

        {/* Win/Loss Split */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            <Activity size={16} />
            Won / Lost Ratio
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--success)' }}>
            {r.winLossRatio.toFixed(1)}%
          </div>
          <div style={{ display: 'flex', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
            {r.wonCount + r.lostCount > 0 ? (
              <>
                <div style={{ background: 'var(--success)', width: `${(r.wonCount / (r.wonCount + r.lostCount)) * 100}%`, height: '100%' }}></div>
                <div style={{ background: 'var(--error)', width: `${(r.lostCount / (r.wonCount + r.lostCount)) * 100}%`, height: '100%' }}></div>
              </>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.05)', width: '100%', height: '100%' }}></div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{r.wonCount} Won Deals</span>
            <span style={{ color: 'var(--error)', fontWeight: 'bold' }}>{r.lostCount} Lost Deals</span>
          </div>
        </div>

        {/* Total Deals Value Pipeline */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
            <DollarSign size={16} />
            Total Value in Pipeline
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            ₹{r.totalDealsValue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
            <TrendingUp size={14} />
            ₹{r.wonDealsValue.toLocaleString('en-IN')} Secured (Closed Won)
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Aggregate values of all active and closed deals.
          </div>
        </div>

      </div>

      {/* Main Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* Stage Wise Revenue Breakdowns */}
        <div className="card">
          <div className="card-title">
            <BarChart3 size={16} />
            Revenue by Stage
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.keys(r.revenueByStage).length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No active stages revenue found.
              </div>
            ) : (
              Object.entries(r.revenueByStage).map(([stage, val]) => {
                const maxVal = Math.max(...Object.values(r.revenueByStage), 1);
                const percent = (val / maxVal) * 100;
                return (
                  <div key={stage}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600' }}>{stage}</span>
                      <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>₹{val.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ background: stage === 'Won' ? 'var(--success)' : stage === 'Lost' ? 'var(--error)' : 'var(--primary-light)', width: `${percent}%`, height: '100%', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Staff Sales Performance */}
        <div className="card" style={{ padding: '0px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-title" style={{ borderBottom: 'none', margin: '24px 24px 12px 24px', padding: 0 }}>
            <Award size={16} />
            Staff & Team Performance
          </div>

          {Object.keys(r.staffPerformance).length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No deals are currently assigned to sales staff.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <div className="overflow-x-auto w-full max-w-full custom-scrollbar"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--text-secondary)' }}>Representative</th>
                    <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Deals Handled</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--text-secondary)' }}>Total Value (₹)</th>
                    <th style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Deals Won</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--text-secondary)' }}>Secured Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(r.staffPerformance).map(([user, data]) => (
                    <tr key={user} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{user}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>{data.count}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '600' }}>₹{data.value.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', color: 'var(--success)', fontWeight: 'bold' }}>{data.wonCount}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--success)', fontWeight: '800' }}>₹{data.wonValue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
