// src/components/Mapa.jsx
export default function Mapa({ alVolver }) {
  return (
    <div className="section-container">
      <header className="form-header">
        <button className="btn-mini" onClick={alVolver}>⬅ Volver al Menú</button>
        <h2>🗺️ Visor Geográfico (CTM12)</h2>
      </header>

      <div className="form-card">
        <div className="map-placeholder">
          <div className="fake-map">
            <span style={{fontSize: '3rem'}}>📍</span>
            <p>El mapa de la finca se cargará aquí.</p>
            <p><small>Soportando SIRGAS-MAGNA / CTM12</small></p>
          </div>
        </div>
      </div>

      <div className="form-card" style={{textAlign: 'left'}}>
        <h4>Coordenadas del último registro:</h4>
        <ul>
          <li><b>WGS84:</b> Lat: 7.89, Lon: -76.63</li>
          <li><b>CTM12:</b> N: 1.385.420, E: 1.054.210</li>
        </ul>
      </div>
    </div>
  )
}