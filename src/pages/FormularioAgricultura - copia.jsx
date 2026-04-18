import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import Input8Metros from '../components/Input8Metros';
import BotonGuardar from '../components/BotonGuardar';

const FormularioAgricultura = () => {
  const [loading, setLoading] = useState(false);
  const [fincas, setFincas] = useState([]);
  const [operarios, setOperarios] = useState([]);
  const [clones, setClones] = useState([]);
  const [paso, setPaso] = useState(1);

  const [form, setForm] = useState({
    finca_id: '', clon_id: '', agricultor_id: '', desmachador_id: '', evaluador_id: '',
    lote: '', semana: '', area_ha: '', punto_muestreo: 1, latitud_wgs84: null, longitud_wgs84: null,
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
    enfrentamiento_primarios_agri: 0, planta_mal_eliminada_agri: 0, planta_encerrada_agri: 0,
    planta_recuperar_sin_intervenir_agri: 0, planta_improductiva_agri: 0, espacio_estaquillado_sin_distancia_agri: 0,
    espacio_sin_estaquillar_agri: 0, falta_herramienta_insumo_agri: 0, planta_huerfana_sin_intervenir_agri: 0,
    resiembra_pobre_agri: 0, retorno_sin_intervenir_agri: 0, reina_fuera_especificaciones_agri: 0,
    resiembra_sin_intervenir_agri: 0, retorno_sin_seguimiento_agri: 0, mala_ejecucion_hercules_agri: 0,
    planta_recuperar_sin_elegir_agri: 0, arbusto_area_drenajes_agri: 0, rebrotes_en_drenajes_agri: 0,
    batea_obstruida_agri: 0, bejucos_unidades_produccion_agri: 0, espacio_marcado_vena_agri: 0,
    sin_aporque_barrera_agri: 0, fomy_cintas_sin_recoger_agri: 0, hueco_sin_tapar_agri: 0,
    mezcla_clones_agri: 0, planta_bruja_agri: 0, racimo_planta_seca_sin_repique_agri: 0,
    planta_con_limite_hojas_agri: 0, planta_sin_vampirear_agri: 0, racimo_pobre_bacota_pobre_agri: 0,
    tronco_seco_sin_eliminar_agri: 0,
    hijo_rastrero_desm: 0, enfrentamiento_primarios_desm: 0, mala_eleccion_desm: 0, desmache_lineal_desm: 0,
    sin_elegir_orilla_desm: 0, planta_eliminada_desm: 0, hijo_al_drenaje_cable_desm: 0,
    planta_sin_desmachar_desm: 0, hijos_continuos_desm: 0, rebrote_sin_cortar_desm: 0,
    mal_corte_desm: 0, eleccion_temprana_edad_desm: 0, cepa_sin_doblar_desm: 0,
    residuos_drenaje_fertilizacion_desm: 0, hueco_sin_tapar_desm: 0
  });

  useEffect(() => {
    const cargarDatosMaestros = async () => {
      try {
        const { data: f } = await supabase.from('tabla_fincas').select('id, nombre').eq('activo', true).order('nombre');
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
      <button type="button" onClick={() => handleInputChange(campo, Math.max(0, parseInt(valor || 0) - 1))} style={btnContadorStyle}>-</button>
      <div style={{ flex: 1 }}><Input8Metros etiqueta={etiqueta} tipo="number" valor={valor} alCambiar={(v) => handleInputChange(campo, v)} /></div>
      <button type="button" onClick={() => handleInputChange(campo, parseInt(valor || 0) + 1)} style={btnContadorStyle}>+</button>
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
    const camposPoblacion = ['plantas_prontas', 'planta_a_recuperar', 'plantas_improductivas', 'plantas_huerfanas', 'pp_bacota', 'pp_1semanas', 'pp_2semanas', 'pp_3semanas', 'pp_4semanas', 'pp_5semanas', 'pp_6semanas', 'pp_7semanas', 'pp_8semanas', 'pp_9semanas', 'pp_10semanas', 'pp_11semanas', 'pc_2_2_5', 'pc_2_5_3', 'pc_3_3_5', 'pj_2_2_5', 'pj_2_5_3', 'pj_mas_3', 'resiembra_con_distancia', 'resiembra_sin_distancia', 'planta_reinas_con_distancia', 'planta_reina_sin_distancia'];
    const totalPlantas = camposPoblacion.reduce((acc, campo) => acc + (parseInt(form[campo]) || 0), 0);
    return { total: totalPlantas, plantasHa: totalPlantas * 50 };
  };

  const obtenerCalculosCalidad = () => {
    const plantasEval = calcularResumenCosecha().total;
    const camposAgri = Object.keys(form).filter(k => k.endsWith('_agri'));
    const totalAgri = camposAgri.reduce((acc, c) => acc + (parseInt(form[c]) || 0), 0);
    const camposDesm = Object.keys(form).filter(k => k.endsWith('_desm'));
    const totalDesm = camposDesm.reduce((acc, c) => acc + (parseInt(form[c]) || 0), 0);
    return { totalAgri, totalDesm, porcAgri: plantasEval > 0 ? (1 - (totalAgri / plantasEval) * 100).toFixed(2) : "0.00", porcDesm: plantasEval > 0 ? (1 - (totalDesm / plantasEval) * 100).toFixed(2) : "0.00" };
  };

  const irACapturaRobusta = (e) => { e.preventDefault(); if (!form.finca_id || !form.evaluador_id || !form.clon_id) { alert("⚠️ Finca, Variedad y Evaluador son obligatorios."); return; } setPaso(2); };

  // --- FUNCIÓN DE GUARDADO REAL ACTUALIZADA ---
  const guardarTodoElFormulario = async () => {
    setLoading(true);
    try {
      // 1. Insertar Cabecera
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

      if (maestraError) throw maestraError;
      const idMaestro = maestraData[0].id;

      // 2. Insertar Detalles
      const { error: err1 } = await supabase.from('reportes_cosecha').insert([{
        maestra_id: idMaestro,
        plantas_prontas: parseInt(form.plantas_prontas),
        planta_a_recuperar: parseInt(form.planta_a_recuperar),
        plantas_improductivas: parseInt(form.plantas_improductivas),
        plantas_huerfanas: parseInt(form.plantas_huerfanas),
        pp_bacota: parseInt(form.pp_bacota),
        pp_1semanas: parseInt(form.pp_1semanas), pp_2semanas: parseInt(form.pp_2semanas), pp_3semanas: parseInt(form.pp_3semanas), pp_4semanas: parseInt(form.pp_4semanas), pp_5semanas: parseInt(form.pp_5semanas), pp_6semanas: parseInt(form.pp_6semanas), pp_7semanas: parseInt(form.pp_7semanas), pp_8semanas: parseInt(form.pp_8semanas), pp_9semanas: parseInt(form.pp_9semanas), pp_10semanas: parseInt(form.pp_10semanas), pp_11semanas: parseInt(form.pp_11semanas),
        pc_2_2_5: parseInt(form.pc_2_2_5), pc_2_5_3: parseInt(form.pc_2_5_3), pc_3_3_5: parseInt(form.pc_3_3_5), pj_2_2_5: parseInt(form.pj_2_2_5), pj_2_5_3: parseInt(form.pj_2_5_3), pj_mas_3: parseInt(form.pj_mas_3),
        resiembra_con_distancia: parseInt(form.resiembra_con_distancia), resiembra_sin_distancia: parseInt(form.resiembra_sin_distancia), planta_reinas_con_distancia: parseInt(form.planta_reinas_con_distancia), planta_reina_sin_distancia: parseInt(form.planta_reina_sin_distancia), plantas_eliminadas_bien: parseInt(form.plantas_eliminadas_bien), plantas_eliminadas_mal: parseInt(form.plantas_eliminadas_mal), espacios_con_distancia: parseInt(form.espacios_con_distancia), espacios_sin_distancia: parseInt(form.espacios_sin_distancia),
        alturas_plantas: form.alturas_plantas.map(Number), circunferencias_plantas: form.circunferencias_plantas.map(Number)
      }]);

      const { error: err2 } = await supabase.from('evaluacion_agricola').insert([{
        maestra_id: idMaestro,
        enfrentamiento_primarios: parseInt(form.enfrentamiento_primarios_agri), planta_mal_eliminada: parseInt(form.planta_mal_eliminada_agri), planta_encerrada: parseInt(form.planta_encerrada_agri), planta_recuperar_sin_intervenir: parseInt(form.planta_recuperar_sin_intervenir_agri), planta_improductiva: parseInt(form.planta_improductiva_agri), espacio_estaquillado_sin_distancia: parseInt(form.espacio_estaquillado_sin_distancia_agri), espacio_sin_estaquillar: parseInt(form.espacio_sin_estaquillar_agri), falta_herramienta_insumo: parseInt(form.falta_herramienta_insumo_agri), planta_huerfana_sin_intervenir: parseInt(form.planta_huerfana_sin_intervenir_agri), resiembra_pobre: parseInt(form.resiembra_pobre_agri), retorno_sin_intervenir: parseInt(form.retorno_sin_intervenir_agri), reina_fuera_especificaciones: parseInt(form.reina_fuera_especificaciones_agri), resiembra_sin_intervenir: parseInt(form.resiembra_sin_intervenir_agri), retorno_sin_seguimiento: parseInt(form.retorno_sin_seguimiento_agri), mala_ejecucion_hercules: parseInt(form.mala_ejecucion_hercules_agri), planta_recuperar_sin_elegir: parseInt(form.planta_recuperar_sin_elegir_agri), arbusto_area_drenajes: parseInt(form.arbusto_area_drenajes_agri), rebrotes_en_drenajes: parseInt(form.rebrotes_en_drenajes_agri), batea_obstruida: parseInt(form.batea_obstruida_agri), bejucos_unidades_produccion: parseInt(form.bejucos_unidades_produccion_agri), espacio_marcado_vena: parseInt(form.espacio_marcado_vena_agri), sin_aporque_barrera: parseInt(form.sin_aporque_barrera_agri), fomy_cintas_sin_recoger: parseInt(form.fomy_cintas_sin_recoger_agri), hueco_sin_tapar: parseInt(form.hueco_sin_tapar_agri), mezcla_clones: parseInt(form.mezcla_clones_agri), planta_bruja: parseInt(form.planta_bruja_agri), racimo_planta_seca_sin_repique: parseInt(form.racimo_planta_seca_sin_repique_agri), planta_con_limite_hojas: parseInt(form.planta_con_limite_hojas_agri), planta_sin_vampirear: parseInt(form.planta_sin_vampirear_agri), racimo_pobre_bacota_pobre: parseInt(form.racimo_pobre_bacota_pobre_agri), tronco_seco_sin_eliminar: parseInt(form.tronco_seco_sin_eliminar_agri)
      }]);

      const { error: err3 } = await supabase.from('evaluacion_desmache').insert([{
        maestra_id: idMaestro,
        hijo_rastrero: parseInt(form.hijo_rastrero_desm), enfrentamiento_primarios: parseInt(form.enfrentamiento_primarios_desm), mala_eleccion: parseInt(form.mala_eleccion_desm), desmache_lineal: parseInt(form.desmache_lineal_desm), sin_elegir_orilla: parseInt(form.sin_elegir_orilla_desm), planta_eliminada: parseInt(form.planta_eliminada_desm), hijo_al_drenaje_cable: parseInt(form.hijo_al_drenaje_cable_desm), planta_sin_desmachar: parseInt(form.planta_sin_desmachar_desm), hijos_continuos: parseInt(form.hijos_continuos_desm), rebrote_sin_cortar: parseInt(form.rebrote_sin_cortar_desm), mal_corte: parseInt(form.mal_corte_desm), eleccion_temprana_edad: parseInt(form.eleccion_temprana_edad_desm), cepa_sin_doblar: parseInt(form.cepa_sin_doblar_desm), residuos_drenaje_fertilizacion: parseInt(form.residuos_drenaje_fertilizacion_desm), hueco_sin_tapar: parseInt(form.hueco_sin_tapar_desm)
      }]);

      if (err1 || err2 || err3) throw (err1 || err2 || err3);

      alert("✅ ¡Todo guardado con éxito!");
      window.location.reload();
    } catch (err) { 
      console.error("Error detallado:", err);
      alert("❌ Error: " + err.message); 
    } finally { setLoading(false); }
  };

  // ... (El resto del return y estilos se mantienen exactamente iguales)