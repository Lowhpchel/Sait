import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import serviceRoutes from './routes/serviceRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import orderRoutes from './routes/orderRoutes.js';  
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.get('/api', (req, res) => {
  res.json({ success: true, message: 'API ООО Газпром Трансгаз Самара', version: '1.0.0' });
});

app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/orders', orderRoutes);  // ← НОВАЯ СТРОКА

app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'Маршрут не найден' });
});

app.use(errorHandler);

const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
  });
};

startServer();
