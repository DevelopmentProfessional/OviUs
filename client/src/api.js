const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

let cachedIndicators = null;

export const api = {
  getClients: () => request('/clients'),
  getClient: (id) => request(`/clients/${id}`),
  createClient: (data) =>
    request('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (id, data) =>
    request(`/clients/${id}/profile`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id) => request(`/clients/${id}`, { method: 'DELETE' }),

  getIndicators: async (forceRefresh = false) => {
    if (!cachedIndicators || forceRefresh) {
      const data = await request('/indicators');
      cachedIndicators = (data || []).slice().sort((a, b) =>
        a.metric_name.localeCompare(b.metric_name)
      );
    }
    return cachedIndicators;
  },

  createIndicator: async (data) => {
    const created = await request('/indicators', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (cachedIndicators) {
      const existingIdx = cachedIndicators.findIndex((i) => i.id === created.id);
      if (existingIdx >= 0) {
        cachedIndicators[existingIdx] = created;
      } else {
        cachedIndicators.push(created);
      }
      cachedIndicators.sort((a, b) => a.metric_name.localeCompare(b.metric_name));
    }
    return created;
  },

  getLogs: (clientId) => request(`/clients/${clientId}/logs`),
  createLog: (clientId, data) =>
    request(`/clients/${clientId}/logs`, { method: 'POST', body: JSON.stringify(data) }),

  getCalendar: (month) => request(`/calendar?month=${month}`),
  getClientPrediction: (clientId) => request(`/calendar/client/${clientId}`),
};
