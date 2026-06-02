import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      full_name: user.full_name 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Регистрация
export const register = async (req, res) => {
  try {
    const { username, password, full_name, email } = req.body;

    if (!username || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Заполните обязательные поля'
      });
    }

    // Проверяем существование пользователя
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь уже существует'
      });
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    console.log('Создание пользователя:', username);
    console.log('Хеш пароля:', password_hash);

    // Создаем пользователя
    const [result] = await pool.execute(
      'INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, password_hash, full_name, email || null, 'manager']
    );

    const token = generateToken({
      id: result.insertId,
      username,
      role: 'manager',
      full_name
    });

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      data: {
        token,
        user: {
          id: result.insertId,
          username,
          full_name,
          email,
          role: 'manager'
        }
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

// Вход
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Попытка входа:', username);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Введите логин и пароль'
      });
    }

    // Ищем пользователя
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND is_active = 1',
      [username]
    );

    console.log('Найдено пользователей:', users.length);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Неверный логин или пароль'
      });
    }

    const user = users[0];

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    console.log('Пароль верный:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверный логин или пароль'
      });
    }

    // Обновляем время входа
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    const token = generateToken(user);

    console.log('✅ Успешный вход:', user.username);

    res.json({
      success: true,
      message: 'Успешный вход',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при входе'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, full_name, email, role, last_login, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, full_name, email, role, is_active, last_login, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};