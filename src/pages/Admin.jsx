import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const [datos, setDatos] = useState([]);
  const [tablaActual, setTablaActual] = useState('tabla_fincas');
  const [loading, setLoading] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoRol, setNuevoRol] = useState('Evaluador');
  const [nuevaZona, setNuevaZona] = useState(''); // 1. Nuevo estado para la zona

  const cargarDatos = async (nombreTabla) => {
    setLoading(true);
    setTablaActual(nombreTabla);
    try {
      const { data, error } = await supabase.from(nombreTabla).select('*').order('id', { ascending: true });
      if (error) throw error;
      setDatos(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { cargarDatos('tabla_fincas'); }, []);

  const toggleEstado = async (id, estadoActual) => {
    try {
      await supabase.from(tablaActual).update({ activo: !estadoActual }).eq('id', id);
      setDatos(datos.map(item => item.id === id ? { ...item, activo: !estadoActual } : item));
    } catch (err) { alert(err.message); }
  };

  const agregarRegistro = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    try {
      const nuevoRegistro = { nombre: nuevoNombre.trim(), activo: true };
      
      // 2. Lógica para incluir zona o rol según la tabla
      if (tablaActual === 'tabla_operarios') {
        nuevoRegistro.rol = nuevoRol;
      } else if (tablaActual === 'tabla_fincas') {
        nuevoRegistro.zona = parseInt(nuevaZona) || 0; // Guarda la zona como número
      }

      await supabase.from(tablaActual).insert([nuevoRegistro]);
      setNuevoNombre('');
      setNuevaZona(''); // Limpiar campo zona
      cargarDatos(tablaActual);
    } catch (err) { alert(err.message); }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          marginBottom: '20px', padding: '10px 20px', cursor: 'pointer', 
          borderRadius: '8px', border: '2px solid #2e7d32', 
          background: '#ffffff', 
          color: '#2e7d32',      
          fontWeight: 'bold' 
        }}
      >
        ⬅ Regresar al Inicio
      </button>

      <h1 style={{ color: '#1b5e20', textAlign: 'center' }}>Panel Administrativo Banagro</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['tabla_fincas', 'tabla_operarios', 'table_clon'].map((tab) => (
          <button 
            key={tab}
            onClick={() => cargarDatos(tab)} 
            style={{
              flex: 1, padding: '12px', cursor: 'pointer', border: 'none', borderRadius: '8px',
              background: tablaActual === tab ? '#2e7d32' : '#e0e0e0',
              color: tablaActual === tab ? 'white' : 'black',
              fontWeight: 'bold'
            }}
          >
            {tab === 'tabla_fincas' ? 'Fincas' : tab === 'tabla_operarios' ? 'Operarios' : 'Clones'}
          </button>
        ))}
      </div>

      <form onSubmit={agregarRegistro} style={{ marginBottom: '30px', display: 'flex', gap: '10px', background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <input 
          type="text" placeholder="Nombre..." value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          style={{ flex: 2, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />

        {/* 3. INPUT PARA ZONA (Solo se muestra en Fincas) */}
        {tablaActual === 'tabla_fincas' && (
          <input 
            type="number" placeholder="Zona (1-4)" value={nuevaZona}
            onChange={(e) => setNuevaZona(e.target.value)}
            style={{ width: '100px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        )}

        {tablaActual === 'tabla_operarios' && (
          <select value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value)} style={{ padding: '10px', borderRadius: '5px' }}>
            <option value="Evaluador">Evaluador</option>
            <option value="Agricultor">Agricultor</option>
            <option value="Desmachador">Desmachador</option>
          </select>
        )}
        <button type="submit" style={{ padding: '10px 20px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          + AGREGAR
        </button>
      </form>

      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#2e7d32', color: 'white' }}>
            <tr>
              <th style={cellStyle}>ID</th>
              <th style={cellStyle}>NOMBRE / DETALLES</th>
              <th style={cellStyle}>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={cellStyle}>{item.id}</td>
                <td style={cellStyle}>
                  <span style={{ fontWeight: 'bold', color: '#333' }}>{item.nombre}</span>
                  
                  {/* MOSTRAR ROL */}
                  {item.rol && (
                    <span style={badgeStyle('#e8f5e9', '#1b5e20', '#c8e6c9')}>
                      {item.rol}
                    </span>
                  )}

                  {/* 4. MOSTRAR ZONA (Si existe) */}
                  {item.zona !== undefined && item.zona !== null && tablaActual === 'tabla_fincas' && (
                    <span style={badgeStyle('#e3f2fd', '#0d47a1', '#bbdefb')}>
                      Zona: {item.zona}
                    </span>
                  )}
                </td>
                <td style={cellStyle}>
                  <button 
                    onClick={() => toggleEstado(item.id, item.activo)}
                    style={{
                      padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                      background: item.activo ? '#dcfce7' : '#fee2e2',
                      color: item.activo ? '#166534' : '#991b1b'
                    }}
                  >
                    {item.activo ? 'ACTIVO' : 'INACTIVO'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const cellStyle = { padding: '15px', textAlign: 'left' };

// Estilo reutilizable para las etiquetas (Badges)
const badgeStyle = (bg, color, border) => ({
  marginLeft: '15px', 
  fontSize: '0.8rem', 
  background: bg, 
  color: color,      
  padding: '4px 10px', 
  borderRadius: '15px',
  fontWeight: 'bold',
  border: `1px solid ${border}`,
  display: 'inline-block'
});

export default Admin;