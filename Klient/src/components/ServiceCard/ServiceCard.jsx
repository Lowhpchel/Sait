import { useState } from 'react';
import ServiceModal from '../ServiceModal/ServiceModal';
import './ServiceCard.css';

function ServiceCard({ service }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getFeatures = () => {
    if (!service || !service.features) return [];
    if (Array.isArray(service.features)) return service.features;
    if (typeof service.features === 'string') {
      try {
        const parsed = JSON.parse(service.features);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return service.features
          .replace(/[\[\]"]/g, '')
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }
    }
    return [];
  };

  const features = getFeatures();

  return (
    <>
      <div className="service-card">
        <div className="card-header">
          <span className="card-category">
            {service.category_name || 'Услуга'}
          </span>
          {service.is_popular === 1 && (
            <span className="card-popular">Популярная</span>
          )}
        </div>
        
        <h3 className="card-title">{service.title}</h3>
        <p className="card-description">
          {service.description 
            ? service.description.substring(0, 120) + '...' 
            : 'Описание отсутствует'}
        </p>
        
        {features.length > 0 && (
          <ul className="card-features">
            {features.slice(0, 3).map((feature, index) => (
              <li key={index}>✓ {feature}</li>
            ))}
          </ul>
        )}
        
        <div className="card-footer">
          <div className="card-info">
            <span className="card-price">
              {formatPrice(service.price)} ₽
            </span>
            <span className="card-duration">
              ⏱ {service.duration || 'По договору'}
            </span>
          </div>
          <button 
            className="card-button" 
            onClick={() => setIsModalOpen(true)}
          >
            Подробнее
          </button>
        </div>
      </div>

      <ServiceModal 
        service={service}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default ServiceCard;