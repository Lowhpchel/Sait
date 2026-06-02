import axios from 'axios';

const API_URL = '/api/calendar';

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

export const getEvents = async () => {
  const response = await api.get('/');
  return response.data;
};

export const createEvent = async (data) => {
  const response = await api.post('/', data);
  return response.data;
};

export const updateEvent = async (id, data) => {
  const response = await api.put(`/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};