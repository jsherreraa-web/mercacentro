/* ==========================================================================
   MERCACENTRO · CONFIGURACIÓN  (este es el ÚNICO archivo que debes editar)
   ==========================================================================

   1) GA_MEASUREMENT_ID
      Aquí va el ID de medición de tu propiedad de Google Analytics 4.
      Dónde encontrarlo:
        GA4 → Administrar (engranaje) → Flujos de datos → tu flujo web
        → "ID de medición" (empieza por G-, por ejemplo G-AB12CD34EF).
      Reemplaza el texto G-XXXXXXXXXX por tu ID, conservando las comillas.
      Mientras el valor siga siendo G-XXXXXXXXXX NO se carga gtag.js y los
      eventos solo se muestran en el monitor de la derecha.

   2) DEBUG_MODE
      true  → envía debug_mode y los eventos aparecen en GA4 → Administrar →
              DebugView (ideal para el laboratorio).
      false → modo normal, sin debug_mode.
   ========================================================================== */
window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-EGVQPR28EF", // ← pega aquí tu ID de medición
  DEBUG_MODE: true                   // ← true = DebugView, false = normal
};
