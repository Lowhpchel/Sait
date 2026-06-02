import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPopularServices, getCategories } from '../../api/serviceApi.js';
import ServiceCard from '../../components/ServiceCard/ServiceCard.jsx';
import MapComponent from '../../components/Map/Map';
import CalendarWidget from '../../components/Calendar/CalendarWidget';
import './Home.css';

function Home() {
  const [popularServices, setPopularServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [popularRes, categoriesRes] = await Promise.all([
          getPopularServices(),
          getCategories()
        ]);
        
        console.log('📦 Ответ категорий:', categoriesRes);
        console.log('⭐ Ответ популярных:', popularRes);
        
        if (popularRes && popularRes.success) {
          setPopularServices(popularRes.data || []);
        }
        
        if (categoriesRes && categoriesRes.success) {
          setCategories(categoriesRes.data || []);
        }
      } catch (err) {
        console.error('❌ Ошибка:', err);
        setError('Не удалось загрузить данные с сервера');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home">
      {/* Hero секция */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>ООО «Газпром Трансгаз Самара»</h1>
            <p className="hero-subtitle">
              Надежная транспортировка газа, профессиональное обслуживание 
              и проектирование газотранспортных систем
            </p>
            <div className="hero-buttons">
              <Link to="/services" className="btn btn-primary">Наши услуги</Link>
              <Link to="/contacts" className="btn btn-secondary">Связаться с нами</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ошибка */}
      {error && (
        <div className="container" style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}
          >
            Попробовать снова
          </button>
        </div>
      )}

      {/* Загрузка */}
      {loading && !error && (
        <div className="container" style={{ padding: '60px', textAlign: 'center' }}>
          <p>Загрузка данных...</p>
        </div>
      )}

      {/* Основной контент */}
      {!loading && !error && (
        <>
          {/* Категории */}
          {categories.length > 0 && (
            <section className="categories">
              <div className="container">
                <h2>Направления деятельности</h2>
                <div className="categories-grid">
                  {categories.map(category => (
                    <div key={category.id} className="category-card">
                      <div className="category-icon">{category.icon || '🔷'}</div>
                      <h3>{category.name}</h3>
                      <p>{category.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Популярные услуги */}
          <section className="popular-services">
            <div className="container">
              <h2>Популярные услуги</h2>
              {popularServices.length > 0 ? (
                <div className="services-grid">
                  {popularServices.map(service => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center' }}>Популярные услуги временно недоступны</p>
              )}
              <div className="center-button">
                <Link to="/services" className="btn btn-outline">Все услуги →</Link>
              </div>
            </div>
          </section>

          {/* Календарь событий */}
          <CalendarWidget />

          {/* Интерактивная карта */}
          <MapComponent />

          {/* Преимущества */}
          <section className="advantages">
            <div className="container">
              <h2>Почему выбирают нас</h2>
              <div className="advantages-grid">
                <div className="advantage-card">
                  <div className="advantage-icon">⚡</div>
                  <h3>Оперативность</h3>
                  <p>Быстрое реагирование на запросы и выполнение работ в срок</p>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">🛡️</div>
                  <h3>Надежность</h3>
                  <p>Гарантия качества всех выполняемых работ и услуг</p>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">💡</div>
                  <h3>Инновации</h3>
                  <p>Использование современных технологий и оборудования</p>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">🤝</div>
                  <h3>Опыт</h3>
                  <p>Многолетний опыт работы в газовой отрасли</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Home;