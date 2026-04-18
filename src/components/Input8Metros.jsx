import React from 'react';

const Input8Metros = ({ etiqueta, valor, alCambiar, placeholder, tipo = "number", esSelect = false, children }) => {
  
  // Estilos compartidos para input y select
  const estiloBase = {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '10px',
    border: '2px solid #e0e0e0',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    backgroundColor: '#ffffff',
    color: '#333',
    appearance: esSelect ? 'auto' : 'none' // Asegura que la flecha del select se vea
  };

  // Funciones para efectos visuales (Verde Banagro)
  const handleFocus = (e) => {
    e.target.style.borderColor = '#2e7d32';
    e.target.style.boxShadow = '0 0 8px rgba(46, 125, 50, 0.2)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '#e0e0e0';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ marginBottom: '15px', width: '100%' }}>
      {/* Etiqueta del campo */}
      <label style={{ 
        display: 'block', 
        marginBottom: '8px', 
        fontWeight: 'bold', 
        color: '#1b5e20', 
        fontSize: '14px' 
      }}>
        {etiqueta}
      </label>

      {/* Condicional: Si esSelect es true, renderiza un select. Si no, un input. */}
      {esSelect ? (
        <select
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          style={estiloBase}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required
        >
          {children}
        </select>
      ) : (
        <input
          type={tipo === "number" ? "text" : tipo}
          inputMode={tipo === "number" ? "decimal" : "text"}
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          placeholder={placeholder}
          style={estiloBase}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required
        />
      )}
    </div>
  );
};

export default Input8Metros;