import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { crmService } from '../../services/crmService';
import {
  BarChart3, Scale, Receipt, CreditCard, DollarSign, Calendar, Search,
  ArrowUpRight, ArrowDownRight, Eye, ChevronDown, ChevronRight, FileText,
  Download, Printer, Info, CheckCircle, AlertTriangle,
  FolderOpen, History
} from 'lucide-react';
import Dropdown from '../../components/Dropdown';

export default function CrmAccounting() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Date Filtering State
  const [dateFilter, setDateFilter] = useState('This Month');
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Active Section Tab
  const [activeTab, setActiveTab] = useState('overview'); // overview, pl, bs, ledger, journal, accounts, reports

  // Search & Filters for Ledger
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerAccountFilter, setLedgerAccountFilter] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('');

  // Expandable Account Details
  const [expandedAccount, setExpandedAccount] = useState(null);

  // Date range pre-defined presets
  const getDateRange = (preset) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case 'Today':
        return { startDate: today.toISOString().substring(0, 10), endDate: today.toISOString().substring(0, 10) };
      case 'This Week': {
        const first = today.getDate() - today.getDay();
        const startOfWeek = new Date(today.setDate(first));
        const endOfWeek = new Date(today.setDate(first + 6));
        return { startDate: startOfWeek.toISOString().substring(0, 10), endDate: endOfWeek.toISOString().substring(0, 10) };
      }
      case 'This Month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { startDate: startOfMonth.toISOString().substring(0, 10), endDate: endOfMonth.toISOString().substring(0, 10) };
      }
      case 'This Year': {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        return { startDate: startOfYear.toISOString().substring(0, 10), endDate: endOfYear.toISOString().substring(0, 10) };
      }
      case 'Custom':
      default:
        return customRange;
    }
  };

  const fetchAccountingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const range = getDateRange(dateFilter);
      const params = {};
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;

      const res = await crmService.getAccountingSummary(params);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load accounting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountingData();
  }, [dateFilter]);

  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    fetchAccountingData();
  };

  // Helper: Format Currency
  const formatCurrency = (val) => {
    return '₹' + (val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Helper: Format Date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Excel Export Handler
  const exportToExcel = (reportType) => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    if (reportType === 'pl') {
      csvContent += "Profit & Loss Statement\n";
      csvContent += `Period: ${formatDate(data.period.startDate)} to ${formatDate(data.period.endDate)}\n\n`;
      csvContent += "Category,Amount\n";
      csvContent += `Sales Revenue,${data.profitLoss.revenue.sales}\n`;
      csvContent += `Other Income,${data.profitLoss.revenue.otherIncome}\n`;
      csvContent += `Total Revenue,${data.profitLoss.revenue.sales + data.profitLoss.revenue.otherIncome}\n\n`;
      csvContent += "Operating Expenses\n";
      Object.entries(data.profitLoss.expenses).forEach(([cat, val]) => {
        csvContent += `${cat},${val}\n`;
      });
      csvContent += `Total Expenses,${Object.values(data.profitLoss.expenses).reduce((a, b) => a + b, 0)}\n`;
      csvContent += `Net Profit,${data.profitLoss.netProfit}\n`;
    } else if (reportType === 'bs') {
      csvContent += "Balance Sheet\n";
      csvContent += `As of: ${formatDate(data.period.endDate)}\n\n`;
      csvContent += "ASSETS,Amount\n";
      csvContent += `Cash & Bank,${data.balanceSheet.assets.cashAndBank}\n`;
      csvContent += `Accounts Receivable,${data.balanceSheet.assets.accountsReceivable}\n`;
      csvContent += `Total Assets,${data.balanceSheet.assets.total}\n\n`;
      csvContent += "LIABILITIES & EQUITY,Amount\n";
      csvContent += `Accounts Payable,${data.balanceSheet.liabilities.accountsPayable}\n`;
      csvContent += `Owner's Capital,${data.balanceSheet.equity.ownersCapital}\n`;
      csvContent += `Retained Earnings,${data.balanceSheet.equity.retainedEarnings}\n`;
      csvContent += `Current Profit/Loss,${data.balanceSheet.equity.currentPeriodProfit}\n`;
      csvContent += `Total Liabilities & Equity,${data.balanceSheet.liabilities.total + data.balanceSheet.equity.total}\n`;
    } else if (reportType === 'ledger') {
      csvContent += "General Ledger Report\n\n";
      csvContent += "Date,Transaction ID,Description,Account,Debit,Credit,Balance\n";
      data.ledger.forEach(tx => {
        csvContent += `"${formatDate(tx.date)}","${tx.txId}","${tx.description.replace(/"/g, '""')}","${tx.account}",${tx.debit},${tx.credit},${tx.balance}\n`;
      });
    } else {
      csvContent += "Accounting Summary Report\n\n";
      csvContent += `Total Sales,${data.summary.totalSales}\n`;
      csvContent += `Total Income (Cash),${data.summary.totalIncome}\n`;
      csvContent += `Total Expenses,${data.summary.totalExpenses}\n`;
      csvContent += `Net Profit/Loss,${data.summary.netProfit}\n`;
      csvContent += `Cash Balance,${data.summary.cashBalance}\n`;
      csvContent += `Accounts Receivable,${data.summary.accountsReceivable}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${dateFilter.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Print Handler
  const printReport = () => {
    window.print();
  };

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--text-secondary)' }}>
        <div className="spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--secondary)', borderRadius: '50%', marginBottom: '16px' }}></div>
        <p style={{ fontSize: '14px' }}>Compiling financial ledgers & P&L statements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state" style={{ borderColor: 'var(--error)', padding: '40px', margin: '20px 0' }}>
        <AlertTriangle size={36} style={{ color: 'var(--error)', marginBottom: '12px' }} />
        <h3>Failed to Load Accounting Metrics</h3>
        <p>{error}</p>
        <button onClick={fetchAccountingData} className="btn-add-item-row" style={{ marginTop: '16px', background: 'var(--error)' }}>Try Again</button>
      </div>
    );
  }

  // Filter Ledger Entries
  const filteredLedger = data.ledger.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      tx.txId.toLowerCase().includes(ledgerSearch.toLowerCase());
    const matchesAccount = !ledgerAccountFilter || tx.account === ledgerAccountFilter;
    const matchesType = !ledgerTypeFilter ||
      (ledgerTypeFilter === 'debit' && tx.debit > 0) ||
      (ledgerTypeFilter === 'credit' && tx.credit > 0);
    return matchesSearch && matchesAccount && matchesType;
  });

  return (
    <div className="accounting-module" style={{ animation: 'fadeIn 0.3s ease-out', paddingBottom: '40px' }}>

      {/* HEADER SECTION */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }} className="no-print">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Scale size={24} style={{ color: 'var(--secondary)' }} />
            General Ledger & Accounts
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Professional accrual & double-entry financial monitoring system</p>
        </div>

        {/* Date Filters controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <Dropdown
              options={['Today', 'This Week', 'This Month', 'This Year', 'Custom']}
              value={dateFilter}
              onChange={(val) => setDateFilter(val)}
              searchable={false}
              selectStyle={{ height: '32px', minWidth: '130px', background: 'rgba(0,0,0,0.2)' }}
            />
          </div>

          {dateFilter === 'Custom' && (
            <form onSubmit={handleCustomRangeSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="date"
                className="invoice-form-item-input"
                style={{ height: '32px', padding: '4px 8px', fontSize: '12px', width: '130px' }}
                value={customRange.startDate}
                onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
                required
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>to</span>
              <input
                type="date"
                className="invoice-form-item-input"
                style={{ height: '32px', padding: '4px 8px', fontSize: '12px', width: '130px' }}
                value={customRange.endDate}
                onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
                required
              />
              <button type="submit" className="btn-add-item-row" style={{ marginTop: 0, padding: '4px 12px', height: '32px', fontSize: '12px' }}>Go</button>
            </form>
          )}
        </div>
      </header>

      {/* FINANCIAL OVERVIEW STRIP */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginBottom: '24px' }}>

        {/* Income Card */}
        <div className="card" style={{ padding: '16px', borderLeft: '3px solid var(--success)', background: 'linear-gradient(to right, rgba(46, 204, 113, 0.02), transparent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
            <span>Sales Revenue</span>
            <ArrowUpRight size={14} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {formatCurrency(data.summary.totalSales)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Accrued Orders
          </div>
        </div>

        {/* Expenses Card */}
        <div className="card" style={{ padding: '16px', borderLeft: '3px solid var(--error)', background: 'linear-gradient(to right, rgba(231, 76, 60, 0.02), transparent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
            <span>Operating Expenses</span>
            <ArrowDownRight size={14} style={{ color: 'var(--error)' }} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {formatCurrency(data.summary.totalExpenses)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Paid / Logged logs
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="card" style={{ padding: '16px', borderLeft: `3px solid ${data.summary.netProfit >= 0 ? 'var(--secondary)' : 'var(--error)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
            <span>Net Profit / Loss</span>
            <DollarSign size={14} style={{ color: data.summary.netProfit >= 0 ? 'var(--secondary)' : 'var(--error)' }} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: data.summary.netProfit >= 0 ? 'var(--text-primary)' : 'var(--error)' }}>
            {formatCurrency(data.summary.netProfit)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Accrual Net Margin
          </div>
        </div>

        {/* Cash Balance Card */}
        {/* <div className="card" style={{ padding: '16px', borderLeft: '3px solid #3498db' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
            <span>Cash / Bank</span>
            <CreditCard size={14} style={{ color: '#3498db' }} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {formatCurrency(data.summary.cashBalance)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Liquidity / Real Cash
          </div>
        </div> */}

        {/* Accounts Receivable Card */}
        <div className="card" style={{ padding: '16px', borderLeft: '3px solid #f39c12' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
            <span>Receivables (AR)</span>
            <FileText size={14} style={{ color: '#f39c12' }} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {formatCurrency(data.summary.accountsReceivable)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Outstanding sales
          </div>
        </div>

        {/* Balance Status Card */}
        <div className="card" style={{ padding: '16px', borderLeft: `3px solid ${data.summary.isBalanced ? 'var(--success)' : 'var(--error)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
            <span>Ledger status</span>
            {data.summary.isBalanced ? <CheckCircle size={14} style={{ color: 'var(--success)' }} /> : <AlertTriangle size={14} style={{ color: 'var(--error)' }} />}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
            {data.summary.isBalanced ? 'Balanced' : 'Discrepancy'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Assets = Liab + Equity
          </div>
        </div>
      </section>

      {/* NAVIGATION TABS */}
      <nav className="card no-print" style={{ padding: '6px', display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
        {[
          { id: 'overview', label: 'Financial Summary', icon: BarChart3 },
          { id: 'pl', label: 'Profit & Loss Statement', icon: FileText },
          { id: 'bs', label: 'Balance Sheet', icon: Scale },
          { id: 'ledger', label: 'General Ledger', icon: Receipt },
          { id: 'journal', label: 'Journal Entries', icon: History },
          { id: 'accounts', label: 'Account-wise view', icon: FolderOpen },
          { id: 'reports', label: 'Reports Centre', icon: Printer }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12.5px',
              fontWeight: activeTab === t.id ? 'bold' : 'normal',
              background: activeTab === t.id ? 'var(--primary)' : 'transparent',
              color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </nav>

      {/* TAB CONTENT: FINANCIAL SUMMARY / OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }} className="grid-responsive">
          {/* Income vs Expense analysis */}
          <div className="card" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={16} style={{ color: 'var(--secondary)' }} />
              Revenue vs Expense Analysis
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
              {/* Formula explanation */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', textAlign: 'center', fontSize: '13px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>Net Profit</span>
                <span style={{ margin: '0 8px' }}>=</span>
                <span style={{ color: 'var(--text-primary)' }}>Sales Revenue ({formatCurrency(data.summary.totalSales)})</span>
                <span style={{ margin: '0 8px' }}>−</span>
                <span style={{ color: 'var(--error)' }}>Operating Expenses ({formatCurrency(data.summary.totalExpenses)})</span>
                <div style={{ borderTop: '1px dashed var(--border)', marginTop: '8px', paddingTop: '8px', fontWeight: 'bold', fontSize: '15px', color: data.summary.netProfit >= 0 ? 'var(--success)' : 'var(--error)' }}>
                  Net Margin: {formatCurrency(data.summary.netProfit)}
                </div>
              </div>

              {/* Progress bars visual indicator */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontWeight: '600' }}>
                  <span>Expenses vs Sales Revenue Limit</span>
                  <span>
                    {data.summary.totalSales > 0
                      ? ((data.summary.totalExpenses / data.summary.totalSales) * 100).toFixed(1) + '%'
                      : '0%'
                    }
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: data.summary.totalExpenses <= data.summary.totalSales ? 'var(--warning)' : 'var(--error)',
                      width: data.summary.totalSales > 0
                        ? `${Math.min(100, (data.summary.totalExpenses / data.summary.totalSales) * 100)}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Expenses Break Down Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={16} style={{ color: 'var(--secondary)' }} />
              Expenses Breakdown by Category
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(data.profitLoss.expenses).map(([category, amount]) => {
                const totalExp = Object.values(data.profitLoss.expenses).reduce((a, b) => a + b, 0) || 1;
                const percentage = ((amount / totalExp) * 100).toFixed(1);
                return (
                  <div key={category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{category}</span>
                      <span style={{ fontWeight: '600' }}>
                        {formatCurrency(amount)} ({percentage}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                          width: `${percentage}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.values(data.profitLoss.expenses).reduce((a, b) => a + b, 0) === 0 && (
                <div style={{ padding: '20px 0', textTransform: 'capitalize', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No expenses recorded in this period.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROFIT & LOSS STATEMENT */}
      {activeTab === 'pl' && (
        <div className="card" style={{ padding: '32px', maxWidth: '750px', margin: '0 auto', fontFamily: 'Courier New, monospace', color: '#eaeaea', background: '#1c1b18', border: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px solid #eaeaea', paddingBottom: '16px' }}>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', fontSize: '20px', margin: '0 0 4px 0' }}>Crimson Group LLP</h2>
            <h3 style={{ textTransform: 'uppercase', fontSize: '14px', margin: '0 0 4px 0' }}>Statement of Profit and Loss</h3>
            <p style={{ fontSize: '12px', margin: 0, fontStyle: 'italic' }}>
              For the period from {formatDate(data.period.startDate)} to {formatDate(data.period.endDate)}
            </p>
          </div>

          <div className="overflow-x-auto w-full max-w-full custom-scrollbar"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <tbody>
              {/* REVENUE SECTION */}
              <tr style={{ fontWeight: 'bold', borderBottom: '1px solid #555' }}>
                <td style={{ padding: '8px 0', fontSize: '14px' }}>REVENUE</td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}></td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}></td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0 6px 16px', color: 'var(--text-secondary)' }}>Sales Revenue (Accrued Orders)</td>
                <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(data.profitLoss.revenue.sales)}</td>
                <td></td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0 6px 16px', color: 'var(--text-secondary)' }}>Other Income</td>
                <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(data.profitLoss.revenue.otherIncome)}</td>
                <td></td>
              </tr>
              <tr style={{ fontWeight: 'bold', borderBottom: '1px double #eaeaea' }}>
                <td style={{ padding: '8px 0 8px 16px' }}>Total Revenue (A)</td>
                <td></td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatCurrency(data.profitLoss.revenue.sales + data.profitLoss.revenue.otherIncome)}</td>
              </tr>

              {/* EMPTY ROW */}
              <tr><td colSpan="3" style={{ height: '16px' }}></td></tr>

              {/* EXPENSES SECTION */}
              <tr style={{ fontWeight: 'bold', borderBottom: '1px solid #555' }}>
                <td style={{ padding: '8px 0', fontSize: '14px' }}>OPERATING EXPENSES</td>
                <td></td>
                <td></td>
              </tr>
              {Object.entries(data.profitLoss.expenses).map(([cat, amount]) => (
                <tr key={cat}>
                  <td style={{ padding: '6px 0 6px 16px', color: 'var(--text-secondary)' }}>{cat}</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(amount)}</td>
                  <td></td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', borderBottom: '1px double #eaeaea' }}>
                <td style={{ padding: '8px 0 8px 16px' }}>Total Operating Expenses (B)</td>
                <td></td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatCurrency(Object.values(data.profitLoss.expenses).reduce((a, b) => a + b, 0))}</td>
              </tr>

              {/* EMPTY ROW */}
              <tr><td colSpan="3" style={{ height: '24px' }}></td></tr>

              {/* NET PROFIT */}
              <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #eaeaea', borderTop: '2px solid #eaeaea', fontSize: '15px' }}>
                <td style={{ padding: '12px 0' }}>NET INCOME / PROFIT (A − B)</td>
                <td></td>
                <td style={{ padding: '12px 0', textAlign: 'right', color: data.profitLoss.netProfit >= 0 ? 'var(--success)' : 'var(--error)' }}>
                  {formatCurrency(data.profitLoss.netProfit)}
                </td>
              </tr>
            </tbody>
          </table></div>

          {/* Report action footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }} className="no-print">
            <button onClick={() => exportToExcel('pl')} className="btn-add-item-row" style={{ marginTop: 0, padding: '6px 16px', fontSize: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <Download size={13} style={{ marginRight: '6px' }} /> Export CSV
            </button>
            <button onClick={printReport} className="btn-add-item-row" style={{ marginTop: 0, padding: '6px 16px', fontSize: '12px' }}>
              <Printer size={13} style={{ marginRight: '6px' }} /> Print / Save PDF
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BALANCE SHEET */}
      {activeTab === 'bs' && (
        <div className="card" style={{ padding: '32px', maxWidth: '750px', margin: '0 auto', fontFamily: 'Courier New, monospace', color: '#eaeaea', background: '#1c1b18', border: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px solid #eaeaea', paddingBottom: '16px' }}>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', fontSize: '20px', margin: '0 0 4px 0' }}>Crimson Group LLP</h2>
            <h3 style={{ textTransform: 'uppercase', fontSize: '14px', margin: '0 0 4px 0' }}>Balance Sheet</h3>
            <p style={{ fontSize: '12px', margin: 0, fontStyle: 'italic' }}>
              As of the Statement Date: {formatDate(data.period.endDate)}
            </p>
          </div>

          <div className="overflow-x-auto w-full max-w-full custom-scrollbar"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <tbody>
              {/* ASSETS SECTION */}
              <tr style={{ fontWeight: 'bold', borderBottom: '1px solid #555' }}>
                <td style={{ padding: '8px 0', fontSize: '14px' }}>ASSETS</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0 6px 16px', color: 'var(--text-secondary)' }}>Cash & Cash Equivalents (Bank)</td>
                <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(data.balanceSheet.assets.cashAndBank)}</td>
                <td></td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0 6px 16px', color: 'var(--text-secondary)' }}>Accounts Receivable (AR)</td>
                <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(data.balanceSheet.assets.accountsReceivable)}</td>
                <td></td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0 6px 16px', color: 'var(--text-secondary)' }}>Inventory Asset</td>
                <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(data.balanceSheet.assets.inventory)}</td>
                <td></td>
              </tr>
              <tr style={{ fontWeight: 'bold', borderBottom: '1px double #eaeaea' }}>
                <td style={{ padding: '8px 0 8px 16px' }}>Total Assets</td>
                <td></td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatCurrency(data.balanceSheet.assets.total)}</td>
              </tr>

              {/* EMPTY ROW */}
              <tr><td colSpan="3" style={{ height: '20px' }}></td></tr>

              {/* LIABILITIES SECTION */}
              <tr style={{ fontWeight: 'bold', borderBottom: '1px solid #555' }}>
                <td style={{ padding: '8px 0', fontSize: '14px' }}>LIABILITIES</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0 6px 16px', color: 'var(--text-secondary)' }}>Accounts Payable (AP)</td>
                <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(data.balanceSheet.liabilities.accountsPayable)}</td>
                <td></td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0 6px 16px', color: 'var(--text-secondary)' }}>Short-term Loans</td>
                <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(data.balanceSheet.liabilities.loans)}</td>
                <td></td>
              </tr>
              <tr style={{ fontWeight: 'bold', borderBottom: '1px double #eaeaea' }}>
                <td style={{ padding: '8px 0 8px 16px' }}>Total Liabilities</td>
                <td></td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatCurrency(data.balanceSheet.liabilities.total)}</td>
              </tr>

              {/* EMPTY ROW */}
              <tr><td colSpan="3" style={{ height: '20px' }}></td></tr>

              {/* OWNER'S EQUITY */}
              <tr style={{ fontWeight: 'bold', borderBottom: '1px solid #555' }}>
                <td style={{ padding: '8px 0', fontSize: '14px' }}>OWNERS' EQUITY</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0 6px 16px', color: 'var(--text-secondary)' }}>Owners' Paid-in Capital</td>
                <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(data.balanceSheet.equity.ownersCapital)}</td>
                <td></td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0 6px 16px', color: 'var(--text-secondary)' }}>Retained Earnings (Prior periods)</td>
                <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(data.balanceSheet.equity.retainedEarnings)}</td>
                <td></td>
              </tr>
              <tr>
                <td style={{ padding: '6px 0 6px 16px', color: 'var(--text-secondary)' }}>Current Period Earnings (Net P&L)</td>
                <td style={{ padding: '6px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(data.balanceSheet.equity.currentPeriodProfit)}</td>
                <td></td>
              </tr>
              <tr style={{ fontWeight: 'bold', borderBottom: '1px double #eaeaea' }}>
                <td style={{ padding: '8px 0 8px 16px' }}>Total Owners' Equity</td>
                <td></td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatCurrency(data.balanceSheet.equity.total)}</td>
              </tr>

              {/* EMPTY ROW */}
              <tr><td colSpan="3" style={{ height: '24px' }}></td></tr>

              {/* TOTAL LIABILITIES & EQUITY */}
              <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #eaeaea', borderTop: '2px solid #eaeaea', fontSize: '15px' }}>
                <td style={{ padding: '12px 0' }}>TOTAL LIABILITIES & EQUITY</td>
                <td></td>
                <td style={{ padding: '12px 0', textAlign: 'right' }}>
                  {formatCurrency(data.balanceSheet.liabilities.total + data.balanceSheet.equity.total)}
                </td>
              </tr>
            </tbody>
          </table></div>

          {/* Accounting confirmation block */}
          <div style={{ marginTop: '24px', padding: '10px 14px', background: data.balanceSheet.isBalanced ? 'rgba(46, 204, 113, 0.05)' : 'rgba(231, 76, 60, 0.05)', borderRadius: '6px', border: `1px solid ${data.balanceSheet.isBalanced ? 'var(--success)' : 'var(--error)'}`, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
            {data.balanceSheet.isBalanced ? (
              <>
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span>Verification successful: The Balance Sheet equations are **balanced** (Assets = Liabilities + Equity).</span>
              </>
            ) : (
              <>
                <AlertTriangle size={16} style={{ color: 'var(--error)' }} />
                <span style={{ color: 'var(--error)' }}>Discrepancy detected: Assets do not equal Liabilities + Equity. Please check transaction ledgers.</span>
              </>
            )}
          </div>

          {/* Action footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }} className="no-print">
            <button onClick={() => exportToExcel('bs')} className="btn-add-item-row" style={{ marginTop: 0, padding: '6px 16px', fontSize: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <Download size={13} style={{ marginRight: '6px' }} /> Export CSV
            </button>
            <button onClick={printReport} className="btn-add-item-row" style={{ marginTop: 0, padding: '6px 16px', fontSize: '12px' }}>
              <Printer size={13} style={{ marginRight: '6px' }} /> Print / Save PDF
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: GENERAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="card" style={{ padding: '20px' }}>

          {/* Filters strip */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }} className="no-print">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', flexGrow: 1 }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search ledger description or Reference ID..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '12px' }}
              />
            </div>

            <Dropdown
              placeholder="All Accounts"
              options={['Cash & Bank', 'Accounts Receivable', 'Sales Revenue', 'Office Expenses', 'Travel', 'Marketing', 'Salary', 'Utilities', 'Miscellaneous']}
              value={ledgerAccountFilter}
              onChange={(val) => setLedgerAccountFilter(val)}
              searchable={false}
              clearable={true}
              style={{ width: '160px' }}
              selectStyle={{ height: '32px', background: 'rgba(0,0,0,0.2)' }}
            />

            <Dropdown
              placeholder="Debit / Credit"
              options={[
                { value: 'debit', label: 'Debit Entries Only' },
                { value: 'credit', label: 'Credit Entries Only' }
              ]}
              value={ledgerTypeFilter}
              onChange={(val) => setLedgerTypeFilter(val)}
              searchable={false}
              clearable={true}
              style={{ width: '160px' }}
              selectStyle={{ height: '32px', background: 'rgba(0,0,0,0.2)' }}
            />

            <button onClick={() => exportToExcel('ledger')} className="btn-add-item-row" style={{ marginTop: 0, height: '32px', fontSize: '12px', padding: '0 16px' }}>
              <Download size={13} style={{ marginRight: '6px' }} /> Export CSV
            </button>
          </div>

          {/* Ledger Table */}
          <div style={{ overflowX: 'auto' }}>
            <div className="overflow-x-auto w-full max-w-full custom-scrollbar"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--text-secondary)' }}>Date</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--text-secondary)' }}>Reference / ID</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--text-secondary)' }}>Account</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--text-secondary)' }}>Description</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', color: 'var(--text-secondary)' }}>Debit (Dr)</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', color: 'var(--text-secondary)' }}>Credit (Cr)</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', color: 'var(--text-secondary)' }}>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((tx, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDate(tx.date)}
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '11.5px' }}>
                      {tx.txId}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>
                        {tx.account}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                      {tx.description}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', color: tx.debit > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                      {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', color: tx.credit > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                      {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(tx.balance)}
                    </td>
                  </tr>
                ))}
                {filteredLedger.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No ledger transactions found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table></div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: JOURNAL ENTRIES */}
      {activeTab === 'journal' && (
        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            General Journal Log (Double-Entry chronological record)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {data.journal.map((jv) => (
              <div key={jv.journalId} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Journal Entry Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border)', padding: '10px 14px', fontSize: '12.5px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{jv.journalId}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{formatDate(jv.date)}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>
                    Reference: <span style={{ fontFamily: 'monospace' }}>{jv.reference}</span>
                  </div>
                </div>

                {/* Journal Entry Details */}
                <div style={{ padding: '12px 14px' }}>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', marginBottom: '10px', fontStyle: 'italic' }}>
                    Description: {jv.description}
                  </p>

                  <div className="overflow-x-auto w-full max-w-full custom-scrollbar"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ textAlign: 'left', padding: '6px 0' }}>Account Title</th>
                        <th style={{ textAlign: 'right', padding: '6px 0', width: '130px' }}>Debit (Dr)</th>
                        <th style={{ textAlign: 'right', padding: '6px 0', width: '130px' }}>Credit (Cr)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jv.lines.map((line, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '8px 0', paddingLeft: line.credit > 0 ? '24px' : '0px', color: 'var(--text-secondary)', fontWeight: line.debit > 0 ? 'bold' : 'normal' }}>
                            {line.account}
                          </td>
                          <td style={{ padding: '8px 0', textAlign: 'right', color: line.debit > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                            {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                          </td>
                          <td style={{ padding: '8px 0', textAlign: 'right', color: line.credit > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                            {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>
              </div>
            ))}
            {data.journal.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No journal entries registered in this period.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACCOUNT-WISE DETAILS */}
      {activeTab === 'accounts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.values(data.accountDetails).map((acc) => {
            const isExpanded = expandedAccount === acc.accountName;
            return (
              <div key={acc.accountName} className="card" style={{ padding: '16px', borderLeft: `3px solid ${acc.type === 'Asset' ? '#3498db' : acc.type === 'Revenue' ? 'var(--success)' : 'var(--primary)'}` }}>
                {/* Account Header info Summary */}
                <div
                  onClick={() => setExpandedAccount(isExpanded ? null : acc.accountName)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-primary)' }}>{acc.accountName}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '8px', textTransform: 'uppercase', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px' }}>
                        {acc.type}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', fontSize: '13px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Closing:</span>
                      <span style={{ fontWeight: 'bold' }}>{formatCurrency(acc.closingBalance)}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Transactions list */}
                {isExpanded && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Opening Balance</div>
                        <div style={{ fontWeight: '600' }}>{formatCurrency(acc.openingBalance)}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Total Debit (Dr)</div>
                        <div style={{ fontWeight: '600', color: 'var(--success)' }}>{formatCurrency(acc.totalDebit)}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Total Credit (Cr)</div>
                        <div style={{ fontWeight: '600', color: 'var(--warning)' }}>{formatCurrency(acc.totalCredit)}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Closing Balance</div>
                        <div style={{ fontWeight: '600' }}>{formatCurrency(acc.closingBalance)}</div>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>Related Transaction Ledgers</h4>
                    <div style={{ overflowX: 'auto' }}>
                      <div className="overflow-x-auto w-full max-w-full custom-scrollbar"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
                            <th style={{ textAlign: 'left', padding: '6px' }}>Date</th>
                            <th style={{ textAlign: 'left', padding: '6px' }}>Reference</th>
                            <th style={{ textAlign: 'left', padding: '6px' }}>Description</th>
                            <th style={{ textAlign: 'right', padding: '6px' }}>Debit</th>
                            <th style={{ textAlign: 'right', padding: '6px' }}>Credit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {acc.transactions.map((tx, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.01)' }}>
                              <td style={{ padding: '6px', color: 'var(--text-secondary)' }}>{formatDate(tx.date)}</td>
                              <td style={{ padding: '6px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{tx.txId}</td>
                              <td style={{ padding: '6px', color: 'var(--text-secondary)' }}>{tx.description}</td>
                              <td style={{ padding: '6px', textAlign: 'right', color: tx.debit > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                                {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                              </td>
                              <td style={{ padding: '6px', textAlign: 'right', color: tx.credit > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                                {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                              </td>
                            </tr>
                          ))}
                          {acc.transactions.length === 0 && (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                No transactions in this period.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT: REPORTS CENTRE */}
      {activeTab === 'reports' && (
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Downloadable Financial Reports
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Generate standard accounting reports in CSV format (fully compatible with Microsoft Excel, Google Sheets, or Numbers) or print direct PDFs.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>

            {/* Report Card: P&L */}
            <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px' }}>Profit & Loss Report</h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Detailed revenue recognized, categorical operations expenses, and net profit margin.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => exportToExcel('pl')} className="btn-add-item-row" style={{ marginTop: 0, padding: '4px 10px', fontSize: '11px', flexGrow: 1 }}>
                  <Download size={12} style={{ marginRight: '4px' }} /> Excel
                </button>
                <button onClick={() => { setActiveTab('pl'); setTimeout(() => window.print(), 100); }} className="btn-add-item-row" style={{ marginTop: 0, padding: '4px 10px', fontSize: '11px', flexGrow: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <Printer size={12} style={{ marginRight: '4px' }} /> Print
                </button>
              </div>
            </div>

            {/* Report Card: Balance Sheet */}
            <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px' }}>Balance Sheet</h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Snapshot statement of assets (bank, AR), liabilities (loans), and owner's equity capital balance.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => exportToExcel('bs')} className="btn-add-item-row" style={{ marginTop: 0, padding: '4px 10px', fontSize: '11px', flexGrow: 1 }}>
                  <Download size={12} style={{ marginRight: '4px' }} /> Excel
                </button>
                <button onClick={() => { setActiveTab('bs'); setTimeout(() => window.print(), 100); }} className="btn-add-item-row" style={{ marginTop: 0, padding: '4px 10px', fontSize: '11px', flexGrow: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <Printer size={12} style={{ marginRight: '4px' }} /> Print
                </button>
              </div>
            </div>

            {/* Report Card: General Ledger */}
            <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px' }}>General Ledger</h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Chronological listing of all account transactions with Debit, Credit, and Running Balances.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => exportToExcel('ledger')} className="btn-add-item-row" style={{ marginTop: 0, padding: '4px 10px', fontSize: '11px', flexGrow: 1 }}>
                  <Download size={12} style={{ marginRight: '4px' }} /> Excel
                </button>
                <button onClick={() => { setActiveTab('ledger'); setTimeout(() => window.print(), 100); }} className="btn-add-item-row" style={{ marginTop: 0, padding: '4px 10px', fontSize: '11px', flexGrow: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <Printer size={12} style={{ marginRight: '4px' }} /> Print
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
