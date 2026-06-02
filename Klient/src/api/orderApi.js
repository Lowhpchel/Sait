import axios from 'axios';

const API_URL = '/api/orders';

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

// Для пользователей
export const getMyOrders = async () => {
  const response = await api.get('/my');
  return response.data;
};

export const addToOrders = async (serviceId, notes) => {
  const response = await api.post('/add', { service_id: serviceId, notes });
  return response.data;
};

export const removeFromOrders = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

// Для админа/менеджера
export const getAllOrders = async () => {
  const response = await api.get('/all');
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/${id}/status`, { status });
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(`/admin/${id}`);
  return response.data;
};