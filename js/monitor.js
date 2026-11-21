/* Monitor de eventos (ayuda didáctica). Panel fijo a la derecha (380 px) que
   reserva su espacio con padding-right en el body; en pantallas < 820 px pasa
   abajo con 300 px de alto. Muestra estado, origen UTM y los últimos 12 eventos. */
(function () {
  var CLAVE_ORIGEN = "mc_origen";
  var CLAVE_ESTADO = "mc_monitor_oculto";

  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function limpiar(v) { return String(v).replace(/[\r\n\t]+/g, " ").slice(0, 60); }

  function origenVisita() {
    var guardado = null;
    try { guardado = window.sessionStorage.getItem(CLAVE_ORIGEN); } catch (e) { /* nada */ }
    if (guardado) return guardado;
    var q = new URLSearchParams(window.location.search);
    var fuente = q.get("utm_source");
    var o = fuente
      ? limpiar(fuente) + " / " + limpiar(q.get("utm_medium") || "(sin medium)") + " · " + limpiar(q.get("utm_campaign") || "(sin campaign)")
      : "directo (sin UTM)";
    try { window.sessionStorage.setItem(CLAVE_ORIGEN, o); } catch (e) { /* nada */ }
    return o;
  }

  function borrarCookiesGA() {
    var host = window.location.hostname;
    var dominios = [null, host, "." + host];
    if (!/^\d+(\.\d+){3}$/.test(host)) {
      var partes = host.split(".");
      for (var i = 1; i < partes.length - 1; i++) {
        var d = partes.slice(i).join(".");
        dominios.push(d, "." + d);
      }
    }
    document.cookie.split(";").forEach(function (c) {
      var nombre = c.split("=")[0].trim();
      if (!/^_ga/.test(nombre)) return;
      dominios.forEach(function (d) {
        document.cookie = nombre + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }

  function simularNuevoVisitante() {
    borrarCookiesGA();
    try {
      var borrar = [];
      for (var i = 0; i < window.localStorage.length; i++) {
        var k = window.localStorage.key(i);
        if (k && k.indexOf("mc_") === 0 && k !== CLAVE_ESTADO) borrar.push(k); // carrito y cupón
      }
      borrar.forEach(function (k) { window.localStorage.removeItem(k); });
    } catch (e) { /* nada */ }
    try { window.sessionStorage.clear(); } catch (e) { /* nada */ }
    window.location.href = "index.html";
  }

  /* ---------- estructura ---------- */
  var aside = el("aside");
  aside.id = "monitor";
  aside.setAttribute("aria-label", "Monitor de eventos de Google Analytics 4");

  var cab = el("div", "mon-cab");
  cab.appendChild(el("strong", null, "Monitor de eventos GA4"));
  var btnToggle = el("button", "mon-toggle", "Ocultar");
  btnToggle.type = "button";
  cab.appendChild(btnToggle);

  var cuerpo = el("div", "mon-cuerpo");
  var estado = el("div", "mon-estado");
  estado.id = "mon-estado";

  var bloqueOrigen = el("div", "mon-bloque");
  bloqueOrigen.appendChild(el("span", "mon-etq", "Origen de la visita"));
  var origenEl = el("div", "mon-origen");
  origenEl.id = "mon-origen";
  bloqueOrigen.appendChild(origenEl);

  var bloqueLista = el("div", "mon-bloque mon-bloque-lista");
  bloqueLista.appendChild(el("span", "mon-etq", "Últimos eventos (máx. 12)"));
  var lista = el("ol", "mon-lista");
  lista.id = "mon-lista";
  bloqueLista.appendChild(lista);

  var btnReset = el("button", "mon-reset", "Simular nuevo visitante");
  btnReset.type = "button";
  btnReset.id = "mon-reset";

  cuerpo.appendChild(estado);
  cuerpo.appendChild(bloqueOrigen);
  cuerpo.appendChild(bloqueLista);
  cuerpo.appendChild(btnReset);
  aside.appendChild(cab);
  aside.appendChild(cuerpo);
  document.body.appendChild(aside);

  /* ---------- contenido ---------- */
  var A = window.Analitica || { activo: false };
  if (A.activo) {
    estado.className = "mon-estado ok";
    estado.textContent = "Conectado a " + A.id + (A.debug ? " · modo depuración" : "");
  } else {
    estado.className = "mon-estado error";
    estado.textContent = "Sin ID de medición: los eventos solo se muestran aquí. Edita js/config.js.";
  }
  origenEl.textContent = origenVisita();

  function pintarEventos() {
    var datos = A.leerLog ? A.leerLog() : [];
    lista.textContent = "";
    if (!datos.length) { lista.appendChild(el("li", "mon-vacio", "Aún no hay eventos.")); return; }
    datos.forEach(function (ev) {
      var li = el("li", "mon-ev");
      var fila = el("div", "mon-ev-fila");
      fila.appendChild(el("span", "mon-ev-hora", ev.h));
      fila.appendChild(el("span", "mon-ev-nombre" + (ev.n === "purchase" ? " compra" : ""), ev.n));
      li.appendChild(fila);
      if (ev.r) li.appendChild(el("div", "mon-ev-res", ev.r));
      var det = el("details", "mon-ev-det");
      det.appendChild(el("summary", null, "Ver parámetros"));
      det.appendChild(el("pre", null, JSON.stringify(ev.p, null, 2)));
      li.appendChild(det);
      lista.appendChild(li);
    });
  }
  pintarEventos();
  window.addEventListener("mc:evento", pintarEventos);

  /* ---------- plegar / mostrar ---------- */
  function aplicarEstado(oculto) {
    aside.classList.toggle("plegado", oculto);
    document.body.classList.toggle("mon-oculto", oculto);
    btnToggle.textContent = oculto ? "Mostrar monitor" : "Ocultar";
    btnToggle.setAttribute("aria-expanded", oculto ? "false" : "true");
  }
  var oculto = false;
  try { oculto = window.localStorage.getItem(CLAVE_ESTADO) === "1"; } catch (e) { /* nada */ }
  aplicarEstado(oculto);
  btnToggle.addEventListener("click", function () {
    oculto = !oculto;
    try { window.localStorage.setItem(CLAVE_ESTADO, oculto ? "1" : "0"); } catch (e) { /* nada */ }
    aplicarEstado(oculto);
  });

  btnReset.addEventListener("click", simularNuevoVisitante);
})();
