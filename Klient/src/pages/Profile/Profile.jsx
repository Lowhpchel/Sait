
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <h1>Доступ запрещен</h1>
          <p>Необходимо авторизоваться</p>
          <Link to="/login" className="profile-btn">Войти</Link>
        </div>
      </div>
    );
  }

  const getRoleName = (role) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      case 'employee': return 'Сотрудник';
      default: return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'manager': return '👨‍💼';
      case 'employee': return '👷';
      default: return '👤';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin': return 'Полный доступ ко всем функциям системы';
      case 'manager': return 'Управление заявками и просмотр статистики';
      case 'employee': return 'Базовый доступ к информации';
      default: return '';
    }
  };

  const canAccessAdmin = user.role === 'admin' || user.role === 'manager';

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {getRoleIcon(user.role)}
          </div>
          <h1>{user.full_name || user.username}</h1>
          <span className={`profile-role role-${user.role}`}>
            {getRoleIcon(user.role)} {getRoleName(user.role)}
          </span>
          <p className="role-description">{getRoleDescription(user.role)}</p>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <span className="info-label">Логин</span>
            <span className="info-value">{user.username}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{user.email || 'Не указан'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Роль</span>
            <span className={`info-value role-text-${user.role}`}>
              {getRoleIcon(user.role)} {getRoleName(user.role)}
            </span>
          </div>
          {user.last_login && (
            <div className="info-item">
              <span className="info-label">Последний вход</span>
              <span className="info-value">
                {new Date(user.last_login).toLocaleString('ru-RU')}
              </span>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <Link to="/services" className="profile-btn">🔧 Услуги компании</Link>

          
          {canAccessAdmin && (
            <>
              <Link to="/analytics" className="profile-btn" style={{ background: 'linear-gradient(135deg, #ff9800, #f57c00)' }}>
                📊 Аналитика
              </Link>
              <Link to="/admin" className="profile-btn admin-btn">
                {user.role === 'admin' ? '👑 Панель администратора' : '📊 Панель управления'}
              </Link>
            </>
          )}
          
          <button onClick={handleLogout} className="profile-btn logout-btn">
            🚪 Выйти
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;