import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getEvents } from '../../api/calendarApi';
import './CalendarWidget.css';

function CalendarWidget() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await getEvents();
      if (res.success) {
        // Преобразуем даты в строки YYYY-MM-DD
        const formattedEvents = res.data.map(event => ({
          ...event,
          date: event.event_date.split('T')[0]
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (newDate) => {
    setDate(newDate);
    const dateStr = newDate.toISOString().split('T')[0];
    const dayEvents = events.filter(event => event.date === dateStr);
    setSelectedEvents(dayEvents);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = events.filter(event => event.date === dateStr);
      
      if (dayEvents.length > 0) {
        return (
          <div className="event-dots">
            {dayEvents.slice(0, 3).map((event, index) => (
              <span key={index} className={`dot dot-${event.event_type}`}></span>
            ))}
            {dayEvents.length > 3 && <span className="dot-more">+</span>}
          </div>
        );
      }
    }
  };

  const getEventTypeName = (type) => {
    const types = {
      maintenance: '🔧 Техобслуживание',
      launch: '🚀 Запуск',
      training: '📚 Обучение',
      inspection: '🔍 Проверка',
      meeting: '👥 Совещание',
      diagnostic: '⚙️ Диагностика',
      other: '📌 Событие'
    };
    return types[type] || '📌 Событие';
  };

  if (loading) {
    return (
      <div className="calendar-section">
        <div className="calendar-container">
          <h2>📅 Календарь событий</h2>
          <p style={{ textAlign: 'center' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-section">
      <div className="calendar-container">
        <h2>📅 Календарь событий</h2>
        
        <div className="calendar-content">
          <div className="calendar-wrapper">
            <Calendar
              onChange={onDateChange}
              value={date}
              tileContent={tileContent}
              locale="ru-RU"
            />
          </div>
          
          <div className="events-panel">
            <h3>
              События на {date.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </h3>
            
            {selectedEvents.length > 0 ? (
              <div className="events-list">
                {selectedEvents.map((event, index) => (
                  <div key={index} className={`event-card event-${event.event_type}`}>
                    <div className="event-icon">
                      {getEventTypeName(event.event_type).split(' ')[0]}
                    </div>
                    <div className="event-info">
                      <h4>{event.title}</h4>
                      <span className="event-type">{getEventTypeName(event.event_type)}</span>
                      {event.description && <p className="event-desc">{event.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-events">Нет событий на эту дату</p>
            )}
            
            <div className="upcoming-events">
              <h3>Ближайшие события</h3>
              <div className="events-list">
                {events
                  .filter(event => new Date(event.date) >= new Date(new Date().setHours(0,0,0,0)))
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 3)
                  .map((event, index) => (
                    <div key={index} className={`event-card-small event-${event.event_type}`}>
                      <span className="event-date">
                        {new Date(event.date).toLocaleDateString('ru-RU', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                      <span className="event-title-small">{event.title}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarWidget;