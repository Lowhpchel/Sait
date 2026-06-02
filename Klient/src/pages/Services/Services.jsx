import { useState, useEffect } from 'react';
import { getServices, getCategories } from '../../api/serviceApi';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import './Services.css';

function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const filters = {};
        if (selectedCategory) filters.category = selectedCategory;
        if (searchTerm) filters.search = searchTerm;
        
        const res = await getServices(filters);
        setServices(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
        setLoading(false);
      }
    };
    fetchServices();
  }, [selectedCategory, searchTerm]);

  return (
    <div className="services-page">
      <div className="container">
        <h1>Наши услуги</h1>
        
        {/* Фильтры */}
        <div className="filters">
          <input
            type="text"
            placeholder="🔍 Поиск услуг..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <div className="category-filters">
            <button
              className={`filter-btn ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              Все услуги
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id.toString() ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id.toString())}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Результаты */}
        {loading ? (
          <div className="loading">Загрузка услуг...</div>
        ) : services.length > 0 ? (
          <div className="services-grid">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>Услуги не найдены</p>
            <button onClick={() => { setSelectedCategory(''); setSearchTerm(''); }}>
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Services;