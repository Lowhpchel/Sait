import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addToOrders } from '../../api/orderApi';
import { useNavigate } from 'react-router-dom';
import './ServiceModal.css';

function ServiceModal({ service, isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await addToOrders(service.id, notes);
      if (result.success) {
        setMessage('✅ Услуга успешно добавлена в ваш список!');
        setNotes('');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.message || '❌ Ошибка при добавлении');
      }
    } catch (error) {
      setMessage('❌ Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <span className="modal-category">{service.category_name}</span>
          <h2>{service.title}</h2>
        </div>

        <div className="modal-body">
          <div className="modal-description">
            <h3>Описание услуги</h3>
            <p>{service.full_description || service.description}</p>
          </div>

          <div className="modal-details">
            <div className="detail-item">
              <span className="detail-label">💰 Цена</span>
              <span className="detail-value">{formatPrice(service.price)} ₽</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">⏱ Срок выполнения</span>
              <span className="detail-value">{service.duration || 'По договору'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">📂 Категория</span>
              <span className="detail-value">{service.category_name}</span>
            </div>
          </div>

          {features.length > 0 && (
            <div className="modal-features">
              <h3>Что включено</h3>
              <ul>
                {features.map((feature, index) => (
                  <li key={index}>✅ {feature}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="modal-order-form">
            <h3>📋 Заказать услугу</h3>
            
            {!user ? (
              <div className="auth-required">
                <p>Для заказа услуги необходимо авторизоваться</p>
                <button onClick={() => navigate('/login')} className="btn-auth">
                  🔑 Войти в личный кабинет
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Примечание к заказу (необязательно)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Опишите ваши требования, пожелания по срокам, особые условия..."
                    rows="4"
                  />
                </div>

                {message && (
                  <div className={`form-message ${message.includes('✅') ? 'success' : 'error'}`}>
                    {message}
                  </div>
                )}

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? '⏳ Отправка...' : '📋 Добавить в список заказов'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceModal;