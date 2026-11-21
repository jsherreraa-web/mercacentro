/* Página: detalle de producto (producto.html?id=ABC-001)
   Eventos: view_item, add_to_cart */
(function () {
  var cont = document.getElementById("detalle");
  var toast = document.getElementById("toast");
  var temporizador = null;

  function mostrarToast(texto) {
    toast.textContent = texto;
    toast.classList.add("visible");
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { toast.classList.remove("visible"); }, 2200);
  }

  var id = new URLSearchParams(window.location.search).get("id");
  var p = obtenerProducto(id);

  if (!p) {
    cont.innerHTML =
      '<div class="vacio" style="grid-column:1/-1">' +
        "<h2>Producto no encontrado</h2>" +
        "<p>El producto que buscas no existe en el catálogo.</p>" +
        '<a class="btn" href="index.html">Volver al catálogo</a>' +
      "</div>";
    return;
  }

  var cup = Carrito.cupon();
  var d = cup ? Math.round(p.precio * 0.10) : 0;
  var precioHtml = cup
    ? '<span class="precio-desc">' + Carrito.fmt(p.precio - d) + "</span><s>" + Carrito.fmt(p.precio) + "</s>"
    : Carrito.fmt(p.precio);

  cont.innerHTML =
    '<div class="bloque" style="--c1:' + p.color1 + ";--c2:" + p.color2 + '">' + p.sigla + "</div>" +
    "<div>" +
      '<a class="migas" href="index.html">← Catálogo</a><br>' +
      '<span class="cat">' + p.categoria + "</span>" +
      "<h1>" + p.nombre + "</h1>" +
      '<div class="precio">' + precioHtml + "</div>" +
      '<p class="desc">' + p.descripcion + "</p>" +
      '<div class="acciones">' +
        '<div class="cant" aria-label="Cantidad">' +
          '<button type="button" id="menos" aria-label="Disminuir">−</button>' +
          '<span id="cantidad">1</span>' +
          '<button type="button" id="mas" aria-label="Aumentar">+</button>' +
        "</div>" +
        '<button type="button" class="btn" id="btn-agregar">Agregar al carrito</button>' +
        '<a class="btn btn-sec" href="carrito.html">Ver carrito</a>' +
      "</div>" +
    "</div>";

  var cantidad = 1;
  var elCant = document.getElementById("cantidad");
  document.getElementById("menos").addEventListener("click", function () {
    cantidad = Math.max(1, cantidad - 1); elCant.textContent = cantidad;
  });
  document.getElementById("mas").addEventListener("click", function () {
    cantidad = Math.min(10, cantidad + 1); elCant.textContent = cantidad;
  });

  document.getElementById("btn-agregar").addEventListener("click", function () {
    var agregadas = Carrito.agregar(p.id, cantidad);
    if (!agregadas) { mostrarToast("Máximo de unidades alcanzado"); return; }
    var it = Carrito.item(p, agregadas, 0, Carrito.cupon());
    enviarEvento("add_to_cart", { currency: "COP", value: Carrito.valor([it]), items: [it] });
    mostrarToast(agregadas + (agregadas === 1 ? " unidad agregada" : " unidades agregadas") + " al carrito");
  });

  var itemVista = Carrito.item(p, 1, 0, cup);
  enviarEvento("view_item", { currency: "COP", value: Carrito.valor([itemVista]), items: [itemVista] });
})();
