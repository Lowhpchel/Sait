
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStats, getRequests, updateRequestStatus, deleteRequest, getAdminServices, deleteService, createService, createRequest, getUsers, updateUserRole, toggleUserStatus, deleteUser, createUser } from '../../api/adminApi';
import { getCategories, getServices } from '../../api/serviceApi';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../api/calendarApi';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../api/orderApi';
import './Admin.css';

function Admin() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({ services: 0, requests: 0, newRequests: 0, users: 0 });
  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newService, setNewService] = useState({ category_id: '', title: '', description: '', price: '', duration: '' });
  const [newRequest, setNewRequest] = useState({ service_id: '', client_name: '', company_name: '', email: '', phone: '', message: '' });
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', email: '', role: 'manager' });
  const [newEvent, setNewEvent] = useState({ title: '', event_date: '', event_type: 'other', description: '' });
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    loadData();
    loadCategories();
    loadAllServices();
    loadCalendarEvents();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const promises = [getStats(), getRequests(), getAdminServices()];
      if (isAdmin) promises.push(getUsers());
      const results = await Promise.all(promises);
      if (results[0]?.success) setStats(results[0].data);
      if (results[1]?.success) setRequests(results[1].data);
      if (results[2]?.success) setServices(results[2].data);
      if (isAdmin && results[3]?.success) setUsers(results[3].data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const res = await getCategories();
    if (res?.success) setCategories(res.data);
  };

  const loadAllServices = async () => {
    const res = await getServices();
    if (res?.success) setAllServices(res.data);
  };

  const loadCalendarEvents = async () => {
    const res = await getEvents();
    if (res.success) setCalendarEvents(res.data);
  };

  const loadAllOrders = async () => {
    const res = await getAllOrders();
    if (res.success) setAllOrders(res.data);
  };

  const handleStatusChange = async (id, status) => { await updateRequestStatus(id, status); loadData(); };
  const handleDeleteRequest = async (id) => { if (window.confirm('Удалить заявку?')) { await deleteRequest(id); loadData(); } };
  const handleDeleteService = async (id) => { if (window.confirm('Удалить услугу?')) { await deleteService(id); loadData(); } };
  const handleCreateService = async (e) => { e.preventDefault(); await createService(newService); setNewService({ category_id: '', title: '', description: '', price: '', duration: '' }); loadData(); alert('✅ Услуга создана!'); };
  const handleCreateRequest = async (e) => { e.preventDefault(); if (!newRequest.client_name || !newRequest.email || !newRequest.phone) { alert('Заполните обязательные поля'); return; } await createRequest(newRequest); setNewRequest({ service_id: '', client_name: '', company_name: '', email: '', phone: '', message: '' }); loadData(); alert('✅ Заявка создана!'); };
  const handleCreateUser = async (e) => { e.preventDefault(); if (!newUser.username || !newUser.password || !newUser.full_name) { alert('Заполните обязательные поля'); return; } if (newUser.password.length < 6) { alert('Пароль должен быть не менее 6 символов'); return; } const result = await createUser(newUser); if (result.success) { setNewUser({ username: '', password: '', full_name: '', email: '', role: 'manager' }); loadData(); alert(`✅ Пользователь создан!`); } else { alert('❌ ' + result.message); } };
  const handleRoleChange = async (id, role) => { if (window.confirm(`Изменить роль на "${role}"?`)) { await updateUserRole(id, role); loadData(); } };
  const handleToggleStatus = async (id, currentStatus) => { const action = currentStatus ? 'заблокировать' : 'разблокировать'; if (window.confirm(`${action} пользователя?`)) { await toggleUserStatus(id, !currentStatus); loadData(); } };
  const handleDeleteUser = async (id) => { if (window.confirm('Удалить пользователя?')) { await deleteUser(id); loadData(); } };
  const handleCreateEvent = async (e) => { e.preventDefault(); if (!newEvent.title || !newEvent.event_date) { alert('Название и дата обязательны'); return; } await createEvent(newEvent); setNewEvent({ title: '', event_date: '', event_type: 'other', description: '' }); loadCalendarEvents(); alert('✅ Событие создано!'); };
  const handleUpdateEvent = async (e) => { e.preventDefault(); await updateEvent(editingEvent.id, editingEvent); setEditingEvent(null); loadCalendarEvents(); alert('✅ Событие обновлено!'); };
  const handleDeleteEvent = async (id) => { if (window.confirm('Удалить событие?')) { await deleteEvent(id); loadCalendarEvents(); } };
  const handleOrderStatusChange = async (id, status) => { await updateOrderStatus(id, status); loadAllOrders(); };
  const handleDeleteOrder = async (id) => { if (window.confirm('Удалить заказ? Это действие нельзя отменить!')) { await deleteOrder(id); loadAllOrders(); } };

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return <div className="admin-page"><div className="admin-container"><h1>Доступ запрещен</h1><p>Только для администраторов и менеджеров</p></div></div>;
  }

  if (loading) return <div className="admin-page"><div className="admin-container"><h1>Загрузка...</h1></div></div>;

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>{isAdmin ? '👑' : '👨‍💼'} Панель управления</h1>
          <span className={`role-badge ${user.role}`}>{isAdmin ? 'Администратор' : 'Менеджер'}</span>
        </div>
        
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 Статистика</button>
          <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>📋 Заявки ({requests.length})</button>
          <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>🔧 Услуги ({services.length})</button>
          <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => { setActiveTab('calendar'); loadCalendarEvents(); }}>📅 Календарь ({calendarEvents.length})</button>
          <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => { setActiveTab('orders'); loadAllOrders(); }}>📦 Заказы</button>
          {isAdmin && <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Пользователи ({users.length})</button>}
          <Link to="/analytics" className="tab-btn" style={{ textDecoration: 'none', background: activeTab === 'analytics' ? '#ff9800' : '', color: activeTab === 'analytics' ? 'white' : '' }}>📊 Расширенная аналитика</Link>
        </div>

        {/* Статистика */}
        {activeTab === 'stats' && (
          <div className="stats-grid">
            <div className="stat-card"><span className="stat-value">{stats.services}</span><span className="stat-label">Активных услуг</span></div>
            <div className="stat-card"><span className="stat-value">{stats.requests}</span><span className="stat-label">Всего заявок</span></div>
            <div className="stat-card new"><span className="stat-value">{stats.newRequests}</span><span className="stat-label">Новых заявок</span></div>
            {isAdmin && <div className="stat-card"><span className="stat-value">{stats.users}</span><span className="stat-label">Пользователей</span></div>}
          </div>
        )}

        {/* Заявки */}
        {activeTab === 'requests' && (
          <>
            <div className="create-form">
              <h3>➕ Новая заявка</h3>
              <form onSubmit={handleCreateRequest}>
                <select value={newRequest.service_id} onChange={(e) => setNewRequest({...newRequest, service_id: e.target.value})}><option value="">Выберите услугу</option>{allServices.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
                <input type="text" placeholder="Имя клиента *" value={newRequest.client_name} onChange={(e) => setNewRequest({...newRequest, client_name: e.target.value})} required />
                <input type="text" placeholder="Компания" value={newRequest.company_name} onChange={(e) => setNewRequest({...newRequest, company_name: e.target.value})} />
                <input type="email" placeholder="Email *" value={newRequest.email} onChange={(e) => setNewRequest({...newRequest, email: e.target.value})} required />
                <input type="tel" placeholder="Телефон *" value={newRequest.phone} onChange={(e) => setNewRequest({...newRequest, phone: e.target.value})} required />
                <input type="text" placeholder="Сообщение" value={newRequest.message} onChange={(e) => setNewRequest({...newRequest, message: e.target.value})} />
                <button type="submit" className="btn-create">✅ Добавить заявку</button>
              </form>
            </div>
            <div className="table-container">
              <h3>📋 Все заявки</h3>
              {requests.length === 0 ? <p className="empty-message">Нет заявок</p> : (
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Клиент</th><th>Компания</th><th>Телефон</th><th>Email</th><th>Услуга</th><th>Статус</th><th>Дата</th>{isAdmin && <th>Действия</th>}</tr></thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req.id}>
                        <td>{req.id}</td><td><strong>{req.client_name}</strong></td><td>{req.company_name || '-'}</td><td>{req.phone}</td><td>{req.email}</td><td>{req.service_title || '-'}</td>
                        <td><select value={req.status} onChange={(e) => handleStatusChange(req.id, e.target.value)} className={`status-select status-${req.status}`}><option value="new">🆕 Новая</option><option value="in_progress">⏳ В работе</option><option value="completed">✅ Завершена</option><option value="cancelled">❌ Отменена</option></select></td>
                        <td>{new Date(req.created_at).toLocaleDateString('ru-RU')}</td>
                        {isAdmin && <td><button onClick={() => handleDeleteRequest(req.id)} className="btn-delete">🗑️</button></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Услуги */}
        {activeTab === 'services' && (
          <>
            {isAdmin && (
              <div className="create-form">
                <h3>➕ Новая услуга</h3>
                <form onSubmit={handleCreateService}>
                  <select value={newService.category_id} onChange={(e) => setNewService({...newService, category_id: e.target.value})} required><option value="">Выберите категорию</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}</select>
                  <input type="text" placeholder="Название услуги" value={newService.title} onChange={(e) => setNewService({...newService, title: e.target.value})} required />
                  <input type="text" placeholder="Краткое описание" value={newService.description} onChange={(e) => setNewService({...newService, description: e.target.value})} required />
                  <input type="number" placeholder="Цена (₽)" value={newService.price} onChange={(e) => setNewService({...newService, price: e.target.value})} required />
                  <input type="text" placeholder="Срок выполнения" value={newService.duration} onChange={(e) => setNewService({...newService, duration: e.target.value})} />
                  <button type="submit" className="btn-create">✅ Добавить услугу</button>
                </form>
              </div>
            )}
            <div className="table-container">
              <h3>📋 Все услуги</h3>
              {services.length === 0 ? <p className="empty-message">Нет услуг</p> : (
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Название</th><th>Категория</th><th>Цена</th><th>Срок</th><th>Статус</th>{isAdmin && <th>Действия</th>}</tr></thead>
                  <tbody>
                    {services.map(s => (
                      <tr key={s.id}>
                        <td>{s.id}</td><td><strong>{s.title}</strong></td><td>{s.category_name}</td><td>{parseInt(s.price).toLocaleString()} ₽</td><td>{s.duration || '-'}</td><td>{s.is_active ? '✅ Активна' : '❌ Неактивна'}</td>
                        {isAdmin && <td><button onClick={() => handleDeleteService(s.id)} className="btn-delete">🗑️</button></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Календарь */}
        {activeTab === 'calendar' && (
          <>
            <div className="create-form">
              <h3>{editingEvent ? '✏️ Редактировать событие' : '➕ Новое событие'}</h3>
              <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}>
                <input type="text" placeholder="Название события *" value={editingEvent ? editingEvent.title : newEvent.title} onChange={(e) => editingEvent ? setEditingEvent({...editingEvent, title: e.target.value}) : setNewEvent({...newEvent, title: e.target.value})} required />
                <input type="date" value={editingEvent ? editingEvent.event_date?.split('T')[0] : newEvent.event_date} onChange={(e) => editingEvent ? setEditingEvent({...editingEvent, event_date: e.target.value}) : setNewEvent({...newEvent, event_date: e.target.value})} required />
                <select value={editingEvent ? editingEvent.event_type : newEvent.event_type} onChange={(e) => editingEvent ? setEditingEvent({...editingEvent, event_type: e.target.value}) : setNewEvent({...newEvent, event_type: e.target.value})}>
                  <option value="maintenance">🔧 Техобслуживание</option><option value="launch">🚀 Запуск</option><option value="training">📚 Обучение</option><option value="inspection">🔍 Проверка</option><option value="meeting">👥 Совещание</option><option value="diagnostic">⚙️ Диагностика</option><option value="other">📌 Другое</option>
                </select>
                <input type="text" placeholder="Описание" value={editingEvent ? editingEvent.description || '' : newEvent.description} onChange={(e) => editingEvent ? setEditingEvent({...editingEvent, description: e.target.value}) : setNewEvent({...newEvent, description: e.target.value})} />
                <button type="submit" className="btn-create">{editingEvent ? '✅ Сохранить' : '✅ Создать событие'}</button>
                {editingEvent && <button type="button" onClick={() => setEditingEvent(null)} className="btn-cancel">❌ Отмена</button>}
              </form>
            </div>
            <div className="table-container">
              <h3>📋 Все события</h3>
              {calendarEvents.length === 0 ? <p className="empty-message">Нет событий</p> : (
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Название</th><th>Дата</th><th>Тип</th><th>Описание</th><th>Действия</th></tr></thead>
                  <tbody>
                    {calendarEvents.map(event => (
                      <tr key={event.id}>
                        <td>{event.id}</td><td><strong>{event.title}</strong></td><td>{new Date(event.event_date).toLocaleDateString('ru-RU')}</td>
                        <td><span className={`event-type-badge event-${event.event_type}`}>{event.event_type === 'maintenance' && '🔧 Техобслуживание'}{event.event_type === 'launch' && '🚀 Запуск'}{event.event_type === 'training' && '📚 Обучение'}{event.event_type === 'inspection' && '🔍 Проверка'}{event.event_type === 'meeting' && '👥 Совещание'}{event.event_type === 'diagnostic' && '⚙️ Диагностика'}{event.event_type === 'other' && '📌 Другое'}</span></td>
                        <td>{event.description || '-'}</td>
                        <td><button onClick={() => setEditingEvent(event)} className="btn-edit">✏️</button> <button onClick={() => handleDeleteEvent(event.id)} className="btn-delete">🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Заказы */}
        {activeTab === 'orders' && (
          <div className="table-container">
            <h3>📦 Заказы пользователей</h3>
            {allOrders.length === 0 ? <p className="empty-message">Нет заказов</p> : (
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Пользователь</th><th>Email</th><th>Услуга</th><th>Цена</th><th>Примечание</th><th>Статус</th><th>Дата</th><th>Действия</th></tr></thead>
                <tbody>
                  {allOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td><td><strong>{order.full_name || order.username}</strong></td><td>{order.user_email}</td><td>{order.service_title}</td><td>{parseInt(order.service_price).toLocaleString()} ₽</td><td>{order.notes || '-'}</td>
                      <td><select value={order.status} onChange={(e) => handleOrderStatusChange(order.id, e.target.value)} className={`status-select status-${order.status}`}><option value="pending">⏳ На рассмотрении</option><option value="approved">✅ Одобрено</option><option value="rejected">❌ Отклонено</option><option value="completed">🎉 Выполнено</option></select></td>
                      <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                      <td><button onClick={() => handleDeleteOrder(order.id)} className="btn-delete" title="Удалить заказ">🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Пользователи */}
        {activeTab === 'users' && isAdmin && (
          <>
            <div className="create-form">
              <h3>➕ Новый пользователь</h3>
              <form onSubmit={handleCreateUser}>
                <input type="text" placeholder="Логин *" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} required />
                <input type="password" placeholder="Пароль * (мин. 6 символов)" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} required />
                <input type="text" placeholder="ФИО *" value={newUser.full_name} onChange={(e) => setNewUser({...newUser, full_name: e.target.value})} required />
                <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}><option value="admin">👑 Администратор</option><option value="manager">👨‍💼 Менеджер</option><option value="employee">👷 Сотрудник</option></select>
                <button type="submit" className="btn-create">✅ Создать пользователя</button>
              </form>
            </div>
            <div className="table-container">
              <h3>👥 Все пользователи</h3>
              {users.length === 0 ? <p className="empty-message">Нет пользователей</p> : (
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Логин</th><th>ФИО</th><th>Email</th><th>Роль</th><th>Статус</th><th>Последний вход</th><th>Действия</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className={!u.is_active ? 'inactive-user' : ''}>
                        <td>{u.id}</td><td><strong>{u.username}</strong></td><td>{u.full_name}</td><td>{u.email || '-'}</td>
                        <td><select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className={`role-select role-${u.role}`} disabled={u.id === user.id}><option value="admin">👑 Админ</option><option value="manager">👨‍💼 Менеджер</option><option value="employee">👷 Сотрудник</option></select></td>
                        <td><button onClick={() => handleToggleStatus(u.id, u.is_active)} className={`status-btn ${u.is_active ? 'active' : 'blocked'}`} disabled={u.id === user.id}>{u.is_active ? '✅ Активен' : '🚫 Заблокирован'}</button></td>
                        <td>{u.last_login ? new Date(u.last_login).toLocaleString('ru-RU') : 'Ни разу'}</td>
                        <td><button onClick={() => handleDeleteUser(u.id)} className="btn-delete" disabled={u.id === user.id}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;