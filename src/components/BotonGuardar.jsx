import React from 'react';
import { Save, Loader2 } from 'lucide-react'; // Instala lucide-react si no lo tienes

const BotonGuardar = ({ alHacerClic, cargando, texto = "Finalizar Punto" }) => {
  return (
    <button
      onClick={alHacerClic}
      disabled={cargando}
      style={{
        width: '100%',
        padding: '15px',
        backgroundColor: cargando ? '#95a5a6' : '#2e7d32',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: cargando ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        transition: 'all 0.2s'
      }}
    >
      {cargando ? (
        <>
          <Loader2 className="animate-spin" />
          Guardando en Urabá...
        </>
      ) : (
        <>
          <Save size={22} />
          {texto}
        </>
      )}
    </button>
  );
};

export default BotonGuardar;