import { pool } from '../config/database.js';

// Получить все события
export const getEvents = async (req, res) => {
  try {
    const [events] = await pool.execute(
      'SELECT * FROM calendar_events ORDER BY event_date ASC'
    );
    
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Ошибка получения событий:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Создать событие
export const createEvent = async (req, res) => {
  try {
    const { title, event_date, event_type, description } = req.body;
    
    if (!title || !event_date) {
      return res.status(400).json({
        success: false,
        message: 'Название и дата обязательны'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO calendar_events (title, event_date, event_type, description, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, event_date, event_type || 'other', description || null, req.user.id]
    );

    console.log('✅ Событие создано:', title);

    res.status(201).json({
      success: true,
      message: 'Событие создано',
      data: { id: result.insertId, title, event_date, event_type }
    });
  } catch (error) {
    console.error('Ошибка создания события:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Обновить событие
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, event_date, event_type, description } = req.body;

    await pool.execute(
      'UPDATE calendar_events SET title = ?, event_date = ?, event_type = ?, description = ? WHERE id = ?',
      [title, event_date, event_type, description, id]
    );

    console.log('✅ Событие обновлено:', id);
    res.json({ success: true, message: 'Событие обновлено' });
  } catch (error) {
    console.error('Ошибка обновления события:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Удалить событие
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM calendar_events WHERE id = ?', [id]);
    
    console.log('🗑️ Событие удалено:', id);
    res.json({ success: true, message: 'Событие удалено' });
  } catch (error) {
    console.error('Ошибка удаления события:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};  