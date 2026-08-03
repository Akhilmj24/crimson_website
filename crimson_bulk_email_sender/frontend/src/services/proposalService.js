export const proposalService = {
  async getProposals() {
    const res = await fetch('/api/proposals');
    if (!res.ok) throw new Error('Failed to fetch proposals list');
    return res.json();
  },

  async getProposal(id) {
    const res = await fetch(`/api/proposals/${id}`);
    if (!res.ok) throw new Error('Failed to fetch proposal draft');
    return res.json();
  },

  async createProposal(data) {
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create proposal draft');
    return res.json();
  },

  async updateProposal(id, data) {
    const res = await fetch(`/api/proposals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update proposal draft');
    return res.json();
  },

  async deleteProposal(id) {
    const res = await fetch(`/api/proposals/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete proposal draft');
    return res.json();
  }
};
