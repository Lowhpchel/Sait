import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMonthlyStats, getServicesStats, getStatusStats, getExportData } from '../../api/adminApi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv';
import './Analytics.css';

const COLORS = ['#003366', '#0055a4', '#4da6ff', '#ff9800', '#4caf50', '#f44336', '#9c27b0', '#00bcd4'];

function Analytics() {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState(null);
  const [servicesData, setServicesData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [exportData, setExportData] = useState([]);
  const [exportType, setExportType] = useState('requests');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      const [monthlyRes, servicesRes, statusRes] = await Promise.all([
        getMonthlyStats(),
        getServicesStats(),
        getStatusStats()
      ]);
      if (monthlyRes.success) setMonthlyData(monthlyRes.data);
      if (servicesRes.success) setServicesData(servicesRes.data);
      if (statusRes.success) setStatusData(statusRes.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExportType(type);
    const res = await getExportData(type);
    if (res.success) setExportData(res.data);
  };

  const formatMonth = (month) => {
    const [year, m] = month.split('-');
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    return `${months[parseInt(m) - 1]} ${year}`;
  };

  if (loading) return <div className="analytics-page"><h1>Загрузка аналитики...</h1></div>;

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <h1>📊 Расширенная аналитика</h1>

        <div className="analytics-tabs">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📈 Обзор</button>
          <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>🔧 Услуги</button>
          <button className={`tab-btn ${activeTab === 'statuses' ? 'active' : ''}`} onClick={() => setActiveTab('statuses')}>📋 Статусы</button>
          <button className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`} onClick={() => setActiveTab('export')}>📥 Экспорт</button>
        </div>

        {/* Обзор */}
        {activeTab === 'overview' && monthlyData && (
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Заявки по месяцам</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyData.monthlyRequests.reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} />
                  <YAxis />
                  <Tooltip labelFormatter={formatMonth} />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Заявки" stroke="#003366" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Заказы по месяцам</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyData.monthlyOrders.reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} />
                  <YAxis />
                  <Tooltip labelFormatter={formatMonth} />
                  <Legend />
                  <Bar dataKey="count" name="Заказы" fill="#0055a4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Услуги */}
        {activeTab === 'services' && servicesData && (
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Топ услуг по заказам</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={servicesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="title" type="category" width={200} />
                  <Tooltip />
                  <Bar dataKey="orders_count" name="Заказов" fill="#003366" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Доход по услугам</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={servicesData}
                    dataKey="total_revenue"
                    nameKey="title"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    label={({ title, total_revenue }) => `${title?.substring(0, 20)}: ${parseInt(total_revenue).toLocaleString()} ₽`}
                  >
                    {servicesData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${parseInt(value).toLocaleString()} ₽`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Статусы */}
        {activeTab === 'statuses' && statusData && (
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Статусы заявок</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={statusData.requestStatuses}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {statusData.requestStatuses.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Статусы заказов</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={statusData.orderStatuses}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {statusData.orderStatuses.map((entry, index) => (
                      <Cell key={index} fill={COLORS[(index + 4) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Экспорт */}
        {activeTab === 'export' && (
          <div className="export-section">
            <h3>📥 Экспорт данных</h3>
            <div className="export-buttons">
              <button onClick={() => handleExport('requests')} className="export-btn">📋 Заявки</button>
              <button onClick={() => handleExport('orders')} className="export-btn">📦 Заказы</button>
              <button onClick={() => handleExport('services')} className="export-btn">🔧 Услуги</button>
            </div>
            
            {exportData.length > 0 && (
              <div className="export-preview">
                <p>Данные готовы к экспорту ({exportData.length} записей)</p>
                <CSVLink 
                  data={exportData} 
                  filename={`gazprom-${exportType}-${new Date().toISOString().split('T')[0]}.csv`}
                  className="download-btn"
                >
                  📥 Скачать CSV
                </CSVLink>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;