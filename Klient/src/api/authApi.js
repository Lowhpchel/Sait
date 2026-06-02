import axios from 'axios';

const API_URL = '/api/auth';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем токен к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/login', { username, password });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Ошибка входа'
    };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Ошибка регистрации'
    };
  }
};

export const getMe = async () => {
  try {
    const response = await api.get('/me');
    return response.data;
  } catch (error) {
    return { success: false };
  }
};