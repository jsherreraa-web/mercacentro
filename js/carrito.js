/* Carrito en localStorage, cupón BIENVENIDA10, tarifas de envío y
   constructores de ítems con el formato del contrato de medición GA4. */
(function () {
  var CLAVE = "mc_carrito";
  var CLAVE_CUPON = "mc_cupon";
  var CODIGO_CUPON = "BIENVENIDA10";
  var PORCENTAJE = 0.10;
  var MAX_UNIDADES = 99;
  var UMBRAL_ENVIO_GRATIS = 150000;
  var TARIFAS = {
    "Nacional":      { "Estándar": 12000, "Express": 25000 },
    "Internacional": { "Estándar": 95000, "Express": 160000 }
  };

  function ls(op, clave, valor) {
    try {
      if (op === "get") return window.localStorage.getItem(clave);
      if (op === "set") window.localStorage.setItem(clave, valor);
      if (op === "del") window.localStorage.removeItem(clave);
    } catch (e) { /* almacenamiento no disponible */ }
    return null;
  }

  function leer() {
    try {
      var d = JSON.parse(ls("get", CLAVE) || "[]");
      if (!Array.isArray(d)) return [];
      return d.filter(function (l) {
        return l && typeof l.id === "string" && l.cantidad > 0 && window.obtenerProducto(l.id);
      });
    } catch (e) { return []; }
  }

  function guardar(lista) {
    ls("set", CLAVE, JSON.stringify(lista));
    actualizarContador();
  }

  function cupon() {
    return ls("get", CLAVE_CUPON) === CODIGO_CUPON ? CODIGO_CUPON : null;
  }

  function aplicarCupon(codigo) {
    var c = String(codigo || "").trim().toUpperCase();
    if (c !== CODIGO_CUPON) return false;
    ls("set", CLAVE_CUPON, CODIGO_CUPON);
    return true;
  }

  function quitarCupon() { ls("del", CLAVE_CUPON); }

  function agregar(id, n) {
    if (!window.obtenerProducto(id)) return 0;
    n = Math.max(1, parseInt(n, 10) || 1);
    var lista = leer(), fila = null;
    lista.forEach(function (l) { if (l.id === id) fila = l; });
    var antes = fila ? fila.cantidad : 0;
    var despues = Math.min(MAX_UNIDADES, antes + n);
    if (fila) fila.cantidad = despues; else lista.push({ id: id, cantidad: despues });
    guardar(lista);
    return despues - antes; // unidades realmente agregadas
  }

  function quitar(id, n) {
    n = Math.max(1, parseInt(n, 10) || 1);
    var lista = leer(), quitadas = 0;
    lista = lista.filter(function (l) {
      if (l.id !== id) return true;
      quitadas = Math.min(n, l.cantidad);
      l.cantidad -= quitadas;
      return l.cantidad > 0;
    });
    guardar(lista);
    return quitadas; // unidades realmente quitadas
  }

  function vaciar() { guardar([]); }

  function unidades() {
    return leer().reduce(function (s, l) { return s + l.cantidad; }, 0);
  }

  function actualizarContador() {
    var el = document.getElementById("contador-carrito");
    if (!el) return;
    var n = unidades();
    el.textContent = String(n);
    el.hidden = n === 0;
  }

  /* ---- Ítems con el formato del contrato de medición ---- */
  function item(p, cantidad, index, cuponCodigo, extra) {
    var d = cuponCodigo ? Math.round(p.precio * PORCENTAJE) : 0;
    var it = {
      item_id: p.id,
      item_name: p.nombre,
      item_brand: window.MARCA,
      item_category: p.categoria,
      price: p.precio - d,
      quantity: cantidad,
      index: index
    };
    if (cuponCodigo) { it.discount = d; it.coupon = cuponCodigo; }
    if (extra) { for (var k in extra) { if (Object.prototype.hasOwnProperty.call(extra, k)) it[k] = extra[k]; } }
    return it;
  }

  function resumen() {
    var cup = cupon(), lineas = [], sl = 0, sd = 0, uds = 0;
    leer().forEach(function (l) {
      var p = window.obtenerProducto(l.id);
      var d = cup ? Math.round(p.precio * PORCENTAJE) : 0;
      lineas.push({
        producto: p,
        cantidad: l.cantidad,
        precioLista: p.precio,
        descuentoUnit: d,
        precioUnit: p.precio - d,
        totalLinea: (p.precio - d) * l.cantidad
      });
      sl += p.precio * l.cantidad;
      sd += d * l.cantidad;
      uds += l.cantidad;
    });
    return { lineas: lineas, cupon: cup, unidades: uds, subtotalLista: sl, descuento: sd, subtotal: sl - sd };
  }

  function itemsResumen(r) {
    return r.lineas.map(function (l, i) { return item(l.producto, l.cantidad, i, r.cupon); });
  }

  function valor(items) {
    return items.reduce(function (s, it) { return s + it.price * it.quantity; }, 0);
  }

  function paramsBase(r) {
    var p = { currency: "COP", value: r.subtotal };
    if (r.cupon) p.coupon = r.cupon;
    p.items = itemsResumen(r);
    return p;
  }

  /* ---- Envío ---- */
  function tipoCliente(pais) { return pais === "Colombia" ? "Nacional" : "Internacional"; }

  function costoEnvio(tipo, servicio, subtotalProductos) {
    if (tipo === "Nacional" && servicio === "Estándar" && subtotalProductos >= UMBRAL_ENVIO_GRATIS) return 0;
    return TARIFAS[tipo][servicio];
  }

  function nombreTier(tipo, servicio) { return tipo + " - " + servicio; }

  function fmt(n) {
    return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  window.addEventListener("storage", actualizarContador);

  window.Carrito = {
    CODIGO_CUPON: CODIGO_CUPON,
    UMBRAL_ENVIO_GRATIS: UMBRAL_ENVIO_GRATIS,
    TARIFAS: TARIFAS,
    leer: leer, cupon: cupon, aplicarCupon: aplicarCupon, quitarCupon: quitarCupon,
    agregar: agregar, quitar: quitar, vaciar: vaciar, unidades: unidades,
    actualizarContador: actualizarContador,
    item: item, resumen: resumen, itemsResumen: itemsResumen, valor: valor, paramsBase: paramsBase,
    tipoCliente: tipoCliente, costoEnvio: costoEnvio, nombreTier: nombreTier, fmt: fmt
  };

  actualizarContador();
})();
