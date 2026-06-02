import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

// ========== СТАТИСТИКА ==========
export const getStats = async (req, res) => {
  try {
    const [[{ servicesCount }]] = await pool.execute('SELECT COUNT(*) as servicesCount FROM services WHERE is_active = 1');
    const [[{ requestsCount }]] = await pool.execute('SELECT COUNT(*) as requestsCount FROM client_requests');
    const [[{ newRequests }]] = await pool.execute("SELECT COUNT(*) as newRequests FROM client_requests WHERE status = 'new'");
    const [[{ usersCount }]] = await pool.execute('SELECT COUNT(*) as usersCount FROM users WHERE is_active = 1');

    res.json({
      success: true,
      data: {
        services: servicesCount,
        requests: requestsCount,
        newRequests: newRequests,
        users: usersCount
      }
    });
  } catch (error) {
    console.error('Ошибка статистики:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// ========== УПРАВЛЕНИЕ ЗАЯВКАМИ ==========
export const getAllRequests = async (req, res) => {
  try {
    const [requests] = await pool.execute(`
      SELECT cr.*, s.title as service_title 
      FROM client_requests cr 
      LEFT JOIN services s ON cr.service_id = s.id 
      ORDER BY cr.created_at DESC
    `);

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Ошибка получения заявок:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

export const createRequest = async (req, res) => {
  try {
    const { service_id, client_name, company_name, email, phone, message } = req.body;

    if (!client_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Заполните обязательные поля: имя, email, телефон'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO client_requests (service_id, client_name, company_name, email, phone, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [service_id || null, client_name, company_name || null, email, phone, message || null, 'new']
    );

    console.log('✅ Заявка создана:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Заявка создана',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Ошибка создания заявки:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.execute(
      'UPDATE client_requests SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ success: true, message: 'Статус обновлен' });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM client_requests WHERE id = ?', [id]);
    res.json({ success: true, message: 'Заявка удалена' });
  } catch (error) {
    console.error('Ошибка удаления заявки:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// ========== УПРАВЛЕНИЕ УСЛУГАМИ ==========
export const getAllServicesAdmin = async (req, res) => {
  try {
    const [services] = await pool.execute(`
      SELECT s.*, sc.name as category_name 
      FROM services s 
      JOIN service_categories sc ON s.category_id = sc.id 
      ORDER BY s.created_at DESC
    `);

    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Ошибка получения услуг:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

export const createService = async (req, res) => {
  try {
    const { category_id, title, description, price, duration } = req.body;
    const slug = title.toLowerCase().replace(/[^а-яёa-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const [result] = await pool.execute(
      'INSERT INTO services (category_id, title, slug, description, price, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [category_id, title, slug, description, price, duration || null]
    );

    console.log('✅ Услуга создана:', title);

    res.status(201).json({ success: true, message: 'Услуга создана', data: { id: result.insertId } });
  } catch (error) {
    console.error('Ошибка создания услуги:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, duration } = req.body;

    await pool.execute(
      'UPDATE services SET title = ?, description = ?, price = ?, duration = ? WHERE id = ?',
      [title, description, price, duration, id]
    );

    res.json({ success: true, message: 'Услуга обновлена' });
  } catch (error) {
    console.error('Ошибка обновления услуги:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE services SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Услуга удалена' });
  } catch (error) {
    console.error('Ошибка удаления услуги:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ==========
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, full_name, email, role, is_active, last_login, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, password, full_name, email, role } = req.body;

    console.log('📝 Создание пользователя:', { username, full_name, email, role });

    // Проверка обязательных полей
    if (!username || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Заполните обязательные поля: логин, пароль, ФИО'
      });
    }

    // Проверка длины пароля
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Пароль должен быть не менее 6 символов'
      });
    }

    // Проверка роли
    const validRoles = ['admin', 'manager', 'employee'];
    const userRole = role || 'manager';
    
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Недопустимая роль'
      });
    }

    // Проверяем, существует ли пользователь
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email || null]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким логином или email уже существует'
      });
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    console.log('🔐 Хеш пароля создан');

    // Создаем пользователя
    const [result] = await pool.execute(
      'INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, password_hash, full_name, email || null, userRole]
    );

    console.log(`✅ Пользователь создан: ID=${result.insertId}, username=${username}, role=${userRole}`);

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно создан',
      data: { 
        id: result.insertId,
        username,
        full_name,
        email,
        role: userRole
      }
    });
  } catch (error) {
    console.error('❌ Ошибка создания пользователя:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера: ' + error.message 
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Нельзя изменить роль самому себе
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя изменить свою роль'
      });
    }

    // Проверяем, что роль валидна
    const validRoles = ['admin', 'manager', 'employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Недопустимая роль'
      });
    }

    await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    console.log(`✅ Роль пользователя ID=${id} изменена на ${role}`);

    res.json({ success: true, message: 'Роль обновлена' });
  } catch (error) {
    console.error('Ошибка обновления роли:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // Нельзя деактивировать самого себя
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя деактивировать свою учетную запись'
      });
    }

    await pool.execute(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    const status = is_active ? 'разблокирован' : 'заблокирован';
    console.log(`✅ Пользователь ID=${id} ${status}`);

    res.json({ success: true, message: 'Статус обновлен' });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Нельзя удалить самого себя
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя удалить свою учетную запись'
      });
    }

    // Проверяем, что пользователь существует
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    console.log(`✅ Пользователь ID=${id} удален`);

    res.json({ success: true, message: 'Пользователь удален' });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
  
};
// ========== РАСШИРЕННАЯ СТАТИСТИКА ==========

