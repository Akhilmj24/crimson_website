export const invoiceService = {
  async getInvoices() {
    const res = await fetch('/api/invoices');
    if (!res.ok) throw new Error('Failed to fetch invoices list');
    return res.json();
  },

  async getInvoice(id) {
    const res = await fetch(`/api/invoices/${id}`);
    if (!res.ok) throw new Error('Failed to fetch invoice draft');
    return res.json();
  },

  async createInvoice(data) {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create invoice draft');
    return res.json();
  },

  async updateInvoice(id, data) {
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update invoice draft');
    return res.json();
  },

  async deleteInvoice(id) {
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete invoice draft');
    return res.json();
  }
};
