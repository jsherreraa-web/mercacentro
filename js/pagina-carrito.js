/* Página: carrito (carrito.html)
   Eventos: view_cart, add_to_cart (botón +), remove_from_cart (botón − o Quitar) */
(function () {
  var vacio = document.getElementById("carrito-vacio");
  var contenido = document.getElementById("carrito-contenido");
  var lineasEl = document.getElementById("lineas");
  var resEl = document.getElementById("resumen-carrito");
  var inputCupon = document.getElementById("input-cupon");
  var btnCupon = document.getElementById("btn-cupon");
  var msgCupon = document.getElementById("msg-cupon");
  var quitarCuponBtn = document.getElementById("quitar-cupon");

  function pintar() {
    var r = Carrito.resumen();
    if (!r.lineas.length) {
      vacio.hidden = false;
      contenido.hidden = true;
      return;
    }
    vacio.hidden = true;
    contenido.hidden = false;

    var html = "";
    r.lineas.forEach(function (l, i) {
      var p = l.producto;
      var precio = r.cupon
        ? Carrito.fmt(l.precioUnit) + " c/u <s>" + Carrito.fmt(l.precioLista) + "</s>"
        : Carrito.fmt(l.precioUnit) + " c/u";
      html +=
        '<div class="linea" data-id="' + p.id + '" data-index="' + i + '">' +
          '<div class="bloque mini" style="--c1:' + p.color1 + ";--c2:" + p.color2 + '">' + p.sigla + "</div>" +
          "<div><h3>" + p.nombre + '</h3><div class="sub">' + precio + "</div>" +
            '<button type="button" class="enlace-btn" data-accion="quitar">Quitar</button></div>' +
          '<div class="cant"><button type="button" data-accion="menos" aria-label="Disminuir">−</button>' +
            "<span>" + l.cantidad + '</span><button type="button" data-accion="mas" aria-label="Aumentar">+</button></div>' +
          '<div class="total-linea">' + Carrito.fmt(l.totalLinea) + "</div>" +
        "</div>";
    });
    lineasEl.innerHTML = html;

    var res =
      '<div class="fila-res"><span>Productos (' + r.unidades + ')</span><span>' + Carrito.fmt(r.subtotalLista) + "</span></div>";
    if (r.cupon) {
      res += '<div class="fila-res desc"><span>Cupón ' + r.cupon + '</span><span>−' + Carrito.fmt(r.descuento) + "</span></div>";
    }
    res +=
      '<div class="fila-res total"><span>Subtotal</span><span>' + Carrito.fmt(r.subtotal) + "</span></div>" +
      '<p class="nota" style="margin:8px 0 0">El envío se calcula en el checkout.</p>' +
      '<a class="btn btn-bloque" id="ir-pago" href="checkout.html">Ir al pago</a>';
    resEl.innerHTML = res;

    quitarCuponBtn.hidden = !r.cupon;
  }

  lineasEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-accion]");
    if (!btn) return;
    var fila = btn.closest(".linea");
    var id = fila.getAttribute("data-id");
    var idx = parseInt(fila.getAttribute("data-index"), 10);
    var p = obtenerProducto(id);
    var cup = Carrito.cupon();
    var accion = btn.getAttribute("data-accion");
    var it;

    if (accion === "mas") {
      var agregadas = Carrito.agregar(id, 1);
      if (agregadas) {
        it = Carrito.item(p, agregadas, idx, cup);
        enviarEvento("add_to_cart", { currency: "COP", value: Carrito.valor([it]), items: [it] });
      }
    } else {
      var cantidadLinea = 0;
      Carrito.leer().forEach(function (l) { if (l.id === id) cantidadLinea = l.cantidad; });
      var quitadas = Carrito.quitar(id, accion === "menos" ? 1 : cantidadLinea);
      if (quitadas) {
        it = Carrito.item(p, quitadas, idx, cup);
        enviarEvento("remove_from_cart", { currency: "COP", value: Carrito.valor([it]), items: [it] });
      }
    }
    pintar();
  });

  btnCupon.addEventListener("click", function () {
    if (Carrito.aplicarCupon(inputCupon.value)) {
      msgCupon.className = "msg ok";
      msgCupon.textContent = "Cupón " + Carrito.CODIGO_CUPON + " aplicado: 10 % de descuento.";
      inputCupon.value = "";
    } else {
      msgCupon.className = "msg error";
      msgCupon.textContent = "Cupón no válido. Prueba con " + Carrito.CODIGO_CUPON + ".";
    }
    pintar();
  });
  inputCupon.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); btnCupon.click(); }
  });
  quitarCuponBtn.addEventListener("click", function () {
    Carrito.quitarCupon();
    msgCupon.className = "msg";
    msgCupon.textContent = "Cupón retirado.";
    pintar();
  });

  pintar();
  if (Carrito.cupon()) {
    msgCupon.className = "msg ok";
    msgCupon.textContent = "Cupón " + Carrito.CODIGO_CUPON + " aplicado: 10 % de descuento.";
  }

  var r0 = Carrito.resumen();
  if (r0.lineas.length) enviarEvento("view_cart", Carrito.paramsBase(r0));
})();
