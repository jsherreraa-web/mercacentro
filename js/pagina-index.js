/* Página: catálogo (index.html)
   Eventos: view_item_list, view_promotion, select_promotion, select_item, add_to_cart */
(function () {
  var LISTA_ID = "catalogo_principal";
  var LISTA_NOMBRE = "Catálogo principal";
  var CUPON = Carrito.CODIGO_CUPON;
  var DESTACADOS = ["ARR-001", "CAF-003", "ACE-004"]; // productos que muestra el banner

  var cont = document.getElementById("catalogo");
  var zonaPromo = document.getElementById("zona-promo");
  var toast = document.getElementById("toast");
  var temporizador = null;

  function mostrarToast(texto) {
    toast.textContent = texto;
    toast.classList.add("visible");
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { toast.classList.remove("visible"); }, 2200);
  }

  function precioHTML(p, cup) {
    if (!cup) return '<span class="precio">' + Carrito.fmt(p.precio) + "</span>";
    var d = Math.round(p.precio * 0.10);
    return '<span class="precio"><span class="precio-desc">' + Carrito.fmt(p.precio - d) + "</span><s>" + Carrito.fmt(p.precio) + "</s></span>";
  }

  /* ---------- catálogo ---------- */
  var cup = Carrito.cupon();
  var html = "";
  PRODUCTOS.forEach(function (p, i) {
    html +=
      '<article class="tarjeta">' +
        '<a class="tarjeta-enlace" href="producto.html?id=' + p.id + '" data-id="' + p.id + '" data-index="' + i + '">' +
          '<div class="bloque" style="--c1:' + p.color1 + ";--c2:" + p.color2 + '">' + p.sigla + "</div>" +
          '<p class="cat">' + p.categoria + "</p>" +
          "<h3>" + p.nombre + "</h3>" +
        "</a>" +
        '<div class="tarjeta-pie">' + precioHTML(p, cup) +
          '<button type="button" class="btn btn-peq" data-agregar="' + p.id + '" data-index="' + i + '">Agregar</button>' +
        "</div>" +
      "</article>";
  });
  cont.innerHTML = html;

  cont.addEventListener("click", function (e) {
    var enlace = e.target.closest(".tarjeta-enlace");
    if (enlace) {
      var idx = parseInt(enlace.getAttribute("data-index"), 10);
      var p = obtenerProducto(enlace.getAttribute("data-id"));
      var params = {
        currency: "COP",
        item_list_id: LISTA_ID,
        item_list_name: LISTA_NOMBRE,
        items: [Carrito.item(p, 1, idx, Carrito.cupon())]
      };
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) {
        enviarEvento("select_item", params); // el navegador abre otra pestaña: no interceptamos
        return;
      }
      e.preventDefault();
      enviarEventoYNavegar("select_item", params, enlace.getAttribute("href"));
      return;
    }
    var btn = e.target.closest("[data-agregar]");
    if (btn) {
      var prod = obtenerProducto(btn.getAttribute("data-agregar"));
      var i2 = parseInt(btn.getAttribute("data-index"), 10);
      var agregadas = Carrito.agregar(prod.id, 1);
      if (!agregadas) { mostrarToast("Máximo de unidades alcanzado"); return; }
      var it = Carrito.item(prod, agregadas, i2, Carrito.cupon(), { item_list_id: LISTA_ID, item_list_name: LISTA_NOMBRE });
      enviarEvento("add_to_cart", { currency: "COP", value: Carrito.valor([it]), items: [it] });
      mostrarToast("Agregado al carrito: " + prod.nombre);
    }
  });

  /* ---------- banner del cupón ---------- */
  function paramsPromo() {
    return {
      currency: "COP",
      promotion_id: CUPON,
      promotion_name: "Cupón de bienvenida 10 %",
      creative_name: "banner_inicio_bienvenida",
      creative_slot: "inicio_banner_principal",
      items: DESTACADOS.map(function (id, i) { return Carrito.item(obtenerProducto(id), 1, i, CUPON); })
    };
  }

  if (Carrito.cupon()) {
    zonaPromo.innerHTML = '<div class="promo-ok">✓ Cupón ' + CUPON + " aplicado: 10 % de descuento en tus productos.</div>";
  } else {
    zonaPromo.innerHTML =
      '<div class="promo" id="banner-promo">' +
        "<div>" +
          "<h2>10 % de descuento en tu primera compra</h2>" +
          "<p>Aplica el cupón de bienvenida y ahorra en toda tu despensa.</p>" +
          '<span class="codigo">' + CUPON + "</span>" +
        "</div>" +
        '<a class="btn btn-claro" id="btn-promo" href="carrito.html">Aplicar cupón</a>' +
      "</div>";
    document.getElementById("btn-promo").addEventListener("click", function (e) {
      e.preventDefault();
      Carrito.aplicarCupon(CUPON);
      enviarEventoYNavegar("select_promotion", paramsPromo(), "carrito.html");
    });
  }

  /* ---------- eventos de carga ---------- */
  enviarEvento("view_item_list", {
    currency: "COP",
    item_list_id: LISTA_ID,
    item_list_name: LISTA_NOMBRE,
    items: PRODUCTOS.map(function (p, i) { return Carrito.item(p, 1, i, cup); })
  });

  if (!Carrito.cupon()) enviarEvento("view_promotion", paramsPromo());
})();
