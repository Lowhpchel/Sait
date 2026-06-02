import axios from 'axios';

const API_URL = '/api/admin';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Статистика
export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

// Заявки
export const getRequests = async () => {
  const response = await api.get('/requests');
  return response.data;
};

export const updateRequestStatus = async (id, status) => {
  const response = await api.put(`/requests/${id}`, { status });
  return response.data;
};

export const deleteRequest = async (id) => {
  const response = await api.delete(`/requests/${id}`);
  return response.data;
};

export const createRequest = async (data) => {
  const response = await api.post('/requests', data);
  return response.data;
};

// Услуги
export const getAdminServices = async () => {
  const response = await api.get('/services');
  return response.data;
};

export const createService = async (data) => {
  const response = await api.post('/services', data);
  return response.data;
};

export const updateService = async (id, data) => {
  const response = await api.put(`/services/${id}`, data);
  return response.data;
};

export const deleteService = async (id) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};
// Пользователи
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.put(`/users/${id}/role`, { role });
  return response.data;
};

export const toggleUserStatus = async (id, is_active) => {
  const response = await api.put(`/users/${id}/status`, { is_active });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};
export const getMonthlyStats = async () => {
  const response = await api.get('/stats/monthly');
  return response.data;
};

export const getServicesStats = async () => {
  const response = await api.get('/stats/services');
  return response.data;
};

export const getStatusStats = async () => {
  const response = await api.get('/stats/statuses');
  return response.data;
};

export const getExportData = async (type) => {
  const response = await api.get(`/export/${type}`);
  return response.data;
};