import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
 ResponsiveContainer, Cell, LabelList, Legend 
} from 'recharts';

const ReportesBanagro = () => {
  const navigate = useNavigate();
  const [datos, setDatos] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [filtroFinca, setFiltroFinca] = useState('');
  const [filtroLote, setFiltroLote] = useState('');
  const [variableActiva, setVariableActiva] = useState('repo_evaluacion_agricultura');
  const [loading, setLoading] = useState(false);

  // Estados Auditoría
  const [busquedaSemana, setBusquedaSemana] = useState('');
  const [busquedaLote, setBusquedaLote] = useState('');
  const [busquedaFinca, setBusquedaFinca] = useState('');
  const [busquedaAnio, setBusquedaAnio] = useState(new Date().getFullYear().toString());

  // Estados para filtros del Resumen General
  const [resumenFiltroFinca, setResumenFiltroFinca] = useState('');
  const [resumenFiltroLote, setResumenFiltroLote] = useState('');
  const [resumenFiltroSemana, setResumenFiltroSemana] = useState('');
  const [resumenFiltroAnio, setResumenFiltroAnio] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('reporte_consolidado_lote')
          .select('*')
          .order('semana', { ascending: true });

        if (error) throw error;

        setDatos(data || []);
        const listaFincas = [...new Set((data || []).map(d => d.finca))].filter(Boolean).sort();
        setFincas(listaFincas);
      } catch (err) {
        console.error("Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const opcionesFiltros = useMemo(() => {
    const obtenerLotes = (f, a) => [...new Set(datos.filter(d => (!f || d.finca === f) && (!a || String(d.anio) === a)).map(d => String(d.lote)))].sort((a,b) => a-b);
    const obtenerSemanas = (f, a, l) => [...new Set(datos.filter(d => (!f || d.finca === f) && (!a || String(d.anio) === a) && (!l || String(d.lote) === l)).map(d => String(d.semana)))].sort((a,b) => a-b);
    return { obtenerLotes, obtenerSemanas };
  }, [datos]);

  const datosConsolidados = useMemo(() => {
    if (!datos.length) return [];
    const agrupado = datos.reduce((acc, curr) => {
      const f = String(curr.finca || '').trim();
      const l = String(curr.lote || '').trim();
      const s = curr.semana;
      const a = curr.anio; 
      const llave = `${f}-${l}-${s}-${a}`;
      const valorNumerico = parseFloat(curr[variableActiva]) || 0;

      if (!acc[llave]) {
        acc[llave] = { ...curr, sumaVar: valorNumerico, cuenta: 1 };
      } else {
        acc[llave].sumaVar += valorNumerico;
        acc[llave].cuenta += 1;
      }
      return acc;
    }, {});

    return Object.values(agrupado).map(item => ({
      ...item,
      promedio: Number((item.sumaVar / item.cuenta).toFixed(3))
    }));
  }, [datos, variableActiva]);

  const dataGrafico = useMemo(() => {
    if (!filtroFinca || !filtroLote) return [];
    const filtrados = datosConsolidados.filter(d => 
      String(d.finca).toLowerCase() === filtroFinca.toLowerCase() && 
      String(d.lote).toLowerCase() === filtroLote.toLowerCase()
    );
    return filtrados.sort((a, b) => a.semana - b.semana).slice(-2).map(d => ({
        name: `Semana ${d.semana}`,
        valor: d.promedio
    }));
  }, [datosConsolidados, filtroFinca, filtroLote]);

  const datosResumenFiltrados = useMemo(() => {
    if (resumenFiltroFinca === '' && resumenFiltroLote === '') return [];

    return datos.filter(item => {
      const matchFinca = resumenFiltroFinca === '' || item.finca === resumenFiltroFinca;
      const matchLote = resumenFiltroLote === '' || String(item.lote) === resumenFiltroLote;
      const matchSemana = resumenFiltroSemana === '' || String(item.semana) === resumenFiltroSemana;
      const matchAnio = resumenFiltroAnio === '' || String(item.anio) === resumenFiltroAnio;
      return matchFinca && matchLote && matchSemana && matchAnio;
    }).slice().reverse();
  }, [datos, resumenFiltroFinca, resumenFiltroLote, resumenFiltroSemana, resumenFiltroAnio]);

  const resumenFichaVertical = useMemo(() => {
    if (datosResumenFiltrados.length === 0) return null;

    const total = datosResumenFiltrados.length;
    const todasLasObservaciones = [...new Set(datosResumenFiltrados
      .map(d => d.observaciones_operador?.trim())
      .filter(obs => obs && obs !== "" && obs !== "Sin observaciones registradas.")
    )];

    const sumas = datosResumenFiltrados.reduce((acc, curr) => {
      acc.agri += parseFloat(curr.repo_evaluacion_agricultura || 0);
      acc.desm += parseFloat(curr.repo_evaluacion_desmache || 0);
      acc.eval += parseInt(curr.repo_plantas_evaluadas || 0);
      acc.dens += parseFloat(curr.promedio_pl_ha || 0);
      acc.ret += parseFloat(curr.repo_promedio_retorno_altura || 0);
      acc.circ += parseFloat(curr.repo_promedio_circunferencia || 0);
      acc.area += parseFloat(curr.area_ha || 0);
      acc.pParidas += parseFloat(curr.porcentaje_plantas_paridas || 0);
      acc.pCosech += parseFloat(curr.porcentaje_plantas_cosechadas || 0);
      acc.pJoven += parseFloat(curr.porcentaje_pantas_jovenes || 0);
      acc.pProntas += parseFloat(curr.porcentaje_plantas_prontas || 0);
      acc.pResiemb += parseFloat(curr.porcentaje_resiembras || 0);
      acc.pRecup += parseFloat(curr.porcentaje_planta_a_recuperar || 0);
      acc.pHuerf += parseFloat(curr.porcentaje_plantas_huerfanas || 0);
      acc.pImprod += parseFloat(curr.porcentaje_plantas_improductivas || 0);
      return acc;
    }, { agri: 0, desm: 0, eval: 0, dens: 0, ret: 0, circ: 0, area: 0, pParidas: 0, pCosech: 0, pJoven: 0, pProntas: 0, pResiemb: 0, pRecup: 0, pHuerf: 0, pImprod: 0 });

    return {
      count: total,
      finca: datosResumenFiltrados[0].finca,
      lote: datosResumenFiltrados[0].lote,
      semana: datosResumenFiltrados[0].semana,
      anio: datosResumenFiltrados[0].anio,
      agricultor: datosResumenFiltrados[0].nombre_agricultor,
      desmachador: datosResumenFiltrados[0].nombre_desmachador,
      area: sumas.area / total,
      listaObservaciones: todasLasObservaciones,
      promedios: {
        agri: sumas.agri / total,
        desm: sumas.desm / total,
        eval: sumas.eval, 
        dens: sumas.dens / total,
        ret: sumas.ret / total,
        circ: sumas.circ / total,
        paridas: sumas.pParidas / total,
        cosech: sumas.pCosech / total,
        joven: sumas.pJoven / total,
        prontas: sumas.pProntas / total,
        resiemb: sumas.pResiemb / total,
        recup: sumas.pRecup / total,
        huerf: sumas.pHuerf / total,
        improd: sumas.pImprod / total,
      }
    };
  }, [datosResumenFiltrados]);

  // AJUSTE AQUÍ: Ocultar registros hasta que se filtre por Finca o Lote
  const datosAuditoria = useMemo(() => {
    if (busquedaFinca === '' && busquedaLote === '') return [];

    return datos.filter(item => {
      const cFinca = busquedaFinca === '' || item.finca === busquedaFinca;
      const cSemana = busquedaSemana === '' || String(item.semana) === busquedaSemana;
      const cLote = busquedaLote === '' || String(item.lote) === busquedaLote;
      const cAnio = busquedaAnio === '' || String(item.anio) === busquedaAnio;
      return cFinca && cSemana && cLote && cAnio;
    }).reverse();
  }, [datos, busquedaSemana, busquedaLote, busquedaFinca, busquedaAnio]);

  const lotesDisponibles = useMemo(() => {
    if (!filtroFinca) return [];
    return [...new Set(datos.filter(d => d.finca === filtroFinca).map(d => String(d.lote).trim()))].sort((a,b) => a-b);
  }, [datos, filtroFinca]);

  const descargarExcel = () => {
    const dataFiltrada = datosConsolidados.filter(d => filtroFinca === '' || d.finca === filtroFinca);
    const ws = XLSX.utils.json_to_sheet(dataFiltrada);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte_Lotes");
    XLSX.writeFile(wb, `Banagro_Export_${filtroFinca || 'General'}.xlsx`);
  };

  const descargarReporteDetallado = async (item) => {
    setLoading(true);
    try {
      const tablas = [
        'reporte_consolidado_lote',
        'vista_detalle_agricola',
        'vista_detalle_cosecha',
        'vista_detalle_desmache',
        'vista_maestra_absoluta'
      ];

      const wb = XLSX.utils.book_new();

      for (const tabla of tablas) {
        let query = supabase.from(tabla).select('*');
        
        // Ajuste para vista_maestra_absoluta y reporte_consolidado
        if (tabla === 'vista_maestra_absoluta') {
          query = query.eq('finca', item.finca)
                       .eq('lote', item.lote)
                       .eq('semana', item.semana)
                       .eq('anio', item.anio)
                       .eq('punto_muestreo', item.puntos_muestreados);
        } else if (tabla === 'reporte_consolidado_lote') {
          query = query.eq('id', item.id);
        } else {
          query = query.eq('maestra_id', item.id);
        }

        const { data } = await query;
        
        if (data && data.length > 0) {
          const ws = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(wb, ws, tabla.substring(0, 31));
        }
      }

      XLSX.writeFile(wb, `Detalle_L${item.lote}_S${item.semana}_${item.finca}.xlsx`);
    } catch (err) {
      console.error("Error descargas:", err);
    } finally {
      setLoading(false);
    }
  };

  const descargarTodoAuditoria = async () => {
    if (datosAuditoria.length === 0) return;
    setLoading(true);
    try {
      const wb = XLSX.utils.book_new();
      const tablas = [
        'reporte_consolidado_lote',
        'vista_detalle_agricola',
        'vista_detalle_cosecha',
        'vista_detalle_desmache',
        'vista_maestra_absoluta'
      ];

      const ids = datosAuditoria.map(d => d.id);

      for (const tabla of tablas) {
        let dataToExport = [];

        if (tabla === 'vista_maestra_absoluta') {
          // Para la maestra absoluta en descarga masiva filtramos por los criterios de búsqueda actuales
          const { data } = await supabase.from(tabla)
            .select('*')
            .eq('finca', busquedaFinca)
            .eq('anio', busquedaAnio)
            .in('lote', [...new Set(datosAuditoria.map(d => d.lote))])
            .in('semana', [...new Set(datosAuditoria.map(d => d.semana))]);
          
          // Filtramos en memoria para asegurar que coincidan exactamente con los puntos de auditoría
          const llavesValidas = new Set(datosAuditoria.map(d => `${d.lote}-${d.semana}-${d.puntos_muestreados}`));
          dataToExport = (data || []).filter(row => llavesValidas.has(`${row.lote}-${row.semana}-${row.punto_muestreo}`));
        } else {
          const columnaId = tabla === 'reporte_consolidado_lote' ? 'id' : 'maestra_id';
          const { data } = await supabase.from(tabla).select('*').in(columnaId, ids);
          dataToExport = data || [];
        }

        if (dataToExport.length > 0) {
          const ws = XLSX.utils.json_to_sheet(dataToExport);
          XLSX.utils.book_append_sheet(wb, ws, tabla.substring(0, 31));
        }
      }
      XLSX.writeFile(wb, `Reporte_Masivo_Auditoria.xlsx`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? "0.000" : n.toFixed(3);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', color: '#333' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => navigate('/')} style={btnBackStyle}>⬅ Menú</button>
        <button onClick={descargarExcel} style={btnExcelTopStyle}>📥 Descargar Excel Consolidado</button>
      </div>
      
      <h1 style={{ color: '#1b5e20', marginBottom: '20px' }}>📊 Reporte Consolidado Banagro</h1>

      {/* --- SECCIÓN 1: GRÁFICA --- */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, fontSize: '15px', color: '#666', marginBottom: '20px' }}>
          {filtroFinca && filtroLote 
            ? `Comparativo 2 Últimas Semanas: ${filtroFinca} - Lote ${filtroLote}` 
            : 'Seleccione Finca y Lote para generar la gráfica'}
        </h3>
        
        <div style={{ height: '320px', width: '100%' }}>
          {dataGrafico.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGrafico} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={14} fontWeight="bold" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="valor" name={variableActiva.replace(/_/g, ' ')} radius={[5, 5, 0, 0]}>
                  <LabelList 
                    dataKey="valor" 
                    position="top" 
                    style={{ fill: '#1b5e20', fontWeight: 'bold', fontSize: '15px' }} 
                  />
                  {dataGrafico.map((entry, index) => (
                    <Cell key={index} fill={index === dataGrafico.length - 1 ? '#2e7d32' : '#a5d6a7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={emptyStateStyle}>
              {loading ? "Consolidando datos..." : "⚠️ Esperando selección de Finca y Lote..."}
            </div>
          )}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={labelStyle}>1. Seleccionar Finca</label>
            <select value={filtroFinca} onChange={(e) => { setFiltroFinca(e.target.value); setFiltroLote(''); }} style={selectStyle}>
              <option value="">-- Finca --</option>
              {fincas.map((f, i) => <option key={i} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>2. Seleccionar Lote</label>
            <select value={filtroLote} onChange={(e) => setFiltroLote(e.target.value)} style={selectStyle} disabled={!filtroFinca}>
              <option value="">-- Lote --</option>
              {lotesDisponibles.map((l, i) => <option key={i} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>3. Variable a Medir</label>
            <select value={variableActiva} onChange={(e) => setVariableActiva(e.target.value)} style={selectStyle}>
              <optgroup label="Calidad">
                <option value="repo_evaluacion_agricultura">🌱 Calidad Agricultura (%)</option>
                <option value="repo_evaluacion_desmache">✂️ Calidad Desmache (%)</option>
              </optgroup>
              <optgroup label="Inventario de Plantas">
                <option value="promedio_pl_ha">🍌 Promedio Pl/Ha</option>
                <option value="repo_plantas_evaluadas">🔢 Total Evaluadas</option>
                <option value="repo_plantas_prontas">🍎 Plantas Prontas</option>
                <option value="repo_plantas_paridas">🤰 Plantas Paridas</option>
                <option value="repo_plantas_cosechadas">🧺 Plantas Cosechadas</option>
                <option value="repo_pantas_jovenes">🌿 Plantas Jóvenes</option>
                <option value="repo_resiembras">🚜 Resiembras</option>
                <option value="repo_planta_a_recuperar">🩹 A Recuperar</option>
                <option value="repo_plantas_huerfanas">👤 Huérfanas</option>
                <option value="repo_plantas_improductivas">📉 Improductivas</option>
                <option value="repo_espacios">🕳️ Espacios</option>
                <option value="repo_plantas_eliminadas">❌ Eliminadas</option>
              </optgroup>
              <optgroup label="Biometría">
                <option value="repo_promedio_retorno_altura">📏 Altura Retorno</option>
                <option value="repo_promedio_mayor_altura">🔝 Altura Mayor</option>
                <option value="repo_promedio_menor_altura">⬇️ Altura Menor</option>
                <option value="repo_promedio_circunferencia">⭕ Circunferencia Prom.</option>
                <option value="repo_circunferencia_mayor">🔘 Circ. Mayor</option>
                <option value="repo_circunferencia_menor">🌑 Circ. Menor</option>
                <option value="area_ha">🗺️ Área Ha</option>
              </optgroup>
              <optgroup label="Porcentajes Técnicos">
                <option value="porcentaje_plantas_paridas">% Paridas</option>
                <option value="porcentaje_plantas_cosechadas">% Cosechadas</option>
                <option value="porcentaje_pantas_jovenes">% Jóvenes</option>
                <option value="porcentaje_plantas_prontas">% Plantas Prontas</option>
                <option value="porcentaje_resiembras">% Resiembras</option>
                <option value="porcentaje_planta_a_recuperar">% A Recuperar</option>
                <option value="porcentaje_plantas_huerfanas">% Huérfanas</option>
                <option value="porcentaje_plantas_improductivas">% Improductivas</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>


{/* --- SECCIÓN 2: RESUMEN GENERAL --- */}
      <div style={{ marginTop: '30px' }}>
        <h2 style={{ color: '#1b5e20', borderLeft: '5px solid #2e7d32', paddingLeft: '15px', marginBottom: '20px' }}>
          📑 Resumen General de la Tabla Consolidada
        </h2>
        <div style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f0f4f0', borderRadius: '10px' }}>
            <div>
              <label style={labelStyle}>Año</label>
              <select value={resumenFiltroAnio} onChange={(e) => setResumenFiltroAnio(e.target.value)} style={selectStyle}>
                <option value="">-- Todos --</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Finca</label>
              <select value={resumenFiltroFinca} onChange={(e) => {setResumenFiltroFinca(e.target.value); setResumenFiltroLote('');}} style={selectStyle}>
                <option value="">-- Todas --</option>
                {fincas.map((f, i) => <option key={i} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Lote</label>
              <select value={resumenFiltroLote} onChange={(e) => {setResumenFiltroLote(e.target.value); setResumenFiltroSemana('');}} style={selectStyle}>
                <option value="">-- Todos --</option>
                {opcionesFiltros.obtenerLotes(resumenFiltroFinca, resumenFiltroAnio).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Semana</label>
              <select value={resumenFiltroSemana} onChange={(e) => setResumenFiltroSemana(e.target.value)} style={selectStyle}>
                <option value="">-- Todas --</option>
                {opcionesFiltros.obtenerSemanas(resumenFiltroFinca, resumenFiltroAnio, resumenFiltroLote).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={() => { setResumenFiltroFinca(''); setResumenFiltroLote(''); setResumenFiltroSemana(''); setResumenFiltroAnio(''); }} style={{ ...btnBackStyle, width: '100%', padding: '10px' }}>Limpiar</button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '500px', border: '1px solid #eee', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: '2200px' }}>
              <thead style={{ background: '#f8faf9', position: 'sticky', top: 0, zIndex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                <tr>
                  <th style={thMiniStyle}>Finca</th><th style={thMiniStyle}>Año</th><th style={thMiniStyle}>Sem</th><th style={thMiniStyle}>Lote</th>
                  <th style={thMiniStyle}>Área (Ha)</th><th style={thMiniStyle}>Agricultor</th><th style={thMiniStyle}>Desmachador</th>
                  <th style={thMiniStyle}>Pl. Eval.</th><th style={thMiniStyle}>Pl/Ha</th>
                  {/* NUEVAS COLUMNAS DE BIOMETRÍA */}
                  <th style={{...thMiniStyle, background: '#e8f5e9'}}>Alt. Ret</th>
                  <th style={{...thMiniStyle, background: '#e8f5e9'}}>Alt. Máx</th>
                  <th style={{...thMiniStyle, background: '#e8f5e9'}}>Alt. Mín</th>
                  <th style={{...thMiniStyle, background: '#e3f2fd'}}>Circ. Prom</th>
                  <th style={{...thMiniStyle, background: '#e3f2fd'}}>Circ. Máx</th>
                  <th style={{...thMiniStyle, background: '#e3f2fd'}}>Circ. Mín</th>
                  <th style={thMiniStyle}>Cal. Agri%</th><th style={thMiniStyle}>Cal. Desm%</th>
                  <th style={thMiniStyle}>%Paridas</th><th style={thMiniStyle}>%Cosech</th><th style={thMiniStyle}>%Jóvenes</th>
                  <th style={thMiniStyle}>%Prontas</th><th style={thMiniStyle}>%Resiemb</th><th style={thMiniStyle}>%Recup</th>
                  <th style={thMiniStyle}>%Huérf</th><th style={thMiniStyle}>%Improd</th>
                </tr>
              </thead>
              <tbody>
                {datosResumenFiltrados.length > 0 ? (
                  datosResumenFiltrados.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td style={tdMiniStyle}>{item.finca}</td><td style={tdMiniStyle}>{item.anio}</td><td style={tdMiniStyle}>{item.semana}</td><td style={tdMiniStyle}><b>{item.lote}</b></td>
                      <td style={tdMiniStyle}>{fmt(item.area_ha)}</td><td style={tdMiniStyle}>{item.nombre_agricultor || '-'}</td><td style={tdMiniStyle}>{item.nombre_desmachador || '-'}</td>
                      <td style={tdMiniStyle}>{item.plantas_evaluadas}</td><td style={tdMiniStyle}>{fmt(item.plantas_ha)}</td>
                      {/* MAPEADO DE BIOMETRÍA CORREGIDO */}
                      <td style={tdMiniStyle}>{fmt(item.altura_promedio)}</td>
                      <td style={tdMiniStyle}>{fmt(item.altura_maxima)}</td>
                      <td style={tdMiniStyle}>{fmt(item.altura_minima)}</td>
                      <td style={tdMiniStyle}>{fmt(item.circunferencia_promedio)}</td>
                      <td style={tdMiniStyle}>{fmt(item.circunferencia_maximo)}</td>
                      <td style={tdMiniStyle}>{fmt(item.circunferencia_minimo)}</td>
                      
                      <td style={{...tdMiniStyle, color: item.agri_calidad_pct < 85 ? 'red' : 'green', fontWeight: 'bold'}}>{fmt(item.agri_calidad_pct)}%</td>
                      <td style={{...tdMiniStyle, color: item.repo_evaluacion_desmache < 85 ? 'red' : 'green', fontWeight: 'bold'}}>{fmt(item.repo_evaluacion_desmache)}%</td>
                      <td style={tdMiniStyle}>{fmt(item.porcentaje_plantas_paridas)}%</td><td style={tdMiniStyle}>{fmt(item.porcentaje_plantas_cosechadas)}%</td>
                      <td style={tdMiniStyle}>{fmt(item.porcentaje_pantas_jovenes)}%</td><td style={tdMiniStyle}>{fmt(item.porcentaje_plantas_prontas)}%</td>
                      <td style={tdMiniStyle}>{fmt(item.porcentaje_resiembras)}%</td><td style={tdMiniStyle}>{fmt(item.porcentaje_planta_a_recuperar)}%</td>
                      <td style={tdMiniStyle}>{fmt(item.porcentaje_plantas_huerfanas)}%</td><td style={tdMiniStyle}>{fmt(item.porcentaje_plantas_improductivas)}%</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="25" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>{resumenFiltroFinca === '' && resumenFiltroLote === '' ? "Seleccione una Finca o un Lote para ver los informes detallados." : "No se encontraron registros."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      {/* --- SECCIÓN 3: FICHA CONSOLIDADA --- */}
{/* --- SECCIÓN 3: FICHA CONSOLIDADA --- */}
      {resumenFichaVertical && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#1565c0', borderLeft: '5px solid #1565c0', paddingLeft: '15px', margin: 0 }}>
              📑 Ficha Consolidada (Promedio de {resumenFichaVertical.count} informes)
            </h2>
            
            <button 
              onClick={() => {
                const d2 = (val) => val ? parseFloat(val).toFixed(2) : "0.00";
                const p = resumenFichaVertical.promedios;

                const dataVertical = [
                  ["RESUMEN DE VISITAS", ""],
                  ["Finca:", resumenFichaVertical.finca],
                  ["Clon:", resumenFichaVertical.clon || "N/A"],
                  ["Año:", resumenFichaVertical.anio],
                  ["Semana:", resumenFichaVertical.semana],
                  ["Lotes Visitados:", resumenFichaVertical.lote],
                  ["Área (ha):", d2(resumenFichaVertical.area)],
                  ["Plantas Auditadas:", p.eval],
                  ["Promedio (pl/ha):", d2(p.dens)],
                  ["", ""],
                  ["VARIABLES DE CAMPO", "Total", "Porcentaje"],
                  ["Plantas Paridas", Math.round((p.paridas / 100) * p.eval), d2(p.paridas) + "%"],
                  ["Plantas cosechadas", Math.round((p.cosech / 100) * p.eval), d2(p.cosech) + "%"],
                  ["Pantas Jóvenes", Math.round((p.joven / 100) * p.eval), d2(p.joven) + "%"],
                  ["Plantas Prontas", Math.round((p.prontas / 100) * p.eval), d2(p.prontas) + "%"],
                  ["Resiembras", Math.round((p.resiemb / 100) * p.eval), d2(p.resiemb) + "%"],
                  ["Planta a recuperar", Math.round((p.recup / 100) * p.eval), d2(p.recup) + "%"],
                  ["Plantas Huérfanas", Math.round((p.huerf / 100) * p.eval), d2(p.huerf) + "%"],
                  ["Plantas Improductivas", Math.round((p.improd / 100) * p.eval), d2(p.improd) + "%"],
                  ["Espacios", p.espacios || 0, ""],
                  ["Plantas Eliminadas", p.eliminadas || 0, ""],
                  ["", ""],
                  ["BIOMETRÍA", ""],
                  ["Promedio Retorno(Altura) :", d2(p.ret) + " cm"],
                  ["Promedio Mayor(Altura) :", d2(p.altura_maxima) + " cm"],
                  ["Promedio Menor(Altura) :", d2(p.altura_minima) + " cm"],
                  ["Promedio de circunferencia:", d2(p.circ) + " cm"],
                  ["Circunferencia Mayor:", d2(p.circunferencia_maximo) + " cm"],
                  ["Circunferencia Menor:", d2(p.circunferencia_minimo) + " cm"],
                  ["", ""],
                  ["CALIDAD Y PERSONAL", ""],
                  ["Evaluación agricultura :", d2(p.agri) + "%"],
                  ["Agricultor :", resumenFichaVertical.agricultor || "N/A"],
                  ["Evaluación Desmache :", d2(p.desm) + "%"],
                  ["Desmachador :", resumenFichaVertical.desmachador || "N/A"],
                  ["", ""],
                  ["Observaciones:", resumenFichaVertical.listaObservaciones?.join(" | ") || "Sin observaciones"]
                ];

                const ws = XLSX.utils.aoa_to_sheet(dataVertical);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Ficha");
                XLSX.writeFile(wb, `Informe_Zona_${resumenFichaVertical.finca}_S${resumenFichaVertical.semana}.xlsx`);
              }}
              style={{ backgroundColor: '#1565c0', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              📥 Descargar Informe Zona
            </button>
          </div>

          <div style={{ ...cardStyle, border: '2px solid #1565c0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* BLOQUE 1: IDENTIFICACIÓN */}
              <div style={verticalSectionStyle}>
                <h4 style={verticalTitleStyle}>Identificación y Calidad</h4>
                <div style={verticalRowStyle}><span>Finca:</span> <b>{resumenFichaVertical.finca}</b></div>
                <div style={verticalRowStyle}><span>Clon:</span> <b>{resumenFichaVertical.clon || 'N/A'}</b></div>
                <div style={verticalRowStyle}><span>Año / Sem:</span> <b>{resumenFichaVertical.anio} - Sem {resumenFichaVertical.semana}</b></div>
                <div style={verticalRowStyle}><span>Lotes Visitados:</span> <b>{resumenFichaVertical.lote}</b></div>
                <div style={verticalRowStyle}><span>Área (ha):</span> <b>{fmt(resumenFichaVertical.area)}</b></div>
                <div style={verticalRowStyle}><span>Agricultor:</span> <b>{resumenFichaVertical.agricultor || 'N/A'}</b></div>
                <div style={verticalRowStyle}><span>Desmachador:</span> <b>{resumenFichaVertical.desmachador || 'N/A'}</b></div>
                <hr />
                <div style={verticalRowStyle}>
                  <span>Evaluación agricultura:</span> 
                  <b style={{color: resumenFichaVertical.promedios.agri < 85 ? 'red':'green'}}>{fmt(resumenFichaVertical.promedios.agri)}%</b>
                </div>
                <div style={verticalRowStyle}>
                  <span>Evaluación Desmache:</span> 
                  <b style={{color: resumenFichaVertical.promedios.desm < 85 ? 'red':'green'}}>{fmt(resumenFichaVertical.promedios.desm)}%</b>
                </div>
              </div>

              {/* BLOQUE 2: BIOMETRÍA */}
              <div style={verticalSectionStyle}>
                <h4 style={verticalTitleStyle}>Biometría (Promedios)</h4>
                <div style={verticalRowStyle}><span>Plantas Auditadas:</span> <b>{resumenFichaVertical.promedios.eval}</b></div>
                <div style={verticalRowStyle}><span>Promedio (pl/ha):</span> <b>{fmt(resumenFichaVertical.promedios.dens)}</b></div>
                <div style={verticalRowStyle}><span>Promedio Retorno:</span> <b>{fmt(resumenFichaVertical.promedios.ret)} cm</b></div>
                <div style={verticalRowStyle}><span>Promedio Mayor (Alt):</span> <b>{fmt(resumenFichaVertical.promedios.altura_maxima)} cm</b></div>
                <div style={verticalRowStyle}><span>Promedio Menor (Alt):</span> <b>{fmt(resumenFichaVertical.promedios.altura_minima)} cm</b></div>
                <div style={verticalRowStyle}><span>Promedio Circunf.:</span> <b>{fmt(resumenFichaVertical.promedios.circ)} cm</b></div>
                <div style={verticalRowStyle}><span>Circunf. Mayor:</span> <b>{fmt(resumenFichaVertical.promedios.circunferencia_maximo)} cm</b></div>
                <div style={verticalRowStyle}><span>Circunf. Menor:</span> <b>{fmt(resumenFichaVertical.promedios.circunferencia_minimo)} cm</b></div>
              </div>

              {/* BLOQUE 3: ESTADOS DE PLANTA */}
              <div style={verticalSectionStyle}>
                <h4 style={verticalTitleStyle}>Estados de Planta</h4>
                <div style={{...verticalRowStyle, background: '#e3f2fd', fontWeight: 'bold'}}><span>Variable</span><span>Total | %</span></div>
                <div style={verticalRowStyle}><span>Paridas:</span> <span>{Math.round((resumenFichaVertical.promedios.paridas/100)*resumenFichaVertical.promedios.eval)} | <b>{fmt(resumenFichaVertical.promedios.paridas)}%</b></span></div>
                <div style={verticalRowStyle}><span>Cosechadas:</span> <span>{Math.round((resumenFichaVertical.promedios.cosech/100)*resumenFichaVertical.promedios.eval)} | <b>{fmt(resumenFichaVertical.promedios.cosech)}%</b></span></div>
                <div style={verticalRowStyle}><span>Jóvenes:</span> <span>{Math.round((resumenFichaVertical.promedios.joven/100)*resumenFichaVertical.promedios.eval)} | <b>{fmt(resumenFichaVertical.promedios.joven)}%</b></span></div>
                <div style={verticalRowStyle}><span>Prontas:</span> <span>{Math.round((resumenFichaVertical.promedios.prontas/100)*resumenFichaVertical.promedios.eval)} | <b>{fmt(resumenFichaVertical.promedios.prontas)}%</b></span></div>
                <div style={verticalRowStyle}><span>Resiembras:</span> <span>{Math.round((resumenFichaVertical.promedios.resiemb/100)*resumenFichaVertical.promedios.eval)} | <b>{fmt(resumenFichaVertical.promedios.resiemb)}%</b></span></div>
                <div style={verticalRowStyle}><span>A Recuperar:</span> <span>{Math.round((resumenFichaVertical.promedios.recup/100)*resumenFichaVertical.promedios.eval)} | <b>{fmt(resumenFichaVertical.promedios.recup)}%</b></span></div>
                <div style={verticalRowStyle}><span>Huérfanas:</span> <span>{Math.round((resumenFichaVertical.promedios.huerf/100)*resumenFichaVertical.promedios.eval)} | <b>{fmt(resumenFichaVertical.promedios.huerf)}%</b></span></div>
                <div style={verticalRowStyle}><span>Improductivas:</span> <span>{Math.round((resumenFichaVertical.promedios.improd/100)*resumenFichaVertical.promedios.eval)} | <b>{fmt(resumenFichaVertical.promedios.improd)}%</b></span></div>
                <div style={verticalRowStyle}><span>Espacios:</span> <b>{resumenFichaVertical.promedios.espacios || 0}</b></div>
                <div style={verticalRowStyle}><span>Eliminadas:</span> <b>{resumenFichaVertical.promedios.eliminadas || 0}</b></div>
              </div>
            </div>

            {/* OBSERVACIONES */}
            <div style={{ ...verticalSectionStyle, gridColumn: '1 / -1', marginTop: '15px', backgroundColor: '#fffde7' }}>
              <h4 style={{ ...verticalTitleStyle, color: '#f57f17', borderBottomColor: '#f57f17' }}>📝 Observaciones Consolidadas</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {resumenFichaVertical.listaObservaciones?.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', fontStyle: 'italic', color: '#5d4037' }}>
                    {resumenFichaVertical.listaObservaciones.map((obs, idx) => <li key={idx} style={{marginBottom: '5px'}}>{obs}</li>)}
                  </ul>
                ) : <p style={{color: '#999'}}>No hay observaciones para este periodo.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SECCIÓN 4: AUDITORÍA --- */}
      <div style={{ marginTop: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#1b5e20', borderLeft: '5px solid #2e7d32', paddingLeft: '15px' }}>
            ⚙️ Auditoría y Gestión de Datos
          </h2>
          <button onClick={descargarTodoAuditoria} style={btnExcelTopStyle} disabled={datosAuditoria.length === 0}>
                📥 Descargar Todo el Filtro
          </button>
        </div>
        
        <div style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <select value={busquedaAnio} onChange={(e) => setBusquedaAnio(e.target.value)} style={selectStyle}>
              <option value="">-- Año --</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
            <select value={busquedaFinca} onChange={(e) => {setBusquedaFinca(e.target.value); setBusquedaLote('');}} style={selectStyle}>
              <option value="">-- Finca --</option>
              {fincas.map((f, i) => <option key={i} value={f}>{f}</option>)}
            </select>
            <select value={busquedaLote} onChange={(e) => {setBusquedaLote(e.target.value); setBusquedaSemana('');}} style={selectStyle}>
              <option value="">-- Lote --</option>
              {opcionesFiltros.obtenerLotes(busquedaFinca, busquedaAnio).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={busquedaSemana} onChange={(e) => setBusquedaSemana(e.target.value)} style={selectStyle}>
              <option value="">-- Semana --</option>
              {opcionesFiltros.obtenerSemanas(busquedaFinca, busquedaAnio, busquedaLote).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#455a64', color: '#fff' }}>
                <tr>
                  <th style={tdStyle}>Lote</th><th style={thStyle}>Año</th><th style={thStyle}>Sem</th><th style={thStyle}>Finca</th><th style={thStyle}>Responsable</th><th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {datosAuditoria.length > 0 ? datosAuditoria.map((item, i) => (
                  <tr key={item.id || i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}><b>{item.lote}</b></td><td style={tdStyle}>{item.anio}</td><td style={tdStyle}>{item.semana}</td><td style={tdStyle}>{item.finca}</td><td style={tdStyle}>{item.nombre_agricultor || 'N/A'}</td>
                    <td style={{...tdStyle, display: 'flex', gap: '8px'}}>
                      <button onClick={() => navigate(`/editar-reporte/${item.id}`)} style={btnEditStyle}>Editar</button>
                      <button onClick={() => descargarReporteDetallado(item)} style={{...btnEditStyle, background: '#1b5e20'}}>📥 Reporte</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No se encontraron registros detallados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS ---
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const selectStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', color: '#333', backgroundColor: '#fff', marginTop: '5px' };
const labelStyle = { fontSize: '12px', fontWeight: 'bold', color: '#2e7d32' };
const thStyle = { padding: '12px', textAlign: 'left', fontSize: '13px' };
const tdStyle = { padding: '12px', textAlign: 'left', color: '#333', fontSize: '13px' };
const btnBackStyle = { padding: '10px 15px', borderRadius: '8px', border: '2px solid #2e7d32', color: '#2e7d32', background: '#fff', fontWeight: 'bold', cursor: 'pointer' };
const btnExcelTopStyle = { padding: '10px 15px', background: '#1b5e20', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const btnEditStyle = { padding: '6px 12px', background: '#455a64', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const emptyStateStyle = { height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' };
const thMiniStyle = { padding: '10px', textAlign: 'left', fontSize: '10px', color: '#666', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' };
const tdMiniStyle = { padding: '10px', textAlign: 'left', fontSize: '11px', whiteSpace: 'nowrap' };
const verticalSectionStyle = { padding: '15px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e3e6e8' };
const verticalTitleStyle = { margin: '0 0 10px 0', fontSize: '14px', color: '#1565c0', borderBottom: '2px solid #1565c0', paddingBottom: '5px' };
const verticalRowStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px', paddingBottom: '5px', borderBottom: '1px dashed #ddd' };

export default ReportesBanagro;