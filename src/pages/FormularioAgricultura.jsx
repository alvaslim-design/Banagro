import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import Input8Metros from '../components/Input8Metros';
import BotonGuardar from '../components/BotonGuardar';

// --- CONFIGURACIÓN DE COLORES (Ciclo de Cintas Urabá) ---
const ORDEN_COLORES = ['Roja', 'Café', 'Negra', 'Naranja', 'Verde', 'Amarilla', 'Blanca', 'Azul'];
const MAPA_COLORES_HEX = {
  'Roja': '#ffcdd2', 'Café': '#d7ccc8', 'Negra': '#cfd8dc', 
  'Naranja': '#ffe0b2', 'Verde': '#c8e6c9', 'Amarilla': '#fff9c4', 
  'Blanca': '#ffffff', 'Azul': '#bbdefb'
};

const FormularioAgricultura = () => {
  const [loading, setLoading] = useState(false);
  const [fincas, setFincas] = useState([]);
  const [operarios, setOperarios] = useState([]);
  const [clones, setClones] = useState([]);
  const [paso, setPaso] = useState(1);

  const [form, setForm] = useState({
    // --- PASO 1: CABECERA ---
    finca_id: '', clon_id: '', agricultor_id: '', desmachador_id: '', evaluador_id: '',
    lote: '', semana: '', area_ha: '', punto_muestreo: 1, latitud_wgs84: null, longitud_wgs84: null,
    color_inicio: '',

    // --- PASO 2: REPORTE_COSECHA ---
    plantas_prontas: 0, planta_a_recuperar: 0, plantas_improductivas: 0, plantas_huerfanas: 0,
    pp_bacota: 0, pp_1semanas: 0, pp_2semanas: 0, pp_3semanas: 0, pp_4semanas: 0, pp_5semanas: 0,
    pp_6semanas: 0, pp_7semanas: 0, pp_8semanas: 0, pp_9semanas: 0, pp_10semanas: 0, pp_11semanas: 0,
    pc_2_2_5: 0, pc_2_5_3: 0, pc_3_3_5: 0, 
    pj_2_2_5: 0, pj_2_5_3: 0, pj_mas_3: 0,
    resiembra_con_distancia: 0, resiembra_sin_distancia: 0, 
    planta_reinas_con_distancia: 0, planta_reina_sin_distancia: 0,
    plantas_eliminadas_bien: 0, plantas_eliminadas_mal: 0,
    espacios_con_distancia: 0, espacios_sin_distancia: 0,
    alturas_plantas: Array(25).fill(''), circunferencias_plantas: Array(25).fill(''),

    // --- PASO 2: EVALUACIÓN AGRÍCOLA ---
    enfrentamiento_primarios_agri: 0, planta_mal_eliminada_agri: 0, planta_encerrada_agri: 0,
    planta_recuperar_sin_intervenir_agri: 0, planta_improductiva_agri: 0, espacio_estaquillado_sin_distancia_agri: 0,
    espacio_sin_estaquillar_agri: 0, falta_herramienta_insumo_agri: 0, planta_huerfana_sin_intervenir_agri: 0,
    resiembra_pobre_agri: 0, retorno_sin_intervenir_agri: 0, reina_fuera_especificaciones_agri: 0,
    resiembra_sin_intervenir_agri: 0, retorno_sin_seguimiento_agri: 0, mala_ejecucion_hercules_agri: 0,
    planta_recuperar_sin_elegir_agri: 0, arbusto_area_drenajes_agri: 0, rebrotes_en_drenajes_agri: 0,
    batea_obstruida_agri: 0, bejucos_unidades_produccion_agri: 0, espacio_marcado_vena_agri: 0,
    sin_aporque_barrera_agri: 0, fomy_cintas_sin_recoger_agri: 0, hueco_sin_tapar_agri: 0,
    mezcla_clones_agri: 0, planta_bruja_agri: 0, racimo_planta_seca_sin_repique_agri: 0,
    plantas_con_limite_hojas_agri: 0, planta_sin_vampirear_agri: 0, racimo_pobre_bacota_pobre_agri: 0,
    tronco_seco_sin_eliminar_agri: 0,

    // --- PASO 2: EVALUACIÓN DESMACHE ---
    hijo_rastrero_desm: 0, enfrentamiento_primarios_desm: 0, mala_eleccion_desm: 0, desmache_lineal_desm: 0,
    sin_elegir_orilla_desm: 0, planta_eliminada_desm: 0, hijo_al_drenaje_cable_desm: 0,
    planta_sin_desmachar_desm: 0, hijos_continuos_desm: 0, rebrote_sin_cortar_desm: 0,
    mal_corte_desm: 0, eleccion_temprana_edad_desm: 0, cepa_sin_doblar_desm: 0,
    residuos_drenaje_fertilizacion_desm: 0, hueco_sin_tapar_desm: 0
  });

  useEffect(() => {
    const cargarDatosMaestros = async () => {
      try {
        const { data: f } = await supabase.from('tabla_fincas').select('id, nombre, zona').eq('activo', true).order('nombre');
        const { data: o } = await supabase.from('tabla_operarios').select('id, nombre, rol').eq('activo', true).order('nombre');
        const { data: c } = await supabase.from('table_clon').select('id, nombre').eq('activo', true).order('nombre');
        setFincas(f || []); setOperarios(o || []); setClones(c || []);
      } catch (err) { console.error("Error cargando datos:", err); }
    };
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setForm(prev => ({ ...prev, latitud_wgs84: pos.coords.latitude, longitud_wgs84: pos.coords.longitude }));
      }, (err) => console.log("Error GPS:", err));
    }
    cargarDatosMaestros();
  }, []);

  const handleInputChange = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }));

  const handleArrayChange = (index, valor, campo) => {
    const nuevoArray = [...form[campo]];
    nuevoArray[index] = valor;
    setForm(prev => ({ ...prev, [campo]: nuevoArray }));
  };

  const ControlContador = ({ etiqueta, campo, valor }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <button 
        type="button" 
        onClick={() => handleInputChange(campo, Math.max(0, parseInt(valor || 0) - 1))}
        style={btnContadorStyle}
      >-</button>
      <div style={{ flex: 1 }}>
        <Input8Metros etiqueta={etiqueta} tipo="number" valor={valor} alCambiar={(v) => handleInputChange(campo, v)} />
      </div>
      <button 
        type="button" 
        onClick={() => handleInputChange(campo, parseInt(valor || 0) + 1)}
        style={btnContadorStyle}
      >+</button>
    </div>
  );

  const calcularStats = (arr) => {
    const nums = arr.map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (nums.length === 0) return { avg: "0.00", max: "0.00", min: "0.00" };
    return {
      avg: (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2),
      max: Math.max(...nums).toFixed(2),
      min: Math.min(...nums).toFixed(2)
    };
  };

  const calcularResumenCosecha = () => {
    const camposPoblacion = [
      'plantas_prontas', 'planta_a_recuperar', 'plantas_improductivas', 'plantas_huerfanas', 'pp_bacota',
      'pp_1semanas', 'pp_2semanas', 'pp_3semanas', 'pp_4semanas', 'pp_5semanas', 'pp_6semanas',
      'pp_7semanas', 'pp_8semanas', 'pp_9semanas', 'pp_10semanas', 'pp_11semanas',
      'pc_2_2_5', 'pc_2_5_3', 'pc_3_3_5', 'pj_2_2_5', 'pj_2_5_3', 'pj_mas_3',
      'resiembra_con_distancia', 'resiembra_sin_distancia', 
      'planta_reinas_con_distancia', 'planta_reina_sin_distancia'
    ];
    const totalPlantas = camposPoblacion.reduce((acc, campo) => acc + (parseInt(form[campo]) || 0), 0);
    return { total: totalPlantas, plantasHa: totalPlantas * 50 };
  };

  const obtenerCalculosCalidad = () => {
    const plantasEval = calcularResumenCosecha().total;

    const pesosAgricola = {
      enfrentamiento_primarios_agri: 3, planta_mal_eliminada_agri: 3, planta_encerrada_agri: 3,
      planta_recuperar_sin_intervenir_agri: 3, planta_improductiva_agri: 3, espacio_estaquillado_sin_distancia_agri: 3,
      espacio_sin_estaquillar_agri: 3, falta_herramienta_insumo_agri: 3, planta_huerfana_sin_intervenir_agri: 3,
      resiembra_pobre_agri: 3, retorno_sin_intervenir_agri: 3, reina_fuera_especificaciones_agri: 2,
      resiembra_sin_intervenir_agri: 2, retorno_sin_seguimiento_agri: 2, mala_ejecucion_hercules_agri: 2,
      planta_recuperar_sin_elegir_agri: 2, arbusto_area_drenajes_agri: 1, rebrotes_en_drenajes_agri: 1,
      batea_obstruida_agri: 1, bejucos_unidades_produccion_agri: 1, espacio_marcado_vena_agri: 1,
      sin_aporque_barrera_agri: 1, fomy_cintas_sin_recoger_agri: 1, hueco_sin_tapar_agri: 1,
      mezcla_clones_agri: 1, planta_bruja_agri: 1, racimo_planta_seca_sin_repique_agri: 1,
      plantas_con_limite_hojas_agri: 1, planta_sin_vampirear_agri: 1, racimo_pobre_bacota_pobre_agri: 1,
      tronco_seco_sin_eliminar_agri: 1
    };

    const pesosDesmache = {
      hijo_rastrero_desm: 3, enfrentamiento_primarios_desm: 3, mala_eleccion_desm: 3, desmache_lineal_desm: 3,
      sin_elegir_orilla_desm: 3, planta_eliminada_desm: 3, hijo_al_drenaje_cable: 2,
      planta_sin_desmachar_desm: 1, hijos_continuos_desm: 1, rebrote_sin_cortar_desm: 1,
      mal_corte_desm: 1, eleccion_temprana_edad_desm: 1, cepa_sin_doblar_desm: 1,
      residuos_drenaje_fertilizacion_desm: 1, hueco_sin_tapar_desm: 1
    };

    const totalAgriPonderado = Object.keys(pesosAgricola).reduce((acc, campo) => acc + ((parseInt(form[campo]) || 0) * pesosAgricola[campo]), 0);
    const totalDesmPonderado = Object.keys(pesosDesmache).reduce((acc, campo) => acc + ((parseInt(form[campo]) || 0) * pesosDesmache[campo]), 0);

    const calidadAgri = plantasEval > 0 ? (1 - (totalAgriPonderado / plantasEval)) * 100 : 0;
    const calidadDesm = plantasEval > 0 ? (1 - (totalDesmPonderado / plantasEval)) * 100 : 0;

    return { 
      totalAgri: totalAgriPonderado, totalDesm: totalDesmPonderado, 
      porcAgri: Math.max(0, calidadAgri).toFixed(2), porcDesm: Math.max(0, calidadDesm).toFixed(2) 
    };
  };

  const irACapturaRobusta = (e) => {
    e.preventDefault();
    if (!form.finca_id || !form.evaluador_id || !form.clon_id) {
      alert("⚠️ Finca, Variedad y Evaluador son obligatorios.");
      return;
    }
    setPaso(2);
  };

  const guardarTodoElFormulario = async () => {
    setLoading(true);
    console.log("🚀 Iniciando proceso de guardado...");
    try {
      // 1. TABLA MAESTRA
      const { data: maestraData, error: maestraError } = await supabase
        .from('tabla_maestra')
        .insert([{
          finca_id: parseInt(form.finca_id),
          clon_id: parseInt(form.clon_id),
          evaluador_id: parseInt(form.evaluador_id),
          agricultor_id: form.agricultor_id ? parseInt(form.agricultor_id) : null,
          desmachador_id: form.desmachador_id ? parseInt(form.desmachador_id) : null,
          lote: String(form.lote),
          semana: parseInt(form.semana),
          area_ha: parseFloat(form.area_ha) || 0,
          punto_muestreo: parseInt(form.punto_muestreo),
          latitud_wgs84: form.latitud_wgs84,
          longitud_wgs84: form.longitud_wgs84
        }]).select();

      if (maestraError) {
        console.error("❌ Error en Tabla Maestra:", maestraError);
        throw maestraError;
      }
      const idMaestro = maestraData[0].id;
      console.log("✅ Maestra guardada, ID:", idMaestro);

      // 2. REPORTE COSECHA
      const { error: cosechError } = await supabase.from('reportes_cosecha').insert([{
        maestra_id: idMaestro,
        plantas_prontas: parseInt(form.plantas_prontas) || 0,
        planta_a_recuperar: parseInt(form.planta_a_recuperar) || 0,
        plantas_improductivas: parseInt(form.plantas_improductivas) || 0,
        plantas_huerfanas: parseInt(form.plantas_huerfanas) || 0,
        pp_bacota: parseInt(form.pp_bacota) || 0,
        pp_1semanas: parseInt(form.pp_1semanas) || 0, pp_2semanas: parseInt(form.pp_2semanas) || 0,
        pp_3semanas: parseInt(form.pp_3semanas) || 0, pp_4semanas: parseInt(form.pp_4semanas) || 0,
        pp_5semanas: parseInt(form.pp_5semanas) || 0, pp_6semanas: parseInt(form.pp_6semanas) || 0,
        pp_7semanas: parseInt(form.pp_7semanas) || 0, pp_8semanas: parseInt(form.pp_8semanas) || 0,
        pp_9semanas: parseInt(form.pp_9semanas) || 0, pp_10semanas: parseInt(form.pp_10semanas) || 0,
        pp_11semanas: parseInt(form.pp_11semanas) || 0,
        pc_2_2_5: parseInt(form.pc_2_2_5) || 0, pc_2_5_3: parseInt(form.pc_2_5_3) || 0,
        pc_3_3_5: parseInt(form.pc_3_3_5) || 0, pj_2_2_5: parseInt(form.pj_2_2_5) || 0,
        pj_2_5_3: parseInt(form.pj_2_5_3) || 0, pj_mas_3: parseInt(form.pj_mas_3) || 0,
        resiembra_con_distancia: parseInt(form.resiembra_con_distancia) || 0,
        resiembra_sin_distancia: parseInt(form.resiembra_sin_distancia) || 0,
        planta_reinas_con_distancia: parseInt(form.planta_reinas_con_distancia) || 0,
        planta_reina_sin_distancia: parseInt(form.planta_reina_sin_distancia) || 0,
        plantas_eliminadas_bien: parseInt(form.plantas_eliminadas_bien) || 0,
        plantas_eliminadas_mal: parseInt(form.plantas_eliminadas_mal) || 0,
        espacios_con_distancia: parseInt(form.espacios_con_distancia) || 0,
        espacios_sin_distancia: parseInt(form.espacios_sin_distancia) || 0,
        alturas_plantas: form.alturas_plantas.map(Number),
        circunferencias_plantas: form.circunferencias_plantas.map(Number)
      }]);

      if (cosechError) {
        console.error("❌ Error en Reporte Cosecha:", cosechError);
        throw cosechError;
      }
      console.log("✅ Reporte Cosecha guardado.");

      // 3. EVALUACIÓN AGRÍCOLA (Sincronizado con nombres de Supabase - Sin la "s" de planta)
      const { error: agriError } = await supabase.from('evaluacion_agricola').insert([{
        maestra_id: idMaestro,
        enfrentamiento_primarios: parseInt(form.enfrentamiento_primarios_agri) || 0,
        planta_mal_eliminada: parseInt(form.planta_mal_eliminada_agri) || 0,
        planta_encerrada: parseInt(form.planta_encerrada_agri) || 0,
        planta_recuperar_sin_intervenir: parseInt(form.planta_recuperar_sin_intervenir_agri) || 0,
        planta_improductiva: parseInt(form.planta_improductiva_agri) || 0,
        espacio_estaquillado_sin_distancia: parseInt(form.espacio_estaquillado_sin_distancia_agri) || 0,
        espacio_sin_estaquillar: parseInt(form.espacio_sin_estaquillar_agri) || 0,
        falta_herramienta_insumo: parseInt(form.falta_herramienta_insumo_agri) || 0,
        planta_huerfana_sin_intervenir: parseInt(form.planta_huerfana_sin_intervenir_agri) || 0,
        resiembra_pobre: parseInt(form.resiembra_pobre_agri) || 0,
        retorno_sin_intervenir: parseInt(form.retorno_sin_intervenir_agri) || 0,
        reina_fuera_especificaciones: parseInt(form.reina_fuera_especificaciones_agri) || 0,
        resiembra_sin_intervenir: parseInt(form.resiembra_sin_intervenir_agri) || 0,
        retorno_sin_seguimiento: parseInt(form.retorno_sin_seguimiento_agri) || 0,
        mala_ejecucion_hercules: parseInt(form.mala_ejecucion_hercules_agri) || 0,
        planta_recuperar_sin_elegir: parseInt(form.planta_recuperar_sin_elegir_agri) || 0,
        arbusto_area_drenajes: parseInt(form.arbusto_area_drenajes_agri) || 0,
        rebrotes_en_drenajes: parseInt(form.rebrotes_en_drenajes_agri) || 0,
        batea_obstruida: parseInt(form.batea_obstruida_agri) || 0,
        bejucos_unidades_produccion: parseInt(form.bejucos_unidades_produccion_agri) || 0,
        espacio_marcado_vena: parseInt(form.espacio_marcado_vena_agri) || 0,
        sin_aporque_barrera: parseInt(form.sin_aporque_barrera_agri) || 0,
        fomy_cintas_sin_recoger: parseInt(form.fomy_cintas_sin_recoger_agri) || 0,
        hueco_sin_tapar: parseInt(form.hueco_sin_tapar_agri) || 0,
        mezcla_clones: parseInt(form.mezcla_clones_agri) || 0,
        planta_bruja: parseInt(form.planta_bruja_agri) || 0,
        racimo_planta_seca_sin_repique: parseInt(form.racimo_planta_seca_sin_repique_agri) || 0,
        planta_con_limite_hojas: parseInt(form.plantas_con_limite_hojas_agri) || 0,
        planta_sin_vampirear: parseInt(form.planta_sin_vampirear_agri) || 0,
        racimo_pobre_bacota_pobre: parseInt(form.racimo_pobre_bacota_pobre_agri) || 0,
        tronco_seco_sin_eliminar: parseInt(form.tronco_seco_sin_eliminar_agri) || 0
      }]);

      if (agriError) {
        console.error("❌ Error en Eval. Agrícola:", agriError);
        throw agriError;
      }
      console.log("✅ Eval. Agrícola guardada.");

      // 4. EVALUACIÓN DESMACHE
      const { error: desmError } = await supabase.from('evaluacion_desmache').insert([{
        maestra_id: idMaestro,
        hijo_rastrero: parseInt(form.hijo_rastrero_desm) || 0,
        enfrentamiento_primarios: parseInt(form.enfrentamiento_primarios_desm) || 0,
        mala_eleccion: parseInt(form.mala_eleccion_desm) || 0,
        desmache_lineal: parseInt(form.desmache_lineal_desm) || 0,
        sin_elegir_orilla: parseInt(form.sin_elegir_orilla_desm) || 0,
        planta_eliminada: parseInt(form.planta_eliminada_desm) || 0,
        hijo_al_drenaje_cable: parseInt(form.hijo_al_drenaje_cable_desm) || 0,
        planta_sin_desmachar: parseInt(form.planta_sin_desmachar_desm) || 0,
        hijos_continuos: parseInt(form.hijos_continuos_desm) || 0,
        rebrote_sin_cortar: parseInt(form.rebrote_sin_cortar_desm) || 0,
        mal_corte: parseInt(form.mal_corte_desm) || 0,
        eleccion_temprana_edad: parseInt(form.eleccion_temprana_edad_desm) || 0,
        cepa_sin_doblar: parseInt(form.cepa_sin_doblar_desm) || 0,
        residuos_drenaje_fertilizacion: parseInt(form.residuos_drenaje_fertilizacion_desm) || 0,
        hueco_sin_tapar: parseInt(form.hueco_sin_tapar_desm) || 0
      }]);

      if (desmError) {
        console.error("❌ Error en Eval. Desmache:", desmError);
        throw desmError;
      }
      console.log("✅ Eval. Desmache guardada.");

      alert("🎉 ¡TODO SE GUARDÓ PERFECTAMENTE!");
      window.location.reload();

    } catch (err) {
      console.error("💥 FALLO CRÍTICO:", err);
      alert("❌ ERROR AL GUARDAR:\n" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      {paso === 1 && (
        <>
          <h2 style={{ color: '#1b5e20', textAlign: 'center', marginBottom: '25px' }}>Paso 1: Información Maestra</h2>
          <form onSubmit={irACapturaRobusta}>
            <div style={cardStyle}>
              <h4 style={titleStyle}>📍 Ubicación</h4>
              <Input8Metros etiqueta="Finca" esSelect valor={form.finca_id} alCambiar={(v) => handleInputChange('finca_id', v)}>
                <option value="">-- Seleccione Finca --</option>
                {fincas.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </Input8Metros>

              {form.finca_id && fincas.find(f => f.id === parseInt(form.finca_id))?.zona && (
                <div style={{ marginTop: '-10px', marginBottom: '10px', fontSize: '13px', color: '#1565c0', fontWeight: 'bold', backgroundColor: '#e3f2fd', padding: '4px 10px', borderRadius: '4px', display: 'inline-block' }}>
                  🌍 Zona: {fincas.find(f => f.id === parseInt(form.finca_id)).zona}
                </div>
              )}

              <Input8Metros etiqueta="Variedad (Clon)" esSelect valor={form.clon_id} alCambiar={(v) => handleInputChange('clon_id', v)}>
                <option value="">-- Seleccione Variedad --</option>
                {clones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Input8Metros>
            </div>
             <div style={cardStyle}>
               <h4 style={titleStyle}>👥 Responsables</h4>
               <Input8Metros etiqueta="Evaluador" esSelect valor={form.evaluador_id} alCambiar={(v) => handleInputChange('evaluador_id', v)}>
                 <option value="">-- ¿Quién evalúa? --</option>
                 {operarios.filter(op => op.rol === 'Evaluador' || op.rol === 'Ambos').map(op => <option key={op.id} value={op.id}>{op.nombre}</option>)}
               </Input8Metros>
               <div style={{ display: 'flex', gap: '10px' }}>
                 <Input8Metros etiqueta="Agri." esSelect valor={form.agricultor_id} alCambiar={(v) => handleInputChange('agricultor_id', v)}>
                   <option value="">-- Seleccione --</option>
                   {operarios.filter(op => op.rol === 'Agricultor' || op.rol === 'Ambos').map(op => <option key={op.id} value={op.id}>{op.nombre}</option>)}
                 </Input8Metros>
                 <Input8Metros etiqueta="Desm." esSelect valor={form.desmachador_id} alCambiar={(v) => handleInputChange('desmachador_id', v)}>
                   <option value="">-- Seleccione --</option>
                   {operarios.filter(op => op.rol === 'Desmachador' || op.rol === 'Ambos').map(op => <option key={op.id} value={op.id}>{op.nombre}</option>)}
                 </Input8Metros>
               </div>
             </div>
             <div style={cardStyle}>
               <h4 style={titleStyle}>📝 Lote y Área</h4>
               <div style={{ display: 'flex', gap: '10px' }}>
                 <Input8Metros etiqueta="Lote" tipo="text" valor={form.lote} alCambiar={(v) => handleInputChange('lote', v)} />
                 <Input8Metros etiqueta="Semana" tipo="number" valor={form.semana} alCambiar={(v) => handleInputChange('semana', v)} />
                 <Input8Metros etiqueta="Área (Ha)" tipo="number" valor={form.area_ha} alCambiar={(v) => handleInputChange('area_ha', v)} />
               </div>
             </div>
            <div style={gpsStyle(form.latitud_wgs84)}>
              {form.latitud_wgs84 ? `📍 GPS: ${form.latitud_wgs84.toFixed(5)}, ${form.longitud_wgs84.toFixed(5)}` : "⌛ Obteniendo GPS..."}
            </div>
            <BotonGuardar cargando={false} texto="Continuar a Toma de Datos" />
            <button type="button" onClick={() => window.location.href = '/'} style={btnBackStyle}>Regresar al Menú</button>
          </form>
        </>
      )}

      {paso === 2 && (
        <div style={{ paddingBottom: '40px' }}>
          <h2 style={{ color: '#1b5e20', textAlign: 'center', marginBottom: '25px' }}>Paso 2: Datos de Campo</h2>
          <div style={cardStyle}>
             <h4 style={titleStyle}>📏 Biometría (25 Datos)</h4>
             <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
               <div style={statCardStyle}>
                 <div style={statHeaderStyle}>ALTURA (cm)</div>
                 <div style={statRowStyle}><span>Prom:</span> <b>{calcularStats(form.alturas_plantas).avg}</b></div>
                 <div style={statRowStyle}><span>Máx:</span> <b>{calcularStats(form.alturas_plantas).max}</b></div>
                 <div style={statRowStyle}><span>Mín:</span> <b>{calcularStats(form.alturas_plantas).min}</b></div>
               </div>
               <div style={statCardStyle}>
                 <div style={statHeaderStyle}>CIRCUNF. (cm)</div>
                 <div style={statRowStyle}><span>Prom:</span> <b>{calcularStats(form.circunferencias_plantas).avg}</b></div>
                 <div style={statRowStyle}><span>Máx:</span> <b>{calcularStats(form.circunferencias_plantas).max}</b></div>
                 <div style={statRowStyle}><span>Mín:</span> <b>{calcularStats(form.circunferencias_plantas).min}</b></div>
               </div>
             </div>
             <details>
               <summary style={{ cursor: 'pointer', color: '#2e7d32', fontWeight: 'bold', textAlign: 'center' }}>✏️ Tocar para ingresar 25 datos</summary>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', marginTop: '10px' }}>
                 {form.alturas_plantas.map((_, i) => (
                   <div key={i} style={{ border: '1px solid #ddd', padding: '2px' }}>
                     <input placeholder="Alt" style={miniInput} value={form.alturas_plantas[i]} onChange={(e) => handleArrayChange(i, e.target.value, 'alturas_plantas')} />
                     <input placeholder="Cir" style={miniInput} value={form.circunferencias_plantas[i]} onChange={(e) => handleArrayChange(i, e.target.value, 'circunferencias_plantas')} />
                   </div>
                 ))}
               </div>
             </details>
           </div>
 
           <div style={cardStyle}>
             <h4 style={titleStyle}>📊 Resumen de Población</h4>
             <div style={resumenCosechaStyle}>
               <div style={statRowStyle}><span>Plantas Evaluadas:</span> <b>{calcularResumenCosecha().total}</b></div>
               <div style={statRowStyle}><span>Plantas / Ha:</span> <b style={{color: '#c62828'}}>{calcularResumenCosecha().plantasHa}</b></div>
             </div>
           </div>

          <details style={cardStyle}>
            <summary style={titleStyle}>🍎 Reporte Cosecha</summary>
            <div style={grid2Col}>
              <ControlContador etiqueta="P. Prontas" campo="plantas_prontas" valor={form.plantas_prontas} />
              <ControlContador etiqueta="A Recuperar" campo="planta_a_recuperar" valor={form.planta_a_recuperar} />
              <ControlContador etiqueta="Improductivas" campo="plantas_improductivas" valor={form.plantas_improductivas} />
              <ControlContador etiqueta="Huérfanas" campo="plantas_huerfanas" valor={form.plantas_huerfanas} />
            </div>

            <h5 style={{color: '#2e7d32', margin: '15px 0 10px 0'}}>Producción Pronta (Semanas)</h5>
            
            <div style={{ marginBottom: '15px' }}>
              <Input8Metros etiqueta="Color Cinta Sem 1" esSelect valor={form.color_inicio} alCambiar={(v) => handleInputChange('color_inicio', v)}>
                <option value="">-- Seleccione Color --</option>
                {ORDEN_COLORES.map(col => <option key={col} value={col}>{col}</option>)}
              </Input8Metros>
            </div>

            <div style={grid2Col}>
              <ControlContador etiqueta="PP Bacota" campo="pp_bacota" valor={form.pp_bacota} />
              {[...Array(11)].map((_, i) => {
                const numSemana = i + 1;
                const campo = `pp_${numSemana}semanas`;
                let bgColor = '#ffffff';
                if (form.color_inicio) {
                  const idx = ORDEN_COLORES.indexOf(form.color_inicio);
                  const colorActual = ORDEN_COLORES[(idx + i) % ORDEN_COLORES.length];
                  bgColor = MAPA_COLORES_HEX[colorActual];
                }
                return (
                  <div key={i} style={{ backgroundColor: bgColor, borderRadius: '8px', padding: '4px', border: '1px solid #eee' }}>
                    <ControlContador etiqueta={`PP Sem ${numSemana}`} campo={campo} valor={form[campo]} />
                  </div>
                );
              })}
            </div>
            
             <h5 style={{color: '#2e7d32', margin: '15px 0 10px 0'}}>Calibres PC y PJ</h5>
             <div style={grid2Col}>
               <ControlContador etiqueta="PC 2-2.5" campo="pc_2_2_5" valor={form.pc_2_2_5} />
               <ControlContador etiqueta="PC 2.5-3" campo="pc_2_5_3" valor={form.pc_2_5_3} />
               <ControlContador etiqueta="PC 3-3.5" campo="pc_3_3_5" valor={form.pc_3_3_5} />
               <ControlContador etiqueta="PJ 2-2.5" campo="pj_2_2_5" valor={form.pj_2_2_5} />
               <ControlContador etiqueta="PJ 2.5-3" campo="pj_2_5_3" valor={form.pj_2_5_3} />
               <ControlContador etiqueta="PJ > 3" campo="pj_mas_3" valor={form.pj_mas_3} />
             </div>
             <h5 style={{color: '#2e7d32', margin: '15px 0 10px 0'}}>Resiembras, Reinas y Espacios</h5>
             <div style={grid2Col}>
               <ControlContador etiqueta="Resiembra c/d" campo="resiembra_con_distancia" valor={form.resiembra_con_distancia} />
               <ControlContador etiqueta="Resiembra s/d" campo="resiembra_sin_distancia" valor={form.resiembra_sin_distancia} />
               <ControlContador etiqueta="Reina c/d" campo="planta_reinas_con_distancia" valor={form.planta_reinas_con_distancia} />
               <ControlContador etiqueta="Reina s/d" campo="planta_reina_sin_distancia" valor={form.planta_reina_sin_distancia} />
               <ControlContador etiqueta="Elim. Bien" campo="plantas_eliminadas_bien" valor={form.plantas_eliminadas_bien} />
               <ControlContador etiqueta="Elim. Mal" campo="plantas_eliminadas_mal" valor={form.plantas_eliminadas_mal} />
               <ControlContador etiqueta="Espacio c/d" campo="espacios_con_distancia" valor={form.espacios_con_distancia} />
               <ControlContador etiqueta="Espacio s/d" campo="espacios_sin_distancia" valor={form.espacios_sin_distancia} />
             </div>
          </details>
          
          <div style={cardStyle}>
             <h4 style={titleStyle}>📉 Resumen de Calidad Técnica</h4>
             <div style={resumenCosechaStyle}>
               <div style={statRowStyle}><span>Total Defectos Agrícola:</span><b>{obtenerCalculosCalidad().totalAgri}</b></div>
               <div style={statRowStyle}><span>Calidad Agrícola:</span><b style={{color: '#2e7d32'}}>{obtenerCalculosCalidad().porcAgri}%</b></div>
               <hr style={{margin: '5px 0', opacity: 0.2}} />
               <div style={statRowStyle}><span>Total Defectos Desmache:</span><b>{obtenerCalculosCalidad().totalDesm}</b></div>
               <div style={statRowStyle}><span>Calidad Desmache:</span><b style={{color: '#1565c0'}}>{obtenerCalculosCalidad().porcDesm}%</b></div>
             </div>
           </div>
 
           <details style={cardStyle}>
             <summary style={titleStyle}>🚜 Defectos Agrícola y Desmache</summary>
             <h5 style={{color: '#2e7d32'}}>Agrícola</h5>
             <div style={grid2Col}>
               <ControlContador etiqueta="Enfrent. Prim." campo="enfrentamiento_primarios_agri" valor={form.enfrentamiento_primarios_agri} />
               <ControlContador etiqueta="Mal Eliminada" campo="planta_mal_eliminada_agri" valor={form.planta_mal_eliminada_agri} />
               <ControlContador etiqueta="P. Encerrada" campo="planta_encerrada_agri" valor={form.planta_encerrada_agri} />
               <ControlContador etiqueta="Recup s/Inter" campo="planta_recuperar_sin_intervenir_agri" valor={form.planta_recuperar_sin_intervenir_agri} />
               <ControlContador etiqueta="P. Improductiva" campo="planta_improductiva_agri" valor={form.planta_improductiva_agri} />
               <ControlContador etiqueta="Estaq s/Dist" campo="espacio_estaquillado_sin_distancia_agri" valor={form.espacio_estaquillado_sin_distancia_agri} />
               <ControlContador etiqueta="Sin Estaquillar" campo="espacio_sin_estaquillar_agri" valor={form.espacio_sin_estaquillar_agri} />
               <ControlContador etiqueta="Falta Herram." campo="falta_herramienta_insumo_agri" valor={form.falta_herramienta_insumo_agri} />
               <ControlContador etiqueta="Huérf s/Inter" campo="planta_huerfana_sin_intervenir_agri" valor={form.planta_huerfana_sin_intervenir_agri} />
               <ControlContador etiqueta="Resiemb Pobre" campo="resiembra_pobre_agri" valor={form.resiembra_pobre_agri} />
               <ControlContador etiqueta="Retorno s/Int" campo="retorno_sin_intervenir_agri" valor={form.retorno_sin_intervenir_agri} />
               <ControlContador etiqueta="Reina f/Espec" campo="reina_fuera_especificaciones_agri" valor={form.reina_fuera_especificaciones_agri} />
               <ControlContador etiqueta="Resiemb s/Int" campo="resiembra_sin_intervenir_agri" valor={form.resiembra_sin_intervenir_agri} />
               <ControlContador etiqueta="Retorno s/Seg" campo="retorno_sin_seguimiento_agri" valor={form.retorno_sin_seguimiento_agri} />
               <ControlContador etiqueta="Mala Ej Hercules" campo="mala_ejecucion_hercules_agri" valor={form.mala_ejecucion_hercules_agri} />
               <ControlContador etiqueta="Recup s/Eleg" campo="planta_recuperar_sin_elegir_agri" valor={form.planta_recuperar_sin_elegir_agri} />
               <ControlContador etiqueta="Arbusto Dren" campo="arbusto_area_drenajes_agri" valor={form.arbusto_area_drenajes_agri} />
               <ControlContador etiqueta="Rebrote Dren" campo="rebrotes_en_drenajes_agri" valor={form.rebrotes_en_drenajes_agri} />
               <ControlContador etiqueta="Batea Obstrui" campo="batea_obstruida_agri" valor={form.batea_obstruida_agri} />
               <ControlContador etiqueta="Bejucos U.P" campo="bejucos_unidades_produccion_agri" valor={form.bejucos_unidades_produccion_agri} />
               <ControlContador etiqueta="Marcado Vena" campo="espacio_marcado_vena_agri" valor={form.espacio_marcado_vena_agri} />
               <ControlContador etiqueta="Sin Aporque" campo="sin_aporque_barrera_agri" valor={form.sin_aporque_barrera_agri} />
               <ControlContador etiqueta="Cintas s/Rec" campo="fomy_cintas_sin_recoger_agri" valor={form.fomy_cintas_sin_recoger_agri} />
               <ControlContador etiqueta="Hueco s/Tapar" campo="hueco_sin_tapar_agri" valor={form.hueco_sin_tapar_agri} />
               <ControlContador etiqueta="Mezcla Clones" campo="mezcla_clones_agri" valor={form.mezcla_clones_agri} />
               <ControlContador etiqueta="Planta Bruja" campo="planta_bruja_agri" valor={form.planta_bruja_agri} />
               <ControlContador etiqueta="Racimo s/Rep" campo="racimo_planta_seca_sin_repique_agri" valor={form.racimo_planta_seca_sin_repique_agri} />
               <ControlContador etiqueta="Limite Hojas" campo="plantas_con_limite_hojas_agri" valor={form.plantas_con_limite_hojas_agri} />
               <ControlContador etiqueta="Sin Vampirear" campo="planta_sin_vampirear_agri" valor={form.planta_sin_vampirear_agri} />
               <ControlContador etiqueta="Racimo Pobre" campo="racimo_pobre_bacota_pobre_agri" valor={form.racimo_pobre_bacota_pobre_agri} />
               <ControlContador etiqueta="Tronco s/Elim" campo="tronco_seco_sin_eliminar_agri" valor={form.tronco_seco_sin_eliminar_agri} />
             </div>
             <h5 style={{color: '#2e7d32', marginTop: '15px'}}>Desmache</h5>
             <div style={grid2Col}>
               <ControlContador etiqueta="Hijo Rastrero" campo="hijo_rastrero_desm" valor={form.hijo_rastrero_desm} />
               <ControlContador etiqueta="Enfrent Prim" campo="enfrentamiento_primarios_desm" valor={form.enfrentamiento_primarios_desm} />
               <ControlContador etiqueta="Mala Eleccion" campo="mala_eleccion_desm" valor={form.mala_eleccion_desm} />
               <ControlContador etiqueta="Desmache Line" campo="desmache_lineal_desm" valor={form.desmache_lineal_desm} />
               <ControlContador etiqueta="Sin Eleg Ori" campo="sin_elegir_orilla_desm" valor={form.sin_elegir_orilla_desm} />
               <ControlContador etiqueta="Plta Elimina" campo="planta_eliminada_desm" valor={form.planta_eliminada_desm} />
               <ControlContador etiqueta="Hijo Dren/Cab" campo="hijo_al_drenaje_cable_desm" valor={form.hijo_al_drenaje_cable_desm} />
               <ControlContador etiqueta="Plta s/Desm" campo="planta_sin_desmachar_desm" valor={form.planta_sin_desmachar_desm} />
               <ControlContador etiqueta="Hijos Contin" campo="hijos_continuos_desm" valor={form.hijos_continuos_desm} />
               <ControlContador etiqueta="Rebrote s/Cor" campo="rebrote_sin_cortar_desm" valor={form.rebrote_sin_cortar_desm} />
               <ControlContador etiqueta="Mal Corte" campo="mal_corte_desm" valor={form.mal_corte_desm} />
               <ControlContador etiqueta="Elecc Tempr" campo="eleccion_temprana_edad_desm" valor={form.eleccion_temprana_edad_desm} />
               <ControlContador etiqueta="Cepa s/Doblar" campo="cepa_sin_doblar_desm" valor={form.cepa_sin_doblar_desm} />
               <ControlContador etiqueta="Resid Drenaje" campo="residuos_drenaje_fertilizacion_desm" valor={form.residuos_drenaje_fertilizacion_desm} />
               <ControlContador etiqueta="Hueco s/Tapa" campo="hueco_sin_tapar_desm" valor={form.hueco_sin_tapar_desm} />
             </div>
           </details>
 
           <BotonGuardar cargando={loading} texto="Guardar Todo" alHacerClic={guardarTodoElFormulario} />
           <button onClick={() => setPaso(1)} style={btnBackStyle}>Regresar</button>
        </div>
      )}
    </div>
  );
};

// --- ESTILOS ---
const btnContadorStyle = { backgroundColor: '#1b5e20', color: 'white', border: 'none', borderRadius: '4px', width: '28px', height: '28px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px' };
const cardStyle = { background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '15px' };
const titleStyle = { marginTop: 0, marginBottom: '10px', color: '#2e7d32', fontSize: '15px', fontWeight: 'bold' };
const grid2Col = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' };
const miniInput = { width: '100%', border: 'none', fontSize: '12px', padding: '4px', textAlign: 'center' };
const gpsStyle = (active) => ({ textAlign: 'center', fontSize: '12px', color: active ? '#2e7d32' : '#e65100', marginBottom: '15px', fontWeight: 'bold' });
const statCardStyle = { flex: 1, backgroundColor: '#f8faf8', borderRadius: '10px', border: '1px solid #e0e0e0', padding: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const statHeaderStyle = { fontSize: '11px', color: '#1b5e20', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #d0d0d0', marginBottom: '8px', paddingBottom: '4px' };
const statRowStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#333', marginBottom: '3px' };
const btnBackStyle = { width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer' };
const resumenCosechaStyle = { backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '8px', border: '1px solid #c8e6c9', marginBottom: '5px', display: 'flex', flexDirection: 'column', gap: '8px' };

export default FormularioAgricultura;