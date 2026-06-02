import { useState } from 'react';
import { submitRequest } from '../../api/serviceApi';
import './Contacts.css';

function Contacts() {
  const [formData, setFormData] = useState({
    client_name: '',
    company_name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Отправка...' });

    try {
      await submitRequest(formData);
      setStatus({ type: 'success', message: '✅ Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.' });
      setFormData({
        client_name: '',
        company_name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      setStatus({ type: 'error', message: '❌ Ошибка отправки. Пожалуйста, попробуйте позже.' });
    }
  };

  return (
    <div className="contacts-page">
      <div className="container">
        <h1>Контакты</h1>
        
        <div className="contacts-content">
          {/* Контактная информация */}
          <div className="contacts-info">
            <div className="info-card">
              <h3>📞 Телефон</h3>
              <p>+7 (846) 222-33-44</p>
            </div>
            
            <div className="info-card">
              <h3>✉️ Email</h3>
              <p>office@samara-tr.gazprom.ru</p>
            </div>
            
            <div className="info-card">
              <h3>📍 Адрес</h3>
              <p>г. Самара, ул. Авроры, д. 120</p>
            </div>
            
            <div className="info-card">
              <h3>🕐 Режим работы</h3>
              <p>Пн-Пт: 8:00 - 17:00</p>
              <p>Сб-Вс: выходной</p>
            </div>
          </div>

          {/* Форма обратной связи */}
          <div className="contacts-form">
            <h2>Оставить заявку</h2>
            
            {status.message && (
              <div className={`status-message ${status.type}`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Ваше имя *</label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  required
                  placeholder="Иванов Иван Иванович"
                />
              </div>

              <div className="form-group">
                <label>Компания</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="ООО «Название компании»"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="example@mail.ru"
                />
              </div>

              <div className="form-group">
                <label>Телефон *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>

              <div className="form-group">
                <label>Сообщение</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Опишите ваш вопрос или интересующую услугу..."
                />
              </div>

              <button type="submit" className="submit-btn">
                Отправить заявку
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contacts;