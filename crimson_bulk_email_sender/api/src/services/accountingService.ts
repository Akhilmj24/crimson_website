// @ts-nocheck
import Order from '../models/Order';
import Payment from '../models/Payment';
import Expense from '../models/Expense';

/**
 * Get the full financial/accounting summary for a tenant and date range.
 * If no dates are provided, defaults to all time.
 */
const getFinancialSummary = async (tenantId, queryParams = {}) => {
  const { startDate, endDate } = queryParams;
  
  const start = startDate ? new Date(startDate) : new Date('2020-01-01');
  const end = endDate ? new Date(endDate) : new Date();
  // Set end time to end of day
  end.setHours(23, 59, 59, 999);

  // 1. Fetch all data for the tenant (we will filter in-memory to ensure opening/closing balances are exact)
  const allOrders = await Order.find({ tenantId, isDeleted: false });
  const allPayments = await Payment.find({ tenantId });
  const allExpenses = await Expense.find({ tenantId, isDeleted: false });

  // 2. Separate data: prior to start (for opening balances) and within period (for P&L / period transactions)
  const priorOrders = allOrders.filter(o => o.status !== 'Cancelled' && new Date(o.createdAt) < start);
  const periodOrders = allOrders.filter(o => o.status !== 'Cancelled' && new Date(o.createdAt) >= start && new Date(o.createdAt) <= end);
  
  const priorPayments = allPayments.filter(p => new Date(p.paymentDate) < start);
  const periodPayments = allPayments.filter(p => new Date(p.paymentDate) >= start && new Date(p.paymentDate) <= end);
  
  const priorExpenses = allExpenses.filter(e => new Date(e.date) < start);
  const periodExpenses = allExpenses.filter(e => new Date(e.date) >= start && new Date(e.date) <= end);

  // --- CUMULATIVE ACCOUNT BALANCES (As of Start Date for Opening, and End Date for Closing) ---
  const initialCapital = 0; // Starting Owner's Capital

  // Cash & Bank
  const getCashBalance = (payments, expenses) => {
    const totalIn = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOut = expenses.reduce((sum, e) => sum + e.amount, 0);
    return initialCapital + totalIn - totalOut;
  };
  const cashOpening = getCashBalance(priorPayments, priorExpenses);
  const cashClosing = getCashBalance([...priorPayments, ...periodPayments], [...priorExpenses, ...periodExpenses]);

  // Accounts Receivable (Outstanding Order Balances)
  const getARBalance = (orders, payments) => {
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, totalSales - totalPaid);
  };
  const arOpening = getARBalance(priorOrders, priorPayments);
  const arClosing = getARBalance([...priorOrders, ...periodOrders], [...priorPayments, ...periodPayments]);

  // --- PERIOD-SPECIFIC CALCULATIONS (P&L) ---
  const totalSales = periodOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalIncome = periodPayments.reduce((sum, p) => sum + p.amount, 0); // cash basis income
  const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses; // Accrual basis net profit

  // Category-wise expenses within the period
  const expensesByCategory = {};
  const categories = ['Office Expenses', 'Travel', 'Marketing', 'Salary', 'Utilities', 'Miscellaneous'];
  categories.forEach(cat => { expensesByCategory[cat] = 0; });
  periodExpenses.forEach(e => {
    const cat = e.category || 'Miscellaneous';
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + e.amount;
  });

  // Category-wise income (Sales)
  const incomeByCategory = {
    'Sales Revenue': totalSales,
    'Other Income': 0
  };

  // --- GENERATING THE LEDGER (Period specific with opening balance) ---
  const ledgerTransactions = [];

  // Add order sales to ledger
  periodOrders.forEach(o => {
    ledgerTransactions.push({
      date: new Date(o.createdAt),
      txId: o.orderNumber || o._id.toString(),
      description: `Invoice generated for Customer: ${o.customerName}`,
      account: 'Accounts Receivable',
      type: 'Debit',
      debit: o.totalAmount,
      credit: 0,
      refModel: 'Order',
      refId: o._id
    });
    ledgerTransactions.push({
      date: new Date(o.createdAt),
      txId: o.orderNumber || o._id.toString(),
      description: `Sales revenue recognized for Order #${o.orderNumber}`,
      account: 'Sales Revenue',
      type: 'Credit',
      debit: 0,
      credit: o.totalAmount,
      refModel: 'Order',
      refId: o._id
    });
  });

  // Add payments to ledger
  periodPayments.forEach(p => {
    ledgerTransactions.push({
      date: new Date(p.paymentDate),
      txId: p.transactionReference || p._id.toString(),
      description: `Payment received for Order Reference: ${p.orderId}`,
      account: 'Cash & Bank',
      type: 'Debit',
      debit: p.amount,
      credit: 0,
      refModel: 'Payment',
      refId: p._id
    });
    ledgerTransactions.push({
      date: new Date(p.paymentDate),
      txId: p.transactionReference || p._id.toString(),
      description: `Accounts Receivable credit from Payment`,
      account: 'Accounts Receivable',
      type: 'Credit',
      debit: 0,
      credit: p.amount,
      refModel: 'Payment',
      refId: p._id
    });
  });

  // Add expenses to ledger
  periodExpenses.forEach(e => {
    const cat = e.category || 'Operating Expense';
    ledgerTransactions.push({
      date: new Date(e.date),
      txId: e._id.toString(),
      description: `${cat} - ${e.title || 'General'} (${e.description || 'No description'})`,
      account: cat,
      type: 'Debit',
      debit: e.amount,
      credit: 0,
      refModel: 'Expense',
      refId: e._id
    });
    ledgerTransactions.push({
      date: new Date(e.date),
      txId: e._id.toString(),
      description: `Payment for ${cat}`,
      account: 'Cash & Bank',
      type: 'Credit',
      debit: 0,
      credit: e.amount,
      refModel: 'Expense',
      refId: e._id
    });
  });

  // Sort chronologically
  ledgerTransactions.sort((a, b) => a.date - b.date);

  // Compute running balance for each main account within the ledger
  const runningBalances = {
    'Cash & Bank': cashOpening,
    'Accounts Receivable': arOpening,
    'Sales Revenue': 0,
    'Office Expenses': 0,
    'Travel': 0,
    'Marketing': 0,
    'Salary': 0,
    'Utilities': 0,
    'Miscellaneous': 0
  };

  const ledgerWithBalances = ledgerTransactions.map(tx => {
    const acc = tx.account;
    if (acc === 'Cash & Bank' || acc === 'Accounts Receivable' || categories.includes(acc)) {
      // Asset & Expense increase with Debit, decrease with Credit
      runningBalances[acc] += (tx.debit - tx.credit);
    } else if (acc === 'Sales Revenue') {
      // Revenue increases with Credit, decreases with Debit
      runningBalances[acc] += (tx.credit - tx.debit);
    }
    return {
      ...tx,
      balance: runningBalances[acc]
    };
  });

  // --- JOURNAL ENTRIES (Double-entry representation grouped by transaction) ---
  const journalEntries = [];

  // Group ledger entries by transaction ID / date / description
  const groupedTx = {};
  ledgerTransactions.forEach(tx => {
    const key = `${tx.txId}_${tx.date.getTime()}`;
    if (!groupedTx[key]) {
      groupedTx[key] = {
        date: tx.date,
        txId: tx.txId,
        description: tx.description.split(' for ')[0], // general description
        lines: []
      };
    }
    groupedTx[key].lines.push({
      account: tx.account,
      debit: tx.debit,
      credit: tx.credit
    });
  });

  Object.values(groupedTx).forEach((grp, index) => {
    journalEntries.push({
      journalId: `JV-${1000 + index}`,
      date: grp.date,
      reference: grp.txId,
      description: grp.description,
      lines: grp.lines
    });
  });
  journalEntries.sort((a, b) => b.date - a.date); // Reverse chronological for journal

  // --- BALANCE SHEET VALUES (Snapshot at End Date) ---
  const totalAssets = cashClosing + arClosing;
  const equityCapital = initialCapital;
  // Accrual net profit from inception to end date
  const lifetimeSales = allOrders.filter(o => o.status !== 'Cancelled' && new Date(o.createdAt) <= end).reduce((sum, o) => sum + o.totalAmount, 0);
  const lifetimeExpenses = allExpenses.filter(e => new Date(e.date) <= end).reduce((sum, e) => sum + e.amount, 0);
  const lifetimeNetProfit = lifetimeSales - lifetimeExpenses;

  const totalEquity = equityCapital + lifetimeNetProfit;
  const totalLiabilities = 0; // standard clean ledger model

  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01;

  // --- EXPANDABLE ACCOUNT DETAILS VIEW ---
  const accountDetails = {};
  const allAccountNames = ['Cash & Bank', 'Accounts Receivable', 'Sales Revenue', ...categories];
  
  allAccountNames.forEach(accName => {
    let opening = 0;
    let type = 'Asset';

    if (accName === 'Cash & Bank') {
      opening = cashOpening;
      type = 'Asset';
    } else if (accName === 'Accounts Receivable') {
      opening = arOpening;
      type = 'Asset';
    } else if (accName === 'Sales Revenue') {
      opening = priorOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      type = 'Revenue';
    } else {
      opening = priorExpenses.filter(e => e.category === accName).reduce((sum, e) => sum + e.amount, 0);
      type = 'Expense';
    }

    const txs = ledgerWithBalances.filter(tx => tx.account === accName);
    const totalDebit = txs.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = txs.reduce((sum, t) => sum + t.credit, 0);
    
    let closing = opening;
    if (type === 'Asset' || type === 'Expense') {
      closing = opening + totalDebit - totalCredit;
    } else {
      closing = opening + totalCredit - totalDebit;
    }

    accountDetails[accName] = {
      accountName: accName,
      type,
      openingBalance: opening,
      totalDebit,
      totalCredit,
      closingBalance: closing,
      transactions: txs
    };
  });

  return {
    period: {
      startDate: start,
      endDate: end
    },
    summary: {
      totalSales,       // Accrued sales revenue
      totalIncome,      // Cash received
      totalExpenses,    // Total expenses
      netProfit,        // Sales - Expenses
      cashBalance: cashClosing,
      accountsReceivable: arClosing,
      totalAssets,
      totalLiabilities,
      equity: totalEquity,
      isBalanced
    },
    profitLoss: {
      revenue: {
        sales: totalSales,
        otherIncome: 0,
        refunds: 0
      },
      expenses: expensesByCategory,
      netProfit
    },
    balanceSheet: {
      assets: {
        cashAndBank: cashClosing,
        accountsReceivable: arClosing,
        inventory: 0,
        otherAssets: 0,
        total: totalAssets
      },
      liabilities: {
        accountsPayable: 0,
        loans: 0,
        outstandingExpenses: 0,
        total: totalLiabilities
      },
      equity: {
        ownersCapital: equityCapital,
        retainedEarnings: lifetimeNetProfit - netProfit, // earnings prior to current period
        currentPeriodProfit: netProfit,
        total: totalEquity
      },
      isBalanced
    },
    ledger: ledgerWithBalances,
    journal: journalEntries,
    accountDetails
  };
};

export default { 
  getFinancialSummary
 };
