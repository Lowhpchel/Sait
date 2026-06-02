import Service from '../models/Service.js';

// GET /api/services - все услуги
export const getServices = async (req, res) => {
  try {
    const { category, search, limit } = req.query;
    const filters = {};
    
    if (category) filters.category_id = parseInt(category);
    if (search) filters.search = search;
    if (limit) filters.limit = parseInt(limit);

    const services = await Service.findAll(filters);
    
    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Ошибка в getServices:', error.message);
    res.json({ success: true, data: [] });
  }
};

// GET /api/services/:id - услуга по ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Услуга не найдена' });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    console.error('Ошибка в getServiceById:', error.message);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// GET /api/services/categories/all - категории
export const getCategories = async (req, res) => {
  try {
    const categories = await Service.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Ошибка в getCategories:', error.message);
    res.json({ success: true, data: [] });
  }
};

// GET /api/services/popular - популярные услуги
export const getPopularServices = async (req, res) => {
  try {
    console.log('⭐ Запрос популярных услуг');
    const services = await Service.getPopular(6);
    console.log(`✅ Получено популярных услуг: ${services.length}`);
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('❌ Ошибка в getPopularServices:', error.message);
    res.json({ success: true, data: [] });
  }
};