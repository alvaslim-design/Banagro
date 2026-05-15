import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import Input8Metros from '../components/Input8Metros';
import BotonGuardar from '../components/BotonGuardar';

const ORDEN_COLORES = ['Naranja', 'Negra', 'Café', 'Roja', 'Azul', 'Blanca', 'Amarilla', 'Verde'];
const MAPA_COLORES_HEX = {
  'Naranja': '#ffe0b2', 'Negra': '#cfd8dc', 'Café': '#d7ccc8', 'Roja': '#ffcdd2',
  'Azul': '#bbdefb', 'Blanca': '#ffffff', 'Amarilla': '#fff9c4', 'Verde': '#c8e6c9'
};

const EditarReporte = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paso, setPaso] = useState(1);
  const [fincas, setFincas] = useState([]);
  const [operarios, setOperarios] = useState([]);
  const [clones, setClones] = useState([]);

  const [form, setForm] = useState({
    // --- PASO 1 ---
    finca_id: '', clon_id: '', agricultor_id: '', desmachador_id: '', evaluador_id: '',
    lote: '', semana: '', area_ha: '', punto_muestreo: 1, color_inicio: '', observaciones_operador: '',
    
    // --- PASO 2: COSECHA COMPLETO ---
    plantas_prontas: 0, planta_a_recuperar: 0, plantas_improductivas: 0, plantas_huerfanas: 0,
    pp_bacota: 0, pp_1semanas: 0, pp_2semanas: 0, pp_3semanas: 0, pp_4semanas: 0, pp_5semanas: 0,
    pp_6semanas: 0, pp_7semanas: 0, pp_8semanas: 0, pp_9semanas: 0, pp_10semanas: 0, pp_11semanas: 0,
    pc_2_2_5: 0, pc_2_5_3: 0, pc_3_3_5: 0, pj_2_2_5: 0, pj_2_5_3: 0, pj_mas_3: 0,
    resiembra_con_distancia: 0, resiembra_sin_distancia: 0, 
    planta_reinas_con_distancia: 0, planta_reina_sin_distancia: 0,
    plantas_eliminadas_bien: 0, plantas_eliminadas_mal: 0,
    espacios_con_distancia: 0, espacios_sin_distancia: 0,
    alturas_plantas: Array(25).fill(''), circunferencias_plantas: Array(25).fill(''),

    // --- EVALUACIONES (AGRI / DESM) ---
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
    hijo_rastrero_desm: 0, enfrentamiento_primarios_desm: 0, mala_eleccion_desm: 0, desmache_lineal_desm: 0,
    sin_elegir_orilla_desm: 0, planta_eliminada_desm: 0, hijo_al_drenaje_cable_desm: 0,
    planta_sin_desmachar_desm: 0, hijos_continuos_desm: 0, rebrote_sin_cortar_desm: 0,
    mal_corte_desm: 0, eleccion_temprana_edad_desm: 0, cepa_sin_doblar_desm: 0,
    residuos_drenaje_fertilizacion_desm: 0, hueco_sin_tapar_desm: 0
  });

  useEffect(() => {
    const cargarTodo = async () => {
      setLoading(true);
      try {
        const { data: f } = await supabase.from('tabla_fincas').select('*').eq('activo', true).order('nombre');
        const { data: o } = await supabase.from('tabla_operarios').select('*').eq('activo', true).order('nombre');
        const { data: c } = await supabase.from('table_clon').select('*').eq('activo', true).order('nombre');
        setFincas(f || []); setOperarios(o || []); setClones(c || []);

        const { data: m } = await supabase.from('tabla_maestra').select('*').eq('id', id).single();
        const { data: rc } = await supabase.from('reportes_cosecha').select('*').eq('maestra_id', id).single();
        const { data: ea } = await supabase.from('evaluacion_agricola').select('*').eq('maestra_id', id).single();
        const { data: ed } = await supabase.from('evaluacion_desmache').select('*').eq('maestra_id', id).single();

        if (m) {
          setForm(prev => ({
            ...prev,
            ...m, ...rc,
            enfrentamiento_primarios_agri: ea?.enfrentamiento_primarios || 0,
            planta_mal_eliminada_agri: ea?.planta_mal_eliminada || 0,
            planta_encerrada_agri: ea?.planta_encerrada || 0,
            planta_recuperar_sin_intervenir_agri: ea?.planta_recuperar_sin_intervenir || 0,
            planta_improductiva_agri: ea?.planta_improductiva || 0,
            espacio_estaquillado_sin_distancia_agri: ea?.espacio_estaquillado_sin_distancia || 0,
            espacio_sin_estaquillar_agri: ea?.espacio_sin_estaquillar || 0,
            falta_herramienta_insumo_agri: ea?.falta_herramienta_insumo || 0,
            planta_huerfana_sin_intervenir_agri: ea?.planta_huerfana_sin_intervenir || 0,
            resiembra_pobre_agri: ea?.resiembra_pobre || 0,
            retorno_sin_intervenir_agri: ea?.retorno_sin_intervenir || 0,
            reina_fuera_especificaciones_agri: ea?.reina_fuera_especificaciones || 0,
            resiembra_sin_intervenir_agri: ea?.resiembra_sin_intervenir || 0,
            retorno_sin_seguimiento_agri: ea?.retorno_sin_seguimiento || 0,
            mala_ejecucion_hercules_agri: ea?.mala_ejecucion_hercules || 0,
            planta_recuperar_sin_elegir_agri: ea?.planta_recuperar_sin_elegir || 0,
            arbusto_area_drenajes_agri: ea?.arbusto_area_drenajes || 0,
            rebrotes_en_drenajes_agri: ea?.rebrotes_en_drenajes || 0,
            batea_obstruida_agri: ea?.batea_obstruida || 0,
            bejucos_unidades_produccion_agri: ea?.bejucos_unidades_produccion || 0,
            espacio_marcado_vena_agri: ea?.espacio_marcado_vena || 0,
            sin_aporque_barrera_agri: ea?.sin_aporque_barrera || 0,
            fomy_cintas_sin_recoger_agri: ea?.fomy_cintas_sin_recoger || 0,
            hueco_sin_tapar_agri: ea?.hueco_sin_tapar || 0,
            mezcla_clones_agri: ea?.mezcla_clones || 0,
            planta_bruja_agri: ea?.planta_bruja || 0,
            racimo_planta_seca_sin_repique_agri: ea?.racimo_planta_seca_sin_repique || 0,
            plantas_con_limite_hojas_agri: ea?.planta_con_limite_hojas || 0,
            planta_sin_vampirear_agri: ea?.planta_sin_vampirear || 0,
            racimo_pobre_bacota_pobre_agri: ea?.racimo_pobre_bacota_pobre || 0,
            tronco_seco_sin_eliminar_agri: ea?.tronco_seco_sin_eliminar || 0,
            hijo_rastrero_desm: ed?.hijo_rastrero || 0,
            enfrentamiento_primarios_desm: ed?.enfrentamiento_primarios || 0,
            mala_eleccion_desm: ed?.mala_eleccion || 0,
            desmache_lineal_desm: ed?.desmache_lineal || 0,
            sin_elegir_orilla_desm: ed?.sin_elegir_orilla || 0,
            planta_eliminada_desm: ed?.planta_eliminada || 0,
            hijo_al_drenaje_cable_desm: ed?.hijo_al_drenaje_cable || 0,
            planta_sin_desmachar_desm: ed?.planta_sin_desmachar || 0,
            hijos_continuos_desm: ed?.hijos_continuos || 0,
            rebrote_sin_cortar_desm: ed?.rebrote_sin_cortar || 0,
            mal_corte_desm: ed?.mal_corte || 0,
            eleccion_temprana_edad_desm: ed?.eleccion_temprana_edad || 0,
            cepa_sin_doblar_desm: ed?.cepa_sin_doblar || 0,
            residuos_drenaje_fertilizacion_desm: ed?.residuos_drenaje_fertilizacion || 0,
            hueco_sin_tapar_desm: ed?.hueco_sin_tapar || 0
          }));
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    cargarTodo();
  }, [id]);

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
    return { avg: (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2), max: Math.max(...nums).toFixed(2), min: Math.min(...nums).toFixed(2) };
  };

  const guardarCambios = async () => {
    setLoading(true);
    try {
      await supabase.from('tabla_maestra').update({
        finca_id: parseInt(form.finca_id), clon_id: parseInt(form.clon_id), evaluador_id: parseInt(form.evaluador_id),
        agricultor_id: form.agricultor_id ? parseInt(form.agricultor_id) : null, desmachador_id: form.desmachador_id ? parseInt(form.desmachador_id) : null,
        lote: String(form.lote), semana: parseInt(form.semana), area_ha: parseFloat(form.area_ha), observaciones_operador: form.observaciones_operador
      }).eq('id', id);

      await supabase.from('reportes_cosecha').update({
        plantas_prontas: parseInt(form.plantas_prontas), pp_bacota: parseInt(form.pp_bacota),
        pp_1semanas: parseInt(form.pp_1semanas), pp_2semanas: parseInt(form.pp_2semanas), pp_3semanas: parseInt(form.pp_3semanas),
        pp_4semanas: parseInt(form.pp_4semanas), pp_5semanas: parseInt(form.pp_5semanas), pp_6semanas: parseInt(form.pp_6semanas),
        pp_7semanas: parseInt(form.pp_7semanas), pp_8semanas: parseInt(form.pp_8semanas), pp_9semanas: parseInt(form.pp_9semanas),
        pp_10semanas: parseInt(form.pp_10semanas), pp_11semanas: parseInt(form.pp_11semanas),
        pc_2_2_5: parseInt(form.pc_2_2_5), pc_2_5_3: parseInt(form.pc_2_5_3), pc_3_3_5: parseInt(form.pc_3_3_5),
        pj_2_2_5: parseInt(form.pj_2_2_5), pj_2_5_3: parseInt(form.pj_2_5_3), pj_mas_3: parseInt(form.pj_mas_3),
        resiembra_con_distancia: parseInt(form.resiembra_con_distancia), resiembra_sin_distancia: parseInt(form.resiembra_sin_distancia),
        planta_reinas_con_distancia: parseInt(form.planta_reinas_con_distancia), planta_reina_sin_distancia: parseInt(form.planta_reina_sin_distancia),
        plantas_eliminadas_bien: parseInt(form.plantas_eliminadas_bien), plantas_eliminadas_mal: parseInt(form.plantas_eliminadas_mal),
        espacios_con_distancia: parseInt(form.espacios_con_distancia), espacios_sin_distancia: parseInt(form.espacios_sin_distancia),
        alturas_plantas: form.alturas_plantas.map(Number), circunferencias_plantas: form.circunferencias_plantas.map(Number)
      }).eq('maestra_id', id);

      alert("✅ ¡ACTUALIZACIÓN EXITOSA!");
      navigate('/reportes');
    } catch (err) { alert("❌ ERROR: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh', color: '#333' }}>
      {paso === 1 ? (
        <>
          <h2 style={{ color: '#1b5e20', textAlign: 'center', marginBottom: '25px' }}>Modificar Paso 1</h2>
          <div style={cardStyle}>
            <h4 style={titleStyle}>📍 Ubicación</h4>
            <Input8Metros etiqueta="Finca" esSelect valor={form.finca_id} alCambiar={(v) => handleInputChange('finca_id', v)}>
              {fincas.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
            </Input8Metros>
            <div style={grid2Col}>
                <Input8Metros etiqueta="Lote" valor={form.lote} alCambiar={(v) => handleInputChange('lote', v)} />
                <Input8Metros etiqueta="Semana" tipo="number" valor={form.semana} alCambiar={(v) => handleInputChange('semana', v)} />
                <Input8Metros etiqueta="Área (Ha)" tipo="number" valor={form.area_ha} alCambiar={(v) => handleInputChange('area_ha', v)} />
            </div>
          </div>
          <BotonGuardar texto="Siguiente: Datos de Campo" alHacerClic={() => setPaso(2)} />
          <button onClick={() => navigate('/reportes')} style={btnBackStyle}>⬅ Regresar al Listado</button>
        </>
      ) : (
        <div style={{ paddingBottom: '40px' }}>
          <h2 style={{ color: '#1b5e20', textAlign: 'center', marginBottom: '25px' }}>Modificar Paso 2</h2>
          
          <div style={cardStyle}>
            <h4 style={titleStyle}>📏 Biometría (25 Datos)</h4>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={statCardStyle}>
                <div style={statHeaderStyle}>ALTURA (cm)</div>
                <div style={statRowStyle}><span>Prom:</span> <b>{calcularStats(form.alturas_plantas).avg}</b></div>
              </div>
              <div style={statCardStyle}>
                <div style={statHeaderStyle}>CIRCUNF. (cm)</div>
                <div style={statRowStyle}><span>Prom:</span> <b>{calcularStats(form.circunferencias_plantas).avg}</b></div>
              </div>
            </div>
            <details>
              <summary style={{ cursor: 'pointer', color: '#2e7d32', fontWeight: 'bold', textAlign: 'center' }}>✏️ Tocar para editar 25 datos</summary>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', marginTop: '10px' }}>
                {form.alturas_plantas.map((_, i) => (
                  <div key={i} style={{ border: '1px solid #ddd', padding: '2px', backgroundColor: '#cfd8dc' }}>
                    <input placeholder="Alt" style={{...miniInput, color: '#ffffff'}} value={form.alturas_plantas[i]} onChange={(e) => handleArrayChange(i, e.target.value, 'alturas_plantas')} />
                    <input placeholder="Cir" style={{...miniInput, color: '#ffffff'}} value={form.circunferencias_plantas[i]} onChange={(e) => handleArrayChange(i, e.target.value, 'circunferencias_plantas')} />
                  </div>
                ))}
              </div>
            </details>
          </div>

          <details style={cardStyle} open>
            <summary style={titleStyle}>🍎 Reporte Cosecha</summary>
            <div style={grid2Col}>
              <ControlContador etiqueta="P. Prontas" campo="plantas_prontas" valor={form.plantas_prontas} />
              <ControlContador etiqueta="A Recuperar" campo="planta_a_recuperar" valor={form.plantas_prontas} />
              <ControlContador etiqueta="Improductivas" campo="plantas_improductivas" valor={form.plantas_improductivas} />
              <ControlContador etiqueta="Huérfanas" campo="plantas_huerfanas" valor={form.plantas_huerfanas} />
            </div>
            <h5 style={{color: '#2e7d32', margin: '15px 0 10px 0'}}>Producción Pronta (Semanas)</h5>
            <div style={grid2Col}>
                <ControlContador etiqueta="PP Bacota" campo="pp_bacota" valor={form.pp_bacota} />
                {[...Array(11)].map((_, i) => (
                    <ControlContador key={i} etiqueta={`PP Sem ${i+1}`} campo={`pp_${i+1}semanas`} valor={form[`pp_${i+1}semanas`]} />
                ))}
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

          <div style={cardStyle}>
            <h4 style={titleStyle}>📝 Observaciones</h4>
            <textarea 
              value={form.observaciones_operador} 
              onChange={(e) => handleInputChange('observaciones_operador', e.target.value)} 
              style={{...textStyle, backgroundColor: '#cfd8dc', color: '#000000'}} 
            />
          </div>

          <BotonGuardar cargando={loading} texto="Guardar Cambios" alHacerClic={guardarCambios} />
          <button onClick={() => setPaso(1)} style={btnBackStyle}>Regresar al Paso 1</button>
        </div>
      )}
    </div>
  );
};

// ESTILOS ESPEJO
const cardStyle = { background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '15px' };
const titleStyle = { color: '#2e7d32', fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' };
const grid2Col = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' };
const btnContadorStyle = { backgroundColor: '#1b5e20', color: 'white', border: 'none', borderRadius: '4px', width: '28px', height: '28px', fontSize: '18px' };
const miniInput = { width: '100%', border: 'none', fontSize: '12px', textAlign: 'center', padding: '4px', backgroundColor: 'transparent' };
const statCardStyle = { flex: 1, backgroundColor: '#f8faf8', borderRadius: '10px', border: '1px solid #e0e0e0', padding: '10px' };
const statHeaderStyle = { fontSize: '11px', color: '#1b5e20', fontWeight: 'bold', textAlign: 'center' };
const statRowStyle = { display: 'flex', justifyContent: 'space-between', fontSize: '13px' };
const textStyle = { width: '100%', height: '100px', borderRadius: '8px', border: '1px solid #ccc', padding: '10px' };
const btnBackStyle = { width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#666', textDecoration: 'underline' };

export default EditarReporte;