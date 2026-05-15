import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import { estaEnLinea, obtenerPendientes, eliminarSincronizado, contarPendientes } from '../utils/offlineHelper';
import logoBanagro from '../assets/logo_banagro.png';
import { Leaf, Map, BarChart3, Settings, CloudUpload } from 'lucide-react';

const Home = () => {
  const [pendientes, setPendientes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false); // Nuevo estado de control

  useEffect(() => {
    const sincronizarTodo = async () => {
      // Si ya está sincronizando o no hay internet, no hacer nada
      if (!estaEnLinea() || sincronizando) return;

      const listaPendientes = obtenerPendientes();
      setPendientes(listaPendientes.length);

      if (listaPendientes.length === 0) return;

      setSincronizando(true); // Bloquear para evitar duplicidad
      console.log(`🔄 Iniciando sincronización de ${listaPendientes.length} reportes...`);

      for (const reporte of listaPendientes) {
        const f = reporte.datos;

        try {
          // 1. TABLA MAESTRA
          const { data: mData, error: mErr } = await supabase.from('tabla_maestra').insert([{
            finca_id: parseInt(f.finca_id),
            clon_id: parseInt(f.clon_id),
            evaluador_id: parseInt(f.evaluador_id),
            agricultor_id: f.agricultor_id ? parseInt(f.agricultor_id) : null,
            desmachador_id: f.desmachador_id ? parseInt(f.desmachador_id) : null,
            lote: String(f.lote),
            semana: parseInt(f.semana),
            area_ha: parseFloat(f.area_ha) || 0,
            punto_muestreo: parseInt(f.punto_muestreo),
            latitud_wgs84: f.latitud_wgs84,
            longitud_wgs84: f.longitud_wgs84,
            observaciones_operador: f.observaciones_operador
          }]).select();

          if (mErr) throw mErr;
          const idM = mData[0].id;

          // 2. REPORTE COSECHA
          const { error: cErr } = await supabase.from('reportes_cosecha').insert([{
            maestra_id: idM,
            plantas_prontas: parseInt(f.plantas_prontas) || 0,
            planta_a_recuperar: parseInt(f.planta_a_recuperar) || 0,
            plantas_improductivas: parseInt(f.plantas_improductivas) || 0,
            plantas_huerfanas: parseInt(f.plantas_huerfanas) || 0,
            pp_bacota: parseInt(f.pp_bacota) || 0,
            pp_1semanas: parseInt(f.pp_1semanas) || 0,
            pp_2semanas: parseInt(f.pp_2semanas) || 0,
            pp_3semanas: parseInt(f.pp_3semanas) || 0,
            pp_4semanas: parseInt(f.pp_4semanas) || 0,
            pp_5semanas: parseInt(f.pp_5semanas) || 0,
            pp_6semanas: parseInt(f.pp_6semanas) || 0,
            pp_7semanas: parseInt(f.pp_7semanas) || 0,
            pp_8semanas: parseInt(f.pp_8semanas) || 0,
            pp_9semanas: parseInt(f.pp_9semanas) || 0,
            pp_10semanas: parseInt(f.pp_10semanas) || 0,
            pp_11semanas: parseInt(f.pp_11semanas) || 0,
            pc_2_2_5: parseInt(f.pc_2_2_5) || 0,
            pc_2_5_3: parseInt(f.pc_2_5_3) || 0,
            pc_3_3_5: parseInt(f.pc_3_3_5) || 0,
            pj_2_2_5: parseInt(f.pj_2_2_5) || 0,
            pj_2_5_3: parseInt(f.pj_2_5_3) || 0,
            pj_mas_3: parseInt(f.pj_mas_3) || 0,
            resiembra_con_distancia: parseInt(f.resiembra_con_distancia) || 0,
            resiembra_sin_distancia: parseInt(f.resiembra_sin_distancia) || 0,
            planta_reinas_con_distancia: parseInt(f.planta_reinas_con_distancia) || 0,
            planta_reina_sin_distancia: parseInt(f.planta_reina_sin_distancia) || 0,
            plantas_eliminadas_bien: parseInt(f.plantas_eliminadas_bien) || 0,
            plantas_eliminadas_mal: parseInt(f.plantas_eliminadas_mal) || 0,
            espacios_con_distancia: parseInt(f.espacios_con_distancia) || 0,
            espacios_sin_distancia: parseInt(f.espacios_sin_distancia) || 0,
            alturas_plantas: (f.alturas_plantas || []).map(n => parseFloat(n) || 0),
            circunferencias_plantas: (f.circunferencias_plantas || []).map(n => parseFloat(n) || 0)
          }]);
          if (cErr) throw cErr;

          // 3. EVALUACIÓN AGRÍCOLA
          const { error: aErr } = await supabase.from('evaluacion_agricola').insert([{
            maestra_id: idM,
            enfrentamiento_primarios: parseInt(f.enfrentamiento_primarios_agri) || 0,
            planta_mal_eliminada: parseInt(f.planta_mal_eliminada_agri) || 0,
            planta_encerrada: parseInt(f.planta_encerrada_agri) || 0,
            planta_recuperar_sin_intervenir: parseInt(f.planta_recuperar_sin_intervenir_agri) || 0,
            planta_improductiva: parseInt(f.planta_improductiva_agri) || 0,
            espacio_estaquillado_sin_distancia: parseInt(f.espacio_estaquillado_sin_distancia_agri) || 0,
            espacio_sin_estaquillar: parseInt(f.espacio_sin_estaquillar_agri) || 0,
            falta_herramienta_insumo: parseInt(f.falta_herramienta_insumo_agri) || 0,
            planta_huerfana_sin_intervenir: parseInt(f.planta_huerfana_sin_intervenir_agri) || 0,
            resiembra_pobre: parseInt(f.resiembra_pobre_agri) || 0,
            retorno_sin_intervenir: parseInt(f.retorno_sin_intervenir_agri) || 0,
            reina_fuera_especificaciones: parseInt(f.reina_fuera_especificaciones_agri) || 0,
            resiembra_sin_intervenir: parseInt(f.resiembra_sin_intervenir_agri) || 0,
            retorno_sin_seguimiento: parseInt(f.retorno_sin_seguimiento_agri) || 0,
            mala_ejecucion_hercules: parseInt(f.mala_ejecucion_hercules_agri) || 0,
            planta_recuperar_sin_elegir: parseInt(f.planta_recuperar_sin_elegir_agri) || 0,
            arbusto_area_drenajes: parseInt(f.arbusto_area_drenajes_agri) || 0,
            rebrotes_en_drenajes: parseInt(f.rebrotes_en_drenajes_agri) || 0,
            batea_obstruida: parseInt(f.batea_obstruida_agri) || 0,
            bejucos_unidades_produccion: parseInt(f.bejucos_unidades_produccion_agri) || 0,
            espacio_marcado_vena: parseInt(f.espacio_marcado_vena_agri) || 0,
            sin_aporque_barrera: parseInt(f.sin_aporque_barrera_agri) || 0,
            fomy_cintas_sin_recoger: parseInt(f.fomy_cintas_sin_recoger_agri) || 0,
            hueco_sin_tapar: parseInt(f.hueco_sin_tapar_agri) || 0,
            mezcla_clones: parseInt(f.mezcla_clones_agri) || 0,
            planta_bruja: parseInt(f.planta_bruja_agri) || 0,
            racimo_planta_seca_sin_repique: parseInt(f.racimo_planta_seca_sin_repique_agri) || 0,
            planta_con_limite_hojas: parseInt(f.plantas_con_limite_hojas_agri) || 0,
            planta_sin_vampirear: parseInt(f.planta_sin_vampirear_agri) || 0,
            racimo_pobre_bacota_pobre: parseInt(f.racimo_pobre_bacota_pobre_agri) || 0,
            tronco_seco_sin_eliminar: parseInt(f.tronco_seco_sin_eliminar_agri) || 0
          }]);
          if (aErr) throw aErr;

          // 4. EVALUACIÓN DESMACHE
          const { error: dErr } = await supabase.from('evaluacion_desmache').insert([{
            maestra_id: idM,
            hijo_rastrero: parseInt(f.hijo_rastrero_desm) || 0,
            enfrentamiento_primarios: parseInt(f.enfrentamiento_primarios_desm) || 0,
            mala_eleccion: parseInt(f.mala_eleccion_desm) || 0,
            desmache_lineal: parseInt(f.desmache_lineal_desm) || 0,
            sin_elegir_orilla: parseInt(f.sin_elegir_orilla_desm) || 0,
            planta_eliminada: parseInt(f.planta_eliminada_desm) || 0,
            hijo_al_drenaje_cable: parseInt(f.hijo_al_drenaje_cable_desm) || 0,
            planta_sin_desmachar: parseInt(f.planta_sin_desmachar_desm) || 0,
            hijos_continuos: parseInt(f.hijos_continuos_desm) || 0,
            rebrote_sin_cortar: parseInt(f.rebrote_sin_cortar_desm) || 0,
            mal_corte: parseInt(f.mal_corte_desm) || 0,
            eleccion_temprana_edad: parseInt(f.eleccion_temprana_edad_desm) || 0,
            cepa_sin_doblar: parseInt(f.cepa_sin_doblar_desm) || 0,
            residuos_drenaje_fertilizacion: parseInt(f.residuos_drenaje_fertilizacion_desm) || 0,
            hueco_sin_tapar: parseInt(f.hueco_sin_tapar_desm) || 0
          }]);
          if (dErr) throw dErr;

          // SI TODO OK, BORRAR DE MEMORIA LOCAL
          eliminarSincronizado(reporte.id_temporal);
          setPendientes(contarPendientes());
          console.log(`✅ Reporte local ${reporte.id_temporal} sincronizado.`);

        } catch (err) {
          console.error("❌ Fallo en reporte individual. Saltando...", err.message);
          // No lanzamos error para que el bucle continúe con el siguiente reporte
        }
      }
      setSincronizando(false);
    };

    window.addEventListener('online', sincronizarTodo);
    sincronizarTodo();
    const interval = setInterval(() => setPendientes(contarPendientes()), 10000);

    return () => {
      window.removeEventListener('online', sincronizarTodo);
      clearInterval(interval);
    };
  }, [sincronizando]); // Agregado sincronizando a dependencias

  return (
    <div className="home-screen">
      {pendientes > 0 && (
        <div style={sincronizando ? syncBannerActiveStyle : syncBannerStyle}>
          <CloudUpload size={20} className={sincronizando ? "animate-bounce" : ""} />
          <span>
            {sincronizando 
              ? `Subiendo ${pendientes} reportes a la nube...` 
              : `Tienes ${pendientes} reportes pendientes por subir.`}
          </span>
        </div>
      )}

      <header className="home-header">
        <img src={logoBanagro} alt="Banagro Logo" className="main-logo-hero" />
        <h1 className="brand-title">BanaReport</h1>
        <p className="brand-tagline">Sistema de Gestión de cultivos </p>
      </header>

      <nav className="dashboard-menu">
        <Link to="/captura" className="menu-card">
          <div className="card-icon agri"><Leaf size={40} /></div>
          <div className="card-info">
            <h3>Agricultura</h3>
            <p>Captura de datos (8m)</p>
          </div>
        </Link>

        <Link to="/mapas" className="menu-card">
          <div className="card-icon maps"><Map size={40} /></div>
          <div className="card-info">
            <h3>Mapas</h3>
            <p>Georeferenciación</p>
          </div>
        </Link>

        <Link to="/reportes" className="menu-card">
          <div className="card-icon reports"><BarChart3 size={40} /></div>
          <div className="card-info">
            <h3>Reportes</h3>
            <p>Exportar a Excel</p>
          </div>
        </Link>

        <Link to="/admin" className="menu-card">
          <div className="card-icon admin"><Settings size={40} /></div>
          <div className="card-info">
            <h3>Admin</h3>
            <p>Configuración</p>
          </div>
        </Link>
      </nav>
    </div>
  );
};

const syncBannerStyle = {
  backgroundColor: '#e65100', color: 'white', padding: '12px',
  textAlign: 'center', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: '10px', fontSize: '14px',
  fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1000,
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
};

const syncBannerActiveStyle = {
  ...syncBannerStyle,
  backgroundColor: '#2e7d32' // Cambia a verde cuando está trabajando
};

export default Home;