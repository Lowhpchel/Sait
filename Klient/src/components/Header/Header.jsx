import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Header.css';

function Header() {
  const { isDark, toggleTheme } = useTheme();
  const [stockData, setStockData] = useState({
    price: '—',
    change: '0.00',
    changePercent: '0.00',
    lastUpdate: ''
  });

  useEffect(() => {
    const fetchStockPrice = async () => {
      try {
        const response = await fetch(
          'https://iss.moex.com/iss/engines/stock/markets/shares/securities/GAZP.json'
        );

        if (!response.ok) {
          throw new Error('API не отвечает');
        }

        const data = await response.json();

        if (data.marketdata && data.marketdata.data) {
          const marketData = data.marketdata.data;
          
          const tqbrData = marketData.find(row => row[1] === 'TQBR');
          
          if (tqbrData) {
            const currentPrice = parseFloat(tqbrData[12]) || 0;
            const change = parseFloat(tqbrData[41]) || 0;
            
            let changePercent = '0.00';
            if (currentPrice > 0 && change !== 0) {
              const prevPrice = currentPrice - change;
              if (prevPrice > 0) {
                changePercent = ((change / prevPrice) * 100).toFixed(2);
              }
            }

            const now = new Date();
            const timeString = now.toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            });

            setStockData({
              price: currentPrice > 0 ? currentPrice.toFixed(2) : '—',
              change: change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
              changePercent: changePercent,
              lastUpdate: timeString
            });
          }
        }
      } catch (error) {
        console.log('⚠️ Курс не обновлен');
      }
    };

    fetchStockPrice();
    const interval = setInterval(fetchStockPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  const isPositive = stockData.change && !stockData.change.startsWith('-') && stockData.change !== '0.00';

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <img src="https://avatars.mds.yandex.net/get-mpic/11396163/2a00000193b393533194ea9223f19f1638b6/orig" alt="Газпром" />
          </div>
          <div className="logo-text">
            <h1>Газпром Трансгаз Самара</h1>
            <span className="logo-subtitle">Надежность. Качество. Профессионализм</span>
          </div>
        </Link>

        <nav className="nav">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Главная
          </NavLink>
          <NavLink 
            to="/services" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Услуги
          </NavLink>
          <NavLink 
            to="/contacts" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Контакты
          </NavLink>
        </nav>

        <div className="header-actions">
          {/* Кнопка переключения темы */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn" 
            title={isDark ? 'Включить светлую тему' : 'Включить темную тему'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          
          {/* Кнопка личного кабинета */}
          <Link to="/profile" className="profile-link">
            👤 Личный кабинет
          </Link>
        </div>

        {/* Курс акций */}
        <div className="stock-ticker">
          <div className="stock-info">
            <div className="stock-header">
              <div className="stock-title">
                <span className="stock-ticker-name">GAZP</span>
                <span className="stock-exchange">MOEX</span>
              </div>
              <span className="stock-update-time">{stockData.lastUpdate || '--:--:--'}</span>
            </div>
            <div className="stock-values">
              <span className="stock-price">{stockData.price} ₽</span>
              <span className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
                <span className="stock-arrow">{isPositive ? '▲' : '▼'}</span>
                <span className="stock-change-value">{stockData.change}</span>
                <span className="stock-change-percent">({stockData.changePercent}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;