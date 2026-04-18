import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../api/supabaseClient';
import { useNavigate } from 'react-router-dom'; // Para el botón de regresar
import * as XLSX from 'xlsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reportes = () => {
  const navigate = useNavigate(); // Hook para navegación
  const [datos, setDatos] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [filtroFinca, setFiltroFinca] = useState('');
  const [vistaActiva, setVistaActiva] = useState('vista_detalle_absoluta');
  const [loading, setLoading] = useState(false);

  // 1. CARGAR LISTA DE FINCAS Y DATOS
  useEffect(() => {
    const cargarTodo = async () => {
      setLoading(true);
      const { data: f } = await supabase.from('tabla_fincas').select('nombre').eq('activo', true);
      const { data: d } = await supabase.from(vistaActiva).select('*').order('semana', { ascending: true });
      setFincas(f || []);
      setDatos(d || []);
      setLoading(false);
    };
    cargarTodo();
  }, [vistaActiva]);

  // 2. LÓGICA DEL GRÁFICO: Agrupar por semana y sacar promedio
  const dataGrafico = useMemo(() => {
    const filtrados = filtroFinca ? datos.filter(d => d.finca === filtroFinca) : datos;
    
    const agrupar = filtrados.reduce((acc, curr) => {
      const sem = `Sem ${curr.semana}`;
      if (!acc[sem]) acc[sem] = { semana: sem, suma: 0, cuenta: 0 };
      
      const valor = vistaActiva === 'vista_detalle_agricola' ? curr.agri_calidad_pct : 
                    vistaActiva === 'vista_detalle_desmache' ? curr.desm_calidad_pct : 
                    curr.plantas_ha / 20;

      acc[sem].suma += (valor || 0);
      acc[sem].cuenta += 1;
      return acc;
    }, {});

    return Object.values(agrupar).map(v => ({
      semana: v.semana,
      Promedio: Math.round(v.suma / v.cuenta)
    })).slice(-6); 
  }, [datos, filtroFinca, vistaActiva]);

  const datosFiltrados = datos.filter(item => filtroFinca === '' || item.finca === filtroFinca);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      
      {/* BOTÓN REGRESAR */}
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', 
          borderRadius: '8px', border: '2px solid #2e7d32', 
          background: '#fff', color: '#2e7d32', fontWeight: 'bold' 
        }}
      >
        ⬅ Volver al Menú
      </button>

      <h1 style={{ color: '#1b5e20', marginBottom: '20px' }}>📊 Inteligencia de Datos Banagro</h1>

      {/* --- SECCIÓN DEL GRÁFICO --- */}
      <div style={{ 
        background: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '20px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: '250px' 
      }}>
        <h3 style={{ marginTop: 0, fontSize: '14px', color: '#666' }}>
          Tendencia de Calidad: {filtroFinca || 'Todas las Fincas'} (Últimas semanas)
        </h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={dataGrafico}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            {/* EJE X: Muestra las etiquetas de las semanas */}
            <XAxis 
              dataKey="semana" 
              fontSize={12} 
              tick={{fill: '#666'}} 
              axisLine={{stroke: '#ccc'}} 
            />
            <YAxis domain={[0, 100]} fontSize={12} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="Promedio" 
              stroke="#2e7d32" 
              strokeWidth={3} 
              dot={{ r: 6, fill: '#2e7d32', strokeWidth: 2, stroke: '#fff' }} 
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* BOTONES DE VISTA */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
        {[
          { id: 'vista_detalle_absoluta', label: '🌍 Absoluto' },
          { id: 'vista_detalle_agricola', label: '🌱 Agricultura' },
          { id: 'vista_detalle_cosecha', label: '🍌 Cosecha' },
          { id: 'vista_detalle_desmache', label: '✂️ Desmache' }
        ].map(v => (
          <button 
            key={v.id} 
            onClick={() => setVistaActiva(v.id)}
            style={{
              padding: '10px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              backgroundColor: vistaActiva === v.id ? '#2e7d32' : '#fff',
              color: vistaActiva === v.id ? '#fff' : '#333',
              fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              whiteSpace: 'nowrap'
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* FILTROS Y EXPORTACIÓN */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <select 
          value={filtroFinca} 
          onChange={(e) => setFiltroFinca(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
        >
          <option value="">-- Todas las Fincas --</option>
          {fincas.map((f, i) => <option key={i} value={f.nombre}>{f.nombre}</option>)}
        </select>
        
        <button 
          onClick={() => {
            const ws = XLSX.utils.json_to_sheet(datosFiltrados);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Datos");
            XLSX.writeFile(wb, `Reporte_Banagro_${vistaActiva}.xlsx`);
          }}
          style={{ padding: '10px 20px', background: '#1b5e20', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          📥 Descargar Excel
        </button>
      </div>

      {/* TABLA */}
      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#2e7d32', color: '#fff' }}>
            <tr>
              <th style={pStyle}>Finca</th>
              <th style={pStyle}>Lote</th>
              <th style={pStyle}>Semana</th>
              <th style={pStyle}>Calidad/Dato</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Cargando datos de Urabá...</td></tr>
            ) : datosFiltrados.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No hay registros encontrados.</td></tr>
            ) : (
              datosFiltrados.slice(0, 20).map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={pStyle}><b>{item.finca}</b></td>
                  <td style={pStyle}>{item.lote}</td>
                  <td style={pStyle}>{item.semana}</td>
                  <td style={pStyle}>
                    {vistaActiva === 'vista_detalle_agricola' ? `${item.agri_calidad_pct}%` : 
                     vistaActiva === 'vista_detalle_cosecha' ? `${item.plantas_ha} pl/ha` : 
                     `${item.desm_calidad_pct}%`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const pStyle = { padding: '12px', textAlign: 'left', fontSize: '14px' };

export default Reportes;