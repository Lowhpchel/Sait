import axios from 'axios';

// Используем относительный путь, чтобы работал прокси Vite
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getServices = async (filters = {}) => {
  try {
    const response = await api.get('/services', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки услуг:', error.message);
    return { success: false, data: [], message: error.message };
  }
};

export const getServiceById = async (id) => {
  try {
    const response = await api.get(`/services/${id}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки услуги:', error.message);
    return { success: false, data: null, message: error.message };
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/services/categories/all');
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error.message);
    return { success: false, data: [], message: error.message };
  }
};

export const getPopularServices = async () => {
  try {
    const response = await api.get('/services/popular');
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки популярных услуг:', error.message);
    return { success: false, data: [], message: error.message };
  }
};

export const submitRequest = async (data) => {
  try {
    const response = await api.post('/requests', data);
    return response.data;
  } catch (error) {
    console.error('Ошибка отправки заявки:', error.message);
    throw error;
  }
};