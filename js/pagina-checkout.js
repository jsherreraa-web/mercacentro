/* Página: checkout en dos pasos (checkout.html)
   Eventos: begin_checkout (al cargar), add_shipping_info ("Continuar al pago"),
            add_payment_info ("Pagar (simulado)")
   Privacidad: el nombre ficticio solo vive en pantalla; no se guarda ni se envía. */
(function () {
  var PAISES = ["Colombia", "México", "Estados Unidos", "España", "Argentina", "Chile", "Perú", "Brasil"];

  function $(id) { return document.getElementById(id); }

  var r = Carrito.resumen();
  if (!r.lineas.length) {
    $("checkout-vacio").hidden = false;
    $("checkout-contenido").hidden = true;
    return;
  }

  /* ---------- países ---------- */
  var selPais = $("pais");
  PAISES.forEach(function (p) {
    var o = document.createElement("option");
    o.value = p; o.textContent = p;
    selPais.appendChild(o);
  });

  function servicioElegido() { return document.querySelector('input[name="servicio"]:checked').value; }
  function pagoElegido() { return document.querySelector('input[name="pago"]:checked').value; }

  /* ---------- resumen lateral y tarifas ---------- */
  function actualizarResumen() {
    var tipo = Carrito.tipoCliente(selPais.value);
    var servicio = servicioElegido();

    ["Estándar", "Express"].forEach(function (s) {
      var costo = Carrito.costoEnvio(tipo, s, r.subtotal);
      var el = $(s === "Estándar" ? "tarifa-estandar" : "tarifa-express");
      el.textContent = costo === 0 ? "Gratis" : Carrito.fmt(costo);
      el.className = "tarifa" + (costo === 0 ? " gratis" : "");
    });
    $("tipo-envio").textContent = tipo === "Nacional" ? "Envío nacional (Colombia)" : "Envío internacional";

    var envio = Carrito.costoEnvio(tipo, servicio, r.subtotal);
    var html = '<ul class="mini-lineas">';
    r.lineas.forEach(function (l) {
      html += "<li><span>" + l.cantidad + " × " + l.producto.nombre + "</span><span>" + Carrito.fmt(l.totalLinea) + "</span></li>";
    });
    html += "</ul>";
    html += '<div class="fila-res"><span>Productos</span><span>' + Carrito.fmt(r.subtotalLista) + "</span></div>";
    if (r.cupon) html += '<div class="fila-res desc"><span>Cupón ' + r.cupon + "</span><span>−" + Carrito.fmt(r.descuento) + "</span></div>";
    html += '<div class="fila-res"><span>Envío</span><span>' + (envio === 0 ? "Gratis" : Carrito.fmt(envio)) + "</span></div>";
    html += '<div class="fila-res total"><span>Total a pagar</span><span>' + Carrito.fmt(r.subtotal + envio) + "</span></div>";
    $("resumen-checkout").innerHTML = html;
  }
  selPais.addEventListener("change", actualizarResumen);
  Array.prototype.forEach.call(document.querySelectorAll('input[name="servicio"]'), function (i) {
    i.addEventListener("change", actualizarResumen);
  });
  actualizarResumen();

  /* ---------- pasos ---------- */
  function mostrarPaso(n) {
    $("paso-1").hidden = n !== 1;
    $("paso-2").hidden = n !== 2;
    $("ind-1").className = n === 1 ? "activo" : "hecho";
    $("ind-2").className = n === 2 ? "activo" : "";
  }

  var envioConfirmado = null;

  /* Paso 1 → add_shipping_info */
  $("form-envio").addEventListener("submit", function (e) {
    e.preventDefault();
    var nombre = $("nombre").value.trim();
    var err = $("error-envio");
    if (nombre.length < 2) {
      err.textContent = "Escribe un nombre ficticio (mínimo 2 letras).";
      err.hidden = false;
      $("nombre").focus();
      return;
    }
    err.hidden = true;

    var tipo = Carrito.tipoCliente(selPais.value);
    var servicio = servicioElegido();
    envioConfirmado = {
      tipo: tipo,
      servicio: servicio,
      tier: Carrito.nombreTier(tipo, servicio),
      costo: Carrito.costoEnvio(tipo, servicio, r.subtotal)
    };

    Analitica.establecerTipoCliente(tipo); // gtag('set','user_properties',{ tipo_cliente })
    var p = Carrito.paramsBase(r);
    p.shipping_tier = envioConfirmado.tier;
    enviarEvento("add_shipping_info", p);

    $("pago-para").textContent = "Pedido de " + nombre + " · " + envioConfirmado.tier;
    mostrarPaso(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("volver-envio").addEventListener("click", function () { mostrarPaso(1); });

  /* Paso 2 → add_payment_info y navegación a gracias.html */
  $("btn-pagar").addEventListener("click", function () {
    if (!envioConfirmado) { mostrarPaso(1); return; }
    var btn = $("btn-pagar");
    btn.disabled = true;

    var pago = pagoElegido();
    var p = Carrito.paramsBase(r);
    p.payment_type = pago;

    var pedido = {
      transaction_id: "MC-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(),
      value: Carrito.valor(p.items),
      shipping: envioConfirmado.costo,
      coupon: r.cupon || null,
      tipo_cliente: envioConfirmado.tipo,
      shipping_tier: envioConfirmado.tier,
      payment_type: pago,
      items: p.items,
      enviado: false
    };
    try { window.sessionStorage.setItem("mc_pedido", JSON.stringify(pedido)); } catch (e) { /* nada */ }

    enviarEventoYNavegar("add_payment_info", p, "gracias.html");
  });

  /* ---------- begin_checkout al abrir la página ---------- */
  enviarEvento("begin_checkout", Carrito.paramsBase(r));
})();
