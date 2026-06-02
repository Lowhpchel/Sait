import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Фикс иконок Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapComponent() {
  // Центр карты - Самара
  const center = [53.195873, 50.100193];
  const zoom = 12;

  // Объекты Газпрома в Самаре
  const objects = [
    {
      id: 1,
      name: 'ООО «Газпром Трансгаз Самара»',
      position: [53.195873, 50.100193],
      address: 'г. Самара, ул. Авроры, д. 120',
      type: 'headquarters',
      phone: '+7 (846) 222-33-44'
    },
    {
      id: 2,
      name: 'Газораспределительная станция №1',
      position: [53.2200, 50.1500],
      address: 'г. Самара, ул. Промышленная, 25',
      type: 'grs',
      phone: '+7 (846) 333-44-55'
    },
    {
      id: 3,
      name: 'Компрессорная станция «Самарская»',
      position: [53.1700, 50.0800],
      address: 'г. Самара, пос. Управленческий',
      type: 'compressor',
      phone: '+7 (846) 444-55-66'
    },
    {
      id: 4,
      name: 'Ремонтно-эксплуатационная база',
      position: [53.2100, 50.1200],
      address: 'г. Самара, ул. Заводская, 10',
      type: 'repair',
      phone: '+7 (846) 555-66-77'
    },
    {
      id: 5,
      name: 'Учебный центр',
      position: [53.1900, 50.0900],
      address: 'г. Самара, ул. Учебная, 5',
      type: 'training',
      phone: '+7 (846) 666-77-88'
    }
  ];

  const getIcon = (type) => {
    const icons = {
      headquarters: '🏢',
      grs: '🏭',
      compressor: '⚙️',
      repair: '🔧',
      training: '📚'
    };
    return icons[type] || '📍';
  };

  return (
    <div className="map-section">
      <div className="map-container">
        <h2>🗺️ Наши объекты на карте</h2>
        <div className="map-wrapper">
          <MapContainer 
            center={center} 
            zoom={zoom} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {objects.map(obj => (
              <Marker key={obj.id} position={obj.position}>
                <Popup>
                  <div className="map-popup">
                    <h3>{getIcon(obj.type)} {obj.name}</h3>
                    <p>📍 {obj.address}</p>
                    <p>📞 {obj.phone}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="map-legend">
          <h3>Обозначения:</h3>
          <div className="legend-items">
            <div className="legend-item"><span>🏢</span> Центральный офис</div>
            <div className="legend-item"><span>🏭</span> ГРС</div>
            <div className="legend-item"><span>⚙️</span> Компрессорная станция</div>
            <div className="legend-item"><span>🔧</span> Ремонтная база</div>
            <div className="legend-item"><span>📚</span> Учебный центр</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapComponent;