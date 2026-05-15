// src/utils/offlineHelper.js

/**
 * Verifica si el dispositivo tiene conexión a internet
 */
export const estaEnLinea = () => navigator.onLine;

/**
 * Guarda el objeto completo del formulario en el LocalStorage del celular.
 * @param {Object} datosFormulario - El estado 'form' completo con biometría, cosecha, etc.
 */
export const guardarLocalmente = (datosFormulario) => {
  try {
    // 1. Obtener lo que ya existe en la memoria
    const pendientes = JSON.parse(localStorage.getItem('banagro_reportes_pendientes') || "[]");

    // 2. Crear el nuevo registro con metadatos de seguimiento
    const nuevoRegistro = {
      id_temporal: Date.now(), // Usamos el timestamp como ID único local
      fecha_creacion: new Date().toISOString(),
      datos: datosFormulario, // Aquí van todas las variables (lote, semana, biometría, etc.)
      sincronizado: false
    };

    // 3. Guardar en la lista
    pendientes.push(nuevoRegistro);
    localStorage.setItem('banagro_reportes_pendientes', JSON.stringify(pendientes));
    
    console.log("💾 Reporte guardado localmente con éxito.");
    return true;
  } catch (error) {
    console.error("❌ Error al guardar localmente:", error);
    return false;
  }
};

/**
 * Retorna la lista de reportes que aún no se han subido a Supabase
 */
export const obtenerPendientes = () => {
  return JSON.parse(localStorage.getItem('banagro_reportes_pendientes') || "[]");
};

/**
 * Elimina un reporte de la memoria local una vez que Supabase confirma la recepción
 * @param {Number} idTemporal - El ID generado al momento de guardar offline
 */
export const eliminarSincronizado = (idTemporal) => {
  const pendientes = obtenerPendientes();
  const filtrados = pendientes.filter(reporte => reporte.id_temporal !== idTemporal);
  localStorage.setItem('banagro_reportes_pendientes', JSON.stringify(filtrados));
};

/**
 * Retorna la cantidad de reportes pendientes (para mostrar en la UI)
 */
export const contarPendientes = () => {
  return obtenerPendientes().length;
};