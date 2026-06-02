import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const initUsers = async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Создаем хеши паролей
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', salt);
    const managerHash = await bcrypt.hash('manager123', salt);

    console.log('Хеш для admin:', adminHash);
    console.log('Хеш для manager:', managerHash);

    // Очищаем таблицу
    await pool.execute('SET SQL_SAFE_UPDATES = 0');
    await pool.execute('DELETE FROM users');
    
    // Создаем админа
    await pool.execute(
      'INSERT INTO users (username, password_hash, full_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', adminHash, 'Ильин Владислав Вячеславович', 'admin@gazprom.ru', 'admin', 1]
    );
    console.log('✅ Админ создан');

    // Создаем менеджера
    await pool.execute(
      'INSERT INTO users (username, password_hash, full_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      ['manager', managerHash, 'Менеджер Системы', 'manager@gazprom.ru', 'manager', 1]
    );
    console.log('✅ Менеджер создан');

    await pool.execute('SET SQL_SAFE_UPDATES = 1');

    // Проверяем
    const [users] = await pool.execute('SELECT id, username, full_name, role, is_active FROM users');
    console.log('\n📋 Пользователи в базе:');
    console.table(users);

    console.log('\n🔑 Данные для входа:');
    console.log('1. Логин: admin | Пароль: admin123');
    console.log('2. Логин: manager | Пароль: manager123');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
};

initUsers();