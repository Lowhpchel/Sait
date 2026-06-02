import { pool } from '../config/database.js';

class Request {
  // Создать заявку
  static async create(data) {
    try {
      const sql = `
        INSERT INTO client_requests (service_id, client_name, company_name, email, phone, message)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(sql, [
        data.service_id,
        data.client_name,
        data.company_name,
        data.email,
        data.phone,
        data.message
      ]);
      
      return { id: result.insertId, ...data };
    } catch (error) {
      console.error('Ошибка создания заявки:', error.message);
      throw error;
    }
  }

  // Получить все заявки
  static async findAll() {
    try {
      const sql = `
        SELECT cr.*, s.title as service_title
        FROM client_requests cr
        LEFT JOIN services s ON cr.service_id = s.id
        ORDER BY cr.created_at DESC
      `;
      
      const [rows] = await pool.execute(sql);
      return rows;
    } catch (error) {
      console.error('Ошибка получения заявок:', error.message);
      return [];
    }
  }
}

export default Request;