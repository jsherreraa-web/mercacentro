/* Página: confirmación (gracias.html)
   Evento: purchase, una sola vez por pedido.
   El pedido se lee de sessionStorage; tras enviar purchase se marca como enviado
   (así recargar no lo repite), se vacía el carrito y se retira el cupón usado. */
(function () {
  var cont = document.getElementById("gracias-contenido");

  var pedido = null;
  try { pedido = JSON.parse(window.sessionStorage.getItem("mc_pedido") || "null"); } catch (e) { pedido = null; }

  if (!pedido || !pedido.transaction_id || !Array.isArray(pedido.items)) {
    cont.innerHTML =
      '<div class="vacio">' +
        "<h2>No hay un pedido reciente</h2>" +
        "<p>Completa una compra simulada para ver aquí la confirmación.</p>" +
        '<a class="btn" href="index.html">Ir al catálogo</a>' +
      "</div>";
    return;
  }

  var yaEnviado = pedido.enviado === true;

  if (!yaEnviado) {
    var params = {
      transaction_id: pedido.transaction_id,
      affiliation: "Mercacentro - Tienda en línea",
      value: Carrito.valor(pedido.items), // productos con descuento, sin envío
      currency: "COP",
      shipping: pedido.shipping,
      tipo_cliente: pedido.tipo_cliente,
      items: pedido.items
    };
    if (pedido.coupon) params.coupon = pedido.coupon;

    // gtag('set') no persiste entre páginas: se vuelve a fijar antes de purchase
    Analitica.establecerTipoCliente(pedido.tipo_cliente);
    enviarEvento("purchase", params);

    pedido.enviado = true;
    try { window.sessionStorage.setItem("mc_pedido", JSON.stringify(pedido)); } catch (e) { /* nada */ }
    Carrito.vaciar();
    Carrito.quitarCupon();
  }

  var valor = Carrito.valor(pedido.items);
  var html =
    '<div class="gracias">' +
      '<div class="check" aria-hidden="true">✓</div>' +
      "<h1>¡Gracias por tu compra simulada!</h1>" +
      "<p>Este pedido es ficticio: no se cobró nada ni se guardó ningún dato personal.</p>" +
    "</div>" +
    '<div class="panel ficha" style="max-width:640px;margin:0 auto 20px">' +
      '<div class="fila-res"><span>N.º de pedido</span><strong id="pedido-id">' + pedido.transaction_id + "</strong></div>" +
      '<div class="fila-res"><span>Tipo de cliente</span><strong>' + pedido.tipo_cliente + "</strong></div>" +
      '<div class="fila-res"><span>Envío</span><strong>' + pedido.shipping_tier + "</strong></div>" +
      '<div class="fila-res"><span>Pago simulado</span><strong>' + pedido.payment_type + "</strong></div>";
  if (pedido.coupon) html += '<div class="fila-res desc"><span>Cupón</span><strong>' + pedido.coupon + "</strong></div>";
  html += '<ul class="mini-lineas" style="margin-top:12px">';
  pedido.items.forEach(function (it) {
    html += "<li><span>" + it.quantity + " × " + it.item_name + "</span><span>" + Carrito.fmt(it.price * it.quantity) + "</span></li>";
  });
  html +=
    "</ul>" +
    '<div class="fila-res"><span>Productos</span><span>' + Carrito.fmt(valor) + "</span></div>" +
    '<div class="fila-res"><span>Envío</span><span>' + (pedido.shipping === 0 ? "Gratis" : Carrito.fmt(pedido.shipping)) + "</span></div>" +
    '<div class="fila-res total"><span>Total</span><span>' + Carrito.fmt(valor + pedido.shipping) + "</span></div>" +
    "</div>";

  if (yaEnviado) {
    html += '<div class="aviso" style="max-width:640px;margin:0 auto 20px">Este pedido ya fue medido: al recargar la página no se envía un segundo evento <strong>purchase</strong>.</div>';
  }
  html += '<p style="text-align:center"><a class="btn" href="index.html">Seguir comprando</a></p>';
  cont.innerHTML = html;
})();
