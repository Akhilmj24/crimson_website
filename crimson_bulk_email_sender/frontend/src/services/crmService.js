// CRM Service API integration helper

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': localStorage.getItem('crm_tenant_id') || 'default-tenant',
    'X-User-ID': localStorage.getItem('crm_user_id') || 'Akhil',
    'X-User-Role': localStorage.getItem('crm_user_role') || 'Admin'
  };

  // If there's an ACCESS_TOKEN needed, retrieve it or default
  const token = localStorage.getItem('crm_token') || 'test-token';
  headers['Authorization'] = `Bearer ${token}`;

  return headers;
};

const originalFetch = window.fetch;

const fetch = async (url, options = {}) => {
  // Ensure headers exist and merge getHeaders()
  options.headers = {
    ...getHeaders(),
    ...options.headers
  };

  let res = await originalFetch(url, options);

  // If expired token (401), try refresh
  if (res.status === 401) {
    const refreshToken = localStorage.getItem('crm_refresh_token');
    if (refreshToken) {
      try {
        const refreshRes = await originalFetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.token) {
            localStorage.setItem('crm_token', refreshData.token);
            if (refreshData.refreshToken) {
              localStorage.setItem('crm_refresh_token', refreshData.refreshToken);
            }
            // Retry the original request with the new token
            options.headers['Authorization'] = `Bearer ${refreshData.token}`;
            res = await originalFetch(url, options);
          }
        } else {
          // Refresh token failed/expired -> log user out
          localStorage.removeItem('crm_token');
          localStorage.removeItem('crm_refresh_token');
          window.location.reload();
        }
      } catch (err) {
        console.error('Error refreshing token:', err);
      }
    }
  }

  return res;
};

export const crmService = {
  // Dashboard & Reports
  async getDashboard() {
    const res = await fetch('/api/crm/dashboard', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch CRM Dashboard stats');
    return res.json();
  },

  async getReports() {
    const res = await fetch('/api/crm/reports', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch CRM Reports stats');
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch('/api/crm/settings', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch CRM Settings');
    return res.json();
  },

  async updateSettings(data) {
    const res = await fetch('/api/crm/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update CRM Settings');
    return res.json();
  },

  // Leads
  async getLeads(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/crm/leads?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Leads');
    return res.json();
  },

  async getLead(id) {
    const res = await fetch(`/api/crm/leads/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Lead details');
    return res.json();
  },

  async createLead(data) {
    const res = await fetch('/api/crm/leads', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create Lead');
    return res.json();
  },

  async updateLead(id, data) {
    const res = await fetch(`/api/crm/leads/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update Lead');
    return res.json();
  },

  async deleteLead(id) {
    const res = await fetch(`/api/crm/leads/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete Lead');
    return res.json();
  },

  // Contacts
  async getContacts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/crm/contacts?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Contacts');
    return res.json();
  },

  async getContact(id) {
    const res = await fetch(`/api/crm/contacts/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Contact details');
    return res.json();
  },

  async createContact(data) {
    const res = await fetch('/api/crm/contacts', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create Contact');
    return res.json();
  },

  async updateContact(id, data) {
    const res = await fetch(`/api/crm/contacts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update Contact');
    return res.json();
  },

  async deleteContact(id) {
    const res = await fetch(`/api/crm/contacts/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete Contact');
    return res.json();
  },

  // Companies
  async getCompanies(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/crm/companies?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Companies');
    return res.json();
  },

  async getCompany(id) {
    const res = await fetch(`/api/crm/companies/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Company details');
    return res.json();
  },

  async createCompany(data) {
    const res = await fetch('/api/crm/companies', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create Company');
    return res.json();
  },

  async updateCompany(id, data) {
    const res = await fetch(`/api/crm/companies/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update Company');
    return res.json();
  },

  async deleteCompany(id) {
    const res = await fetch(`/api/crm/companies/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete Company');
    return res.json();
  },

  // Deals
  async getDeals(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/crm/deals?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Deals');
    return res.json();
  },

  async getDeal(id) {
    const res = await fetch(`/api/crm/deals/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Deal details');
    return res.json();
  },

  async createDeal(data) {
    const res = await fetch('/api/crm/deals', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create Deal');
    return res.json();
  },

  async updateDeal(id, data) {
    const res = await fetch(`/api/crm/deals/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update Deal');
    return res.json();
  },

  async deleteDeal(id) {
    const res = await fetch(`/api/crm/deals/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete Deal');
    return res.json();
  },

  // Tasks
  async getTasks(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/crm/tasks?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Tasks');
    return res.json();
  },

  async getTask(id) {
    const res = await fetch(`/api/crm/tasks/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Task details');
    return res.json();
  },

  async createTask(data) {
    const res = await fetch('/api/crm/tasks', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create Task');
    return res.json();
  },

  async updateTask(id, data) {
    const res = await fetch(`/api/crm/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update Task');
    return res.json();
  },

  async deleteTask(id) {
    const res = await fetch(`/api/crm/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete Task');
    return res.json();
  },

  // Follow Ups
  async getFollowUps() {
    const res = await fetch('/api/crm/followups', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Follow Ups');
    return res.json();
  },

  async createFollowUp(data) {
    const res = await fetch('/api/crm/followups', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create Follow Up');
    return res.json();
  },

  async updateFollowUp(id, data) {
    const res = await fetch(`/api/crm/followups/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update Follow Up');
    return res.json();
  },

  async deleteFollowUp(id) {
    const res = await fetch(`/api/crm/followups/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete Follow Up');
    return res.json();
  },

  // Activities
  async getActivities(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/crm/activities?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Activities');
    return res.json();
  },

  async createActivity(data) {
    const res = await fetch('/api/crm/activities', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create Activity log');
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch('/api/crm/notifications', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Notifications');
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`/api/crm/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },

  // User Accounts
  async getUsers() {
    const res = await fetch('/api/auth/users', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user accounts');
    return res.json();
  },

  async createUser(data) {
    const res = await fetch('/api/auth/users', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create user account');
    return res.json();
  },

  async deleteUser(id) {
    const res = await fetch(`/api/auth/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete user account');
    return res.json();
  },

  // Orders
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/crm/orders?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Orders');
    return res.json();
  },

  async getOrder(id) {
    const res = await fetch(`/api/crm/orders/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Order details');
    return res.json();
  },

  async createOrder(data) {
    const res = await fetch('/api/crm/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create Order');
    return res.json();
  },

  async updateOrder(id, data) {
    const res = await fetch(`/api/crm/orders/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update Order');
    return res.json();
  },

  async deleteOrder(id) {
    const res = await fetch(`/api/crm/orders/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete Order');
    return res.json();
  },

  // Payments
  async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/crm/payments?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Payments');
    return res.json();
  },

  async createPayment(data) {
    const res = await fetch('/api/crm/payments', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record Payment');
    return res.json();
  },

  // Expenses
  async getExpenses(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/crm/expenses?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch Expenses');
    return res.json();
  },

  async createExpense(data) {
    const res = await fetch('/api/crm/expenses', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create Expense');
    return res.json();
  },

  async updateExpense(id, data) {
    const res = await fetch(`/api/crm/expenses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update Expense');
    return res.json();
  },

  async deleteExpense(id) {
    const res = await fetch(`/api/crm/expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete Expense');
    return res.json();
  }
};
