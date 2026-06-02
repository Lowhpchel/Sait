import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h3>ООО «Газпром Трансгаз Самара»</h3>
          <p>Транспортировка газа • Обслуживание • Проектирование</p>
        </div>
        <div className="footer-section">
          <h4>Контакты</h4>
          <p>📍 г. Самара, ул. Авроры, д. 120</p>
          <p>📞 +7 (846) 222-33-44</p>
          <p>✉️ office@samara-tr.gazprom.ru</p>
        </div>
        <div className="footer-section">
          <h4>Режим работы</h4>
          <p>🕐 Понедельник - Пятница</p>
          <p>8:00 - 17:00</p>
          <p>Суббота, Воскресенье - выходной</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 ООО «Газпром Трансгаз Самара».</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;