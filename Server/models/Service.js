import { pool } from '../config/database.js';

class Service {
  // Найти все услуги
  static async findAll(filters = {}) {
    try {
      let sql = `
        SELECT s.*, sc.name as category_name 
        FROM services s
        JOIN service_categories sc ON s.category_id = sc.id
        WHERE s.is_active = 1
      `;
      const params = [];

      if (filters.category_id) {
        sql += ' AND s.category_id = ?';
        params.push(filters.category_id);
      }

      if (filters.search) {
        sql += ' AND (s.title LIKE ? OR s.description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      sql += ' ORDER BY s.created_at DESC';

      if (filters.limit) {
        sql += ` LIMIT ${parseInt(filters.limit)}`;
      }

      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Ошибка в findAll:', error.message);
      return [];
    }
  }

  // Найти услугу по ID
  static async findById(id) {
    try {
      const sql = `
        SELECT s.*, sc.name as category_name 
        FROM services s
        JOIN service_categories sc ON s.category_id = sc.id
        WHERE s.id = ? AND s.is_active = 1
      `;
      const [rows] = await pool.execute(sql, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Ошибка в findById:', error.message);
      return null;
    }
  }

  // Получить категории
  static async getCategories() {
    try {
      const sql = 'SELECT * FROM service_categories WHERE is_active = 1 ORDER BY sort_order';
      const [rows] = await pool.execute(sql);
      return rows;
    } catch (error) {
      console.error('Ошибка в getCategories:', error.message);
      return [];
    }
  }

  // Получить популярные услуги
  static async getPopular(limit = 6) {
    try {
      // Используем напрямую число в запросе, а не плейсхолдер
      const sql = `
        SELECT s.*, sc.name as category_name 
        FROM services s
        JOIN service_categories sc ON s.category_id = sc.id
        WHERE s.is_active = 1 
        ORDER BY s.view_count DESC
        LIMIT ${parseInt(limit)}
      `;
      
      console.log('SQL запрос популярных:', sql);
      const [rows] = await pool.execute(sql);
      return rows;
    } catch (error) {
      console.error('Ошибка в getPopular:', error.message);
      return [];
    }
  }

  // Создать услугу
  static async create(data) {
    try {
      const slug = data.title
        .toLowerCase()
        .replace(/[^а-яёa-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const sql = `
        INSERT INTO services (category_id, title, slug, description, full_description, price, duration, image_url, features)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute(sql, [
        data.category_id,
        data.title,
        slug,
        data.description,
        data.full_description || null,
        data.price,
        data.duration || null,
        data.image_url || null,
        JSON.stringify(data.features || [])
      ]);

      return { id: result.insertId, ...data, slug };
    } catch (error) {
      console.error('Ошибка в create:', error.message);
      throw error;
    }
  }

  // Обновить услугу
  static async update(id, data) {
    try {
      const fields = [];
      const params = [];

      if (data.title) {
        fields.push('title = ?');
        params.push(data.title);
        const slug = data.title.toLowerCase().replace(/[^а-яёa-z0-9]+/g, '-').replace(/^-|-$/g, '');
        fields.push('slug = ?');
        params.push(slug);
      }
      if (data.description) { fields.push('description = ?'); params.push(data.description); }
      if (data.price) { fields.push('price = ?'); params.push(data.price); }
      if (data.category_id) { fields.push('category_id = ?'); params.push(data.category_id); }
      if (data.duration) { fields.push('duration = ?'); params.push(data.duration); }

      if (fields.length === 0) return false;

      params.push(id);
      const sql = `UPDATE services SET ${fields.join(', ')} WHERE id = ?`;
      const [result] = await pool.execute(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Ошибка в update:', error.message);
      throw error;
    }
  }

  // Удалить услугу (мягкое удаление)
  static async delete(id) {
    try {
      const sql = 'UPDATE services SET is_active = 0 WHERE id = ?';
      const [result] = await pool.execute(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Ошибка в delete:', error.message);
      throw error;
    }
  }

  // Увеличить просмотры
  static async incrementViews(id) {
    try {
      const sql = 'UPDATE services SET view_count = view_count + 1 WHERE id = ?';
      await pool.execute(sql, [id]);
    } catch (error) {
      console.error('Ошибка в incrementViews:', error.message);
    }
  }
}

export default Service;