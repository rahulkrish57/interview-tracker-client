import api from "./api";

const BASE = "/api/interviews";

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

  // ── Comments ──
  getComments: async (interviewId) => {
    const res = await api.get(`${BASE}/${interviewId}/comments`);
    return res.data;
  },

  addComment: async (interviewId, content, contentHtml) => {
    const res = await api.post(`${BASE}/${interviewId}/comments`, {
      content,
      content_html: contentHtml,
    });
    return res.data;
  },

  deleteComment: async (interviewId, commentId) => {
    const res = await api.delete(
      `${BASE}/${interviewId}/comments/${commentId}`,
    );
    return res.data;
  },

  // ── History ──
  getHistory: async (interviewId) => {
    const res = await api.get(`${BASE}/${interviewId}/history`);
    return res.data;
  },
};
