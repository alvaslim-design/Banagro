import React from 'react';

const CirculoMuestreo = ({ plantas }) => {
  // Cálculo: Cada planta en un radio de 8m equivale a 50 plantas por hectárea
  const densidad = plantas * 50;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '20px 0',
      padding: '20px',
      background: '#fff',
      borderRadius: '15px',
      border: '1px dashed #2e7d32'
    }}>
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        border: '4px double #2e7d32',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e8f5e9',
        position: 'relative',
        marginBottom: '15px'
      }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1b5e20' }}>{plantas}</span>
        <span style={{ fontSize: '10px', color: '#4caf50' }}>PLANTAS</span>
        
        {/* Indicador de radio */}
        <div style={{
          position: 'absolute',
          width: '50%',
          height: '2px',
          background: '#2e7d32',
          right: '5px',
          top: '50%'
        }}>
          <span style={{ fontSize: '8px', position: 'absolute', top: '-12px', right: '0' }}>r=8m</span>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Proyección de Densidad:</p>
        <h3 style={{ margin: 0, color: '#2e7d32', fontSize: '22px' }}>
          {densidad.toLocaleString()} <small style={{ fontSize: '12px' }}>pl/ha</small>
        </h3>
      </div>
    </div>
  );
};

export default CirculoMuestreo;