// Статистика по месяцам
export const getMonthlyStats = async (req, res) => {
  try {
    // Заявки по месяцам
    const [monthlyRequests] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM client_requests 
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    // Заказы по месяцам
    const [monthlyOrders] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM user_orders 
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      success: true,
      data: {
        monthlyRequests,
        monthlyOrders
      }
    });
  } catch (error) {
    console.error('Ошибка статистики по месяцам:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Статистика по услугам
export const getServicesStats = async (req, res) => {
  try {
    const [servicesStats] = await pool.execute(`
      SELECT 
        s.title,
        COUNT(uo.id) as orders_count,
        SUM(s.price) as total_revenue,
        s.view_count
      FROM services s
      LEFT JOIN user_orders uo ON s.id = uo.service_id
      WHERE s.is_active = 1
      GROUP BY s.id
      ORDER BY orders_count DESC
      LIMIT 10
    `);

    res.json({ success: true, data: servicesStats });
  } catch (error) {
    console.error('Ошибка статистики услуг:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Статистика по статусам
export const getStatusStats = async (req, res) => {
  try {
    // Статусы заявок
    const [requestStatuses] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM client_requests
      GROUP BY status
    `);

    // Статусы заказов
    const [orderStatuses] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM user_orders
      GROUP BY status
    `);

    res.json({
      success: true,
      data: {
        requestStatuses,
        orderStatuses
      }
    });
  } catch (error) {
    console.error('Ошибка статистики статусов:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Данные для экспорта
export const getExportData = async (req, res) => {
  try {
    const { type } = req.params;
    let data = [];

    switch (type) {
      case 'requests':
        const [requests] = await pool.execute(`
          SELECT cr.id, cr.client_name, cr.company_name, cr.email, cr.phone, 
                 s.title as service_title, cr.status, cr.created_at
          FROM client_requests cr
          LEFT JOIN services s ON cr.service_id = s.id
          ORDER BY cr.created_at DESC
        `);
        data = requests;
        break;
      
      case 'orders':
        const [orders] = await pool.execute(`
          SELECT uo.id, u.full_name, u.email, s.title as service_title, 
                 s.price, uo.status, uo.notes, uo.created_at
          FROM user_orders uo
          JOIN users u ON uo.user_id = u.id
          JOIN services s ON uo.service_id = s.id
          ORDER BY uo.created_at DESC
        `);
        data = orders;
        break;
      
      case 'services':
        const [services] = await pool.execute(`
          SELECT s.id, s.title, sc.name as category, s.price, s.duration, 
                 s.view_count, s.is_active, s.created_at
          FROM services s
          JOIN service_categories sc ON s.category_id = sc.id
          ORDER BY s.created_at DESC
        `);
        data = services;
        break;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};