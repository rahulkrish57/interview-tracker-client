import api from './api';

const BASE = '/api/interviews';

export const interviewService = {
  getAll: async (params = {}) => {
    const res = await api.get(BASE, { params });
    return res.data;
  },

  getOne: async (id) => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post(BASE, data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.patch(`${BASE}/${id}`, data);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  },
};