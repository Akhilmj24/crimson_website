import React, { createContext, useContext, useState, useEffect } from 'react';
import { crmService } from '../services/crmService';

const CrmContext = createContext();

export function useCrm() {
  return useContext(CrmContext);
}

export function CrmProvider({ children }) {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [reportsStats, setReportsStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [settings, setSettings] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [companiesTotal, setCompaniesTotal] = useState(0);
  
  const [orders, setOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expensesTotal, setExpensesTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tenant / Credentials LocalStorage settings
  const [currentTenant, setCurrentTenant] = useState(localStorage.getItem('crm_tenant_id') || 'default-tenant');
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('crm_user_id') || 'Akhil');
  const [currentUserRole, setCurrentUserRole] = useState(localStorage.getItem('crm_user_role') || 'Admin');

  useEffect(() => {
    localStorage.setItem('crm_tenant_id', currentTenant);
    localStorage.setItem('crm_user_id', currentUser);
    localStorage.setItem('crm_user_role', currentUserRole);
  }, [currentTenant, currentUser, currentUserRole]);

  // General wrapper for error handling
  const runAsync = async (fn) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fn();
      return res;
    } catch (err) {
      console.error('CRM Context Error:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Dashboard
  const fetchDashboard = () => runAsync(async () => {
    const stats = await crmService.getDashboard();
    setDashboardStats(stats);
    return stats;
  });

  // Fetch Reports
  const fetchReports = () => runAsync(async () => {
    const stats = await crmService.getReports();
    setReportsStats(stats);
    return stats;
  });

  // Fetch Settings
  const fetchSettings = () => runAsync(async () => {
    const data = await crmService.getSettings();
    setSettings(data);
    return data;
  });

  const updateSettings = (data) => runAsync(async () => {
    const updated = await crmService.updateSettings(data);
    setSettings(updated);
    return updated;
  });

  // Fetch Leads
  const fetchLeads = (params = {}) => runAsync(async () => {
    const res = await crmService.getLeads(params);
    setLeads(res.data);
    setLeadsTotal(res.total);
    return res;
  });

  const createLead = (data) => runAsync(async () => {
    const lead = await crmService.createLead(data);
    setLeads(prev => [lead, ...prev]);
    fetchDashboard(); // update dashboard count
    return lead;
  });

  const updateLead = (id, data) => runAsync(async () => {
    const lead = await crmService.updateLead(id, data);
    setLeads(prev => prev.map(l => l._id === id ? lead : l));
    fetchDashboard();
    return lead;
  });

  const deleteLead = (id) => runAsync(async () => {
    await crmService.deleteLead(id);
    setLeads(prev => prev.filter(l => l._id !== id));
    fetchDashboard();
  });

  // Fetch Contacts
  const fetchContacts = (params = {}) => runAsync(async () => {
    const res = await crmService.getContacts(params);
    setContacts(res.data);
    setContactsTotal(res.total);
    return res;
  });

  const createContact = (data) => runAsync(async () => {
    const contact = await crmService.createContact(data);
    setContacts(prev => [contact, ...prev]);
    fetchDashboard();
    return contact;
  });

  const updateContact = (id, data) => runAsync(async () => {
    const contact = await crmService.updateContact(id, data);
    setContacts(prev => prev.map(c => c._id === id ? contact : c));
    return contact;
  });

  const deleteContact = (id) => runAsync(async () => {
    await crmService.deleteContact(id);
    setContacts(prev => prev.filter(c => c._id !== id));
    fetchDashboard();
  });

  // Fetch Companies
  const fetchCompanies = (params = {}) => runAsync(async () => {
    const res = await crmService.getCompanies(params);
    setCompanies(res.data);
    setCompaniesTotal(res.total);
    return res;
  });

  const createCompany = (data) => runAsync(async () => {
    const company = await crmService.createCompany(data);
    setCompanies(prev => [company, ...prev]);
    fetchDashboard();
    return company;
  });

  const updateCompany = (id, data) => runAsync(async () => {
    const company = await crmService.updateCompany(id, data);
    setCompanies(prev => prev.map(c => c._id === id ? company : c));
    return company;
  });

  const deleteCompany = (id) => runAsync(async () => {
    await crmService.deleteCompany(id);
    setCompanies(prev => prev.filter(c => c._id !== id));
    fetchDashboard();
  });

  // Fetch Deals
  const fetchDeals = (params = {}) => runAsync(async () => {
    const data = await crmService.getDeals(params);
    setDeals(data);
    return data;
  });

  const createDeal = (data) => runAsync(async () => {
    const deal = await crmService.createDeal(data);
    setDeals(prev => [deal, ...prev]);
    fetchDashboard();
    return deal;
  });

  const updateDeal = (id, data) => runAsync(async () => {
    const deal = await crmService.updateDeal(id, data);
    setDeals(prev => prev.map(d => d._id === id ? deal : d));
    fetchDashboard();
    return deal;
  });

  const deleteDeal = (id) => runAsync(async () => {
    await crmService.deleteDeal(id);
    setDeals(prev => prev.filter(d => d._id !== id));
    fetchDashboard();
  });

  // Fetch Tasks
  const fetchTasks = (params = {}) => runAsync(async () => {
    const data = await crmService.getTasks(params);
    setTasks(data);
    return data;
  });

  const createTask = (data) => runAsync(async () => {
    const task = await crmService.createTask(data);
    setTasks(prev => [task, ...prev]);
    fetchDashboard();
    return task;
  });

  const updateTask = (id, data) => runAsync(async () => {
    const task = await crmService.updateTask(id, data);
    setTasks(prev => prev.map(t => t._id === id ? task : t));
    fetchDashboard();
    return task;
  });

  const deleteTask = (id) => runAsync(async () => {
    await crmService.deleteTask(id);
    setTasks(prev => prev.filter(t => t._id !== id));
    fetchDashboard();
  });

  // Fetch FollowUps
  const fetchFollowUps = () => runAsync(async () => {
    const data = await crmService.getFollowUps();
    setFollowUps(data);
    return data;
  });

  const createFollowUp = (data) => runAsync(async () => {
    const followUp = await crmService.createFollowUp(data);
    setFollowUps(prev => [followUp, ...prev]);
    fetchDashboard();
    return followUp;
  });

  const updateFollowUp = (id, data) => runAsync(async () => {
    const followUp = await crmService.updateFollowUp(id, data);
    setFollowUps(prev => prev.map(f => f._id === id ? followUp : f));
    fetchDashboard();
    return followUp;
  });

  const deleteFollowUp = (id) => runAsync(async () => {
    await crmService.deleteFollowUp(id);
    setFollowUps(prev => prev.filter(f => f._id !== id));
    fetchDashboard();
  });

  // Fetch Activities
  const fetchActivities = (params = {}) => runAsync(async () => {
    const data = await crmService.getActivities(params);
    setActivities(data);
    return data;
  });

  const createActivity = (data) => runAsync(async () => {
    const activity = await crmService.createActivity(data);
    setActivities(prev => [activity, ...prev]);
    fetchDashboard();
    return activity;
  });

  // Fetch Notifications
  const fetchNotifications = () => runAsync(async () => {
    const data = await crmService.getNotifications();
    setNotifications(data);
    return data;
  });

  const markNotificationRead = (id) => runAsync(async () => {
    const readItem = await crmService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? readItem : n));
    return readItem;
  });

  // Orders
  const fetchOrders = (params = {}) => runAsync(async () => {
    const res = await crmService.getOrders(params);
    setOrders(res.data);
    setOrdersTotal(res.total);
    return res;
  });

  const fetchOrder = (id) => runAsync(async () => {
    return await crmService.getOrder(id);
  });

  const createOrder = (data) => runAsync(async () => {
    const order = await crmService.createOrder(data);
    setOrders(prev => [order, ...prev]);
    fetchDashboard();
    return order;
  });

  const updateOrder = (id, data) => runAsync(async () => {
    const order = await crmService.updateOrder(id, data);
    setOrders(prev => prev.map(o => o._id === id ? order : o));
    fetchDashboard();
    return order;
  });

  const deleteOrder = (id) => runAsync(async () => {
    await crmService.deleteOrder(id);
    setOrders(prev => prev.filter(o => o._id !== id));
    fetchDashboard();
  });

  // Payments
  const fetchPayments = (params = {}) => runAsync(async () => {
    const data = await crmService.getPayments(params);
    setPayments(data);
    return data;
  });

  const createPayment = (data) => runAsync(async () => {
    const payment = await crmService.createPayment(data);
    setPayments(prev => [payment, ...prev]);
    fetchDashboard();
    return payment;
  });

  // Expenses
  const fetchExpenses = (params = {}) => runAsync(async () => {
    const res = await crmService.getExpenses(params);
    setExpenses(res.data);
    setExpensesTotal(res.total);
    return res;
  });

  const createExpense = (data) => runAsync(async () => {
    const expense = await crmService.createExpense(data);
    setExpenses(prev => [expense, ...prev]);
    fetchDashboard();
    return expense;
  });

  const updateExpense = (id, data) => runAsync(async () => {
    const expense = await crmService.updateExpense(id, data);
    setExpenses(prev => prev.map(e => e._id === id ? expense : e));
    fetchDashboard();
    return expense;
  });

  const deleteExpense = (id) => runAsync(async () => {
    await crmService.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e._id !== id));
    fetchDashboard();
  });
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [currentTenant, currentUser]);

  const fetchUsers = () => runAsync(async () => {
    try {
      const data = await crmService.getUsers();
      setUsers(data);
      return data;
    } catch (err) {
      console.warn('Failed to load users list in context:', err.message);
    }
  });

  return (
    <CrmContext.Provider value={{
      dashboardStats,
      reportsStats,
      leads,
      users,
      contacts,
      companies,
      deals,
      tasks,
      followUps,
      activities,
      settings,
      notifications,
      leadsTotal,
      contactsTotal,
      companiesTotal,
      orders,
      ordersTotal,
      payments,
      expenses,
      expensesTotal,
      isLoading,
      error,
      
      currentTenant,
      setCurrentTenant,
      currentUser,
      setCurrentUser,
      currentUserRole,
      setCurrentUserRole,

      fetchDashboard,
      fetchReports,
      fetchSettings,
      updateSettings,
      fetchLeads,
      createLead,
      updateLead,
      deleteLead,
      fetchContacts,
      createContact,
      updateContact,
      deleteContact,
      fetchCompanies,
      createCompany,
      updateCompany,
      deleteCompany,
      fetchDeals,
      createDeal,
      updateDeal,
      deleteDeal,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
      fetchFollowUps,
      createFollowUp,
      updateFollowUp,
      deleteFollowUp,
      fetchActivities,
      createActivity,
      fetchNotifications,
      markNotificationRead,
      fetchUsers,

      fetchOrders,
      fetchOrder,
      createOrder,
      updateOrder,
      deleteOrder,
      fetchPayments,
      createPayment,
      fetchExpenses,
      createExpense,
      updateExpense,
      deleteExpense
    }}>
      {children}
    </CrmContext.Provider>
  );
}
