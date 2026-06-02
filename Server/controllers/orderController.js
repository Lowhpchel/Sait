import { pool } from '../config/database.js';

// Получить заказы пользователя
export const getUserOrders = async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT uo.*, s.title as service_title, s.price as service_price, 
             s.description as service_description, sc.name as category_name
      FROM user_orders uo
      JOIN services s ON uo.service_id = s.id
      JOIN service_categories sc ON s.category_id = sc.id
      WHERE uo.user_id = ?
      ORDER BY uo.created_at DESC
    `, [req.user.id]);

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Добавить услугу в заказы
export const addToOrders = async (req, res) => {
  try {
    const { service_id, notes } = req.body;
    const user_id = req.user.id;

    console.log('📝 Добавление заказа:', { user_id, service_id, notes });

    const [services] = await pool.execute(
      'SELECT id, is_active FROM services WHERE id = ? AND is_active = 1',
      [service_id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Услуга не найдена или неактивна'
      });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM user_orders WHERE user_id = ? AND service_id = ?',
      [user_id, service_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Эта услуга уже добавлена в ваш список'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO user_orders (user_id, service_id, notes) VALUES (?, ?, ?)',
      [user_id, service_id, notes || null]
    );

    console.log(`✅ Заказ создан: ID=${result.insertId}`);

    res.status(201).json({
      success: true,
      message: 'Услуга добавлена в ваш список',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Ошибка добавления в заказы:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Удалить услугу из заказов (пользователь)
export const removeFromOrders = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      'DELETE FROM user_orders WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    console.log(`🗑️ Заказ ${id} удален пользователем`);
    res.json({ success: true, message: 'Услуга удалена из списка' });
  } catch (error) {
    console.error('Ошибка удаления заказа:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Получить все заказы (для админа/менеджера)
export const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT uo.*, u.username, u.full_name, u.email as user_email,
             s.title as service_title, s.price as service_price
      FROM user_orders uo
      JOIN users u ON uo.user_id = u.id
      JOIN services s ON uo.service_id = s.id
      ORDER BY uo.created_at DESC
    `);

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Ошибка получения всех заказов:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Обновить статус заказа
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.execute(
      'UPDATE user_orders SET status = ? WHERE id = ?',
      [status, id]
    );

    console.log(`✅ Статус заказа ${id} изменен на ${status}`);
    res.json({ success: true, message: 'Статус обновлен' });
  } catch (error) {
    console.error('Ошибка обновления статуса заказа:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Удалить заказ (админ/менеджер)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM user_orders WHERE id = ?', [id]);
    
    console.log(`🗑️ Заказ ${id} удален администратором`);
    res.json({ success: true, message: 'Заказ удален' });
  } catch (error) {
    console.error('Ошибка удаления заказа:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};