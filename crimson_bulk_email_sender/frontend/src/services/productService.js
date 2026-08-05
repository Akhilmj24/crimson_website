const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': localStorage.getItem('crm_tenant_id') || 'default-tenant',
    'X-User-ID': localStorage.getItem('crm_user_id') || 'Akhil',
    'X-User-Role': localStorage.getItem('crm_user_role') || 'Admin'
  };

  const token = localStorage.getItem('crm_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const productService = {
  async getProducts() {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to fetch product catalog');
    return res.json();
  },

  async createProduct(data) {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to add product');
    }
    return res.json();
  },

  async updateProduct(id, data) {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to update product');
    }
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to delete product');
    }
    return res.json();
  }
};
