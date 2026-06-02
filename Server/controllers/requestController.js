import Request from '../models/Request.js';

// POST /api/requests - создать заявку
export const createRequest = async (req, res) => {
  try {
    const { client_name, company_name, email, phone, message, service_id } = req.body;

    // Простая валидация
    if (!client_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Заполните обязательные поля: имя, email, телефон'
      });
    }

    const requestData = {
      service_id: service_id || null,
      client_name,
      company_name: company_name || null,
      email,
      phone,
      message: message || null
    };

    const request = await Request.create(requestData);
    
    console.log('✅ Новая заявка:', request);
    
    res.status(201).json({
      success: true,
      message: 'Заявка успешно отправлена',
      data: request
    });
  } catch (error) {
    console.error('❌ Ошибка создания заявки:', error.message);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при отправке заявки'
    });
  }
};

// GET /api/requests - получить все заявки
export const getRequests = async (req, res) => {
  try {
    const requests = await Request.findAll();
    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('❌ Ошибка получения заявок:', error.message);
    res.json({ success: true, data: [] });
  }
};