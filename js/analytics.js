/* Capa de medición GA4.
   - Carga gtag.js SOLO si el ID tiene formato G-... y no es el marcador G-XXXXXXXXXX.
   - Todo evento se registra también en el monitor (sessionStorage), haya ID o no.
   - Expone: enviarEvento() y enviarEventoYNavegar(). */
(function () {
  var cfg = window.TIENDA_CONFIG || {};
  var ID = String(cfg.GA_MEASUREMENT_ID || "").trim();
  var DEBUG = cfg.DEBUG_MODE === true;
  var MARCADOR = "G-XXXXXXXXXX";
  var CLAVE_LOG = "mc_eventos";
  var MAX_EVENTOS = 12;

  var activo = /^G-[A-Z0-9]{4,}$/i.test(ID) && ID.toUpperCase() !== MARCADOR;

  /* ---------- gtag ---------- */
  if (activo) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    if (DEBUG) {
      window.gtag("config", ID, { debug_mode: true });
    } else {
      window.gtag("config", ID);
    }
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(s);
  } else {
    window.gtag = function () { /* sin ID válido: no se envía nada */ };
  }

  /* ---------- registro para el monitor ---------- */
  function dos(n) { return n < 10 ? "0" + n : String(n); }
  function hora() {
    var d = new Date();
    return dos(d.getHours()) + ":" + dos(d.getMinutes()) + ":" + dos(d.getSeconds());
  }
  function cop(n) {
    return "COP " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function resumir(nombre, p) {
    p = p || {};
    if (nombre === "page_view") return (p.page_title || "") + " · " + (p.page_path || "");
    var partes = [];
    if (p.promotion_id) partes.push(p.promotion_id + " · " + (p.creative_slot || ""));
    if (p.transaction_id) partes.push(p.transaction_id);
    if (p.shipping_tier) partes.push(p.shipping_tier);
    if (p.payment_type) partes.push(p.payment_type);
    if (p.items && p.items.length) {
      var nombres = p.items.slice(0, 2).map(function (i) {
        return (i.quantity > 1 ? i.quantity + " × " : "") + i.item_name;
      });
      var mas = p.items.length > 2 ? " (+" + (p.items.length - 2) + " más)" : "";
      partes.push(nombres.join(", ") + mas);
    }
    if (typeof p.value === "number") partes.push("valor " + cop(p.value));
    if (typeof p.shipping === "number") partes.push("envío " + cop(p.shipping));
    if (p.coupon) partes.push("cupón " + p.coupon);
    if (p.tipo_cliente) partes.push(p.tipo_cliente);
    return partes.join(" · ");
  }

  function leerLog() {
    try {
      var d = JSON.parse(window.sessionStorage.getItem(CLAVE_LOG) || "[]");
      return Array.isArray(d) ? d : [];
    } catch (e) { return []; }
  }

  function registrar(nombre, params) {
    var copia;
    try { copia = JSON.parse(JSON.stringify(params || {})); } catch (e) { copia = {}; }
    var lista = leerLog();
    lista.unshift({ h: hora(), n: nombre, r: resumir(nombre, copia), p: copia });
    lista = lista.slice(0, MAX_EVENTOS);
    try { window.sessionStorage.setItem(CLAVE_LOG, JSON.stringify(lista)); } catch (e) { /* lleno o bloqueado */ }
    window.dispatchEvent(new CustomEvent("mc:evento"));
  }

  /* ---------- API pública ---------- */
  function enviarEvento(nombre, params) {
    params = params || {};
    registrar(nombre, params);
    if (activo) window.gtag("event", nombre, params);
  }

  function enviarEventoYNavegar(nombre, params, url) {
    var yaNavego = false;
    function ir() {
      if (yaNavego) return;
      yaNavego = true;
      window.location.href = url;
    }
    params = params || {};
    registrar(nombre, params);
    if (!activo) { ir(); return; }
    var conCallback = {};
    for (var k in params) { if (Object.prototype.hasOwnProperty.call(params, k)) conCallback[k] = params[k]; }
    conCallback.event_callback = ir;
    conCallback.event_timeout = 1000;
    window.gtag("event", nombre, conCallback);
    window.setTimeout(ir, 1200); // respaldo si gtag.js no responde
  }

  function establecerTipoCliente(tipo) {
    window.gtag("set", "user_properties", { tipo_cliente: tipo });
  }

  window.enviarEvento = enviarEvento;
  window.enviarEventoYNavegar = enviarEventoYNavegar;
  window.Analitica = {
    activo: activo,
    id: activo ? ID : null,
    debug: DEBUG,
    enviarEvento: enviarEvento,
    enviarEventoYNavegar: enviarEventoYNavegar,
    establecerTipoCliente: establecerTipoCliente,
    leerLog: leerLog,
    claveLog: CLAVE_LOG
  };

  /* page_view: lo envía gtag('config') automáticamente; aquí solo se registra en el monitor */
  registrar("page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
})();
