/* =====================================================
   TIENDA BERYON — precios, envíos, pagos y reseñas
   Lee la configuración de tienda-config.js.
===================================================== */
(function () {
  "use strict";
  var C = window.BERYON_TIENDA || { precios: {}, envio: {}, pagos: {}, resenasGoogle: {} };

  function fmt(n) {
    return "$" + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0);
  }

  // Precio de un producto y presentación (o null)
  function precio(producto, presentacion) {
    var p = C.precios && C.precios[producto];
    var v = p ? p[presentacion] : null;
    return typeof v === "number" && v > 0 ? v : null;
  }
  window.BERYON_precio = precio;

  // ¿Es la presentación que se regala con cada pedido?
  function esRegalo(producto, presentacion) {
    var p = C.precios && C.precios[producto];
    return !!p && p[presentacion] === "incluida";
  }
  var R = C.regalo || null;
  function hayRegalo() { return !!(R && R.texto); }

  // Textos de la regla de envío
  var E = C.envio || {};
  function envioCorto() {
    if (E.gratisDesde) return "Envío gratis comprando " + E.gratisDesde + " o más productos";
    if (E.incluido) return "Envío incluido a todo Ecuador";
    return "";
  }
  function envioDetalle() {
    if (E.gratisDesde) {
      return "Envío gratis si tu pedido tiene " + E.gratisDesde + " o más productos (pueden ser diferentes)" +
        (E.costo ? "; si pides 1 solo producto, el envío cuesta " + fmt(E.costo) : "") + ".";
    }
    return E.incluido ? "Envío incluido." : "";
  }

  // Mensaje de WhatsApp para pedir un producto
  window.BERYON_mensajePedido = function (producto, presentacion) {
    var v = precio(producto, presentacion);
    var formas = ["transferencia"];
    if (C.pagos && C.pagos.payphone) formas.push("tarjeta (Payphone)");
    if (C.pagos && C.pagos.contraEntregaCiudad) formas.push("contra entrega en " + C.pagos.contraEntregaCiudad);
    if (esRegalo(producto, presentacion)) {
      return "Hola, tengo una consulta sobre el " + producto.toLowerCase() + " " + presentacion +
        " que viene de regalo con los pedidos de BERYON.";
    }
    var extra = hayRegalo() && producto !== R.producto ? " + " + R.texto.charAt(0).toLowerCase() + R.texto.slice(1) : "";
    var linea = v
      ? "Hola, quiero pedir " + producto + " " + presentacion + " (" + fmt(v) + (E.incluido ? ", envío incluido" : "") + extra + ") en BERYON."
      : "Hola, quisiera consultar disponibilidad y precio de " + producto + " " + presentacion + " en BERYON.";
    return linea + "\n\nCantidad: \nCiudad de entrega: \nForma de pago (" + formas.join(" / ") + "): " +
      (v && envioDetalle() ? "\n\n" + envioDetalle() : "");
  };

  // ---------- Precio en cada tarjeta ----------
  function pintarPrecio(card) {
    var activa = card.querySelector(".presentation-option.active") || card.querySelector(".presentation-option");
    if (!activa) return;
    var caja = card.querySelector(".price-display");
    if (!caja) {
      caja = document.createElement("div");
      caja.className = "price-display";
      caja.setAttribute("aria-live", "polite");
      var stock = card.querySelector(".stock-display");
      (stock || activa.parentNode).insertAdjacentElement("afterend", caja);
    }
    var prod = activa.dataset.product, pres = activa.dataset.presentation;
    var v = precio(prod, pres);
    var regaloAqui = hayRegalo() && prod !== R.producto;
    if (activa.dataset.stock === "agotado") {
      caja.innerHTML = '<span class="price-muted">Presentación agotada</span>';
    } else if (esRegalo(prod, pres)) {
      caja.innerHTML = '<span class="price-value price-free">Gratis</span>' +
        '<span class="price-note">Incluida con cada pedido · no se vende por separado</span>';
    } else if (v) {
      caja.innerHTML = '<span class="price-value">' + fmt(v) + '</span>' +
        (E.incluido ? '<span class="price-note">' + envioCorto() + '</span>' : '') +
        (regaloAqui ? '<span class="price-gift">+ ' + R.texto + '</span>' : '');
    } else {
      caja.innerHTML = '<span class="price-muted">Precio a consultar</span>';
    }
  }

  function iniciarPrecios() {
    var cards = document.querySelectorAll("#grid .card");
    for (var i = 0; i < cards.length; i++) pintarPrecio(cards[i]);
    document.addEventListener("click", function (e) {
      var opt = e.target.closest && e.target.closest(".presentation-option");
      if (opt) { var card = opt.closest(".card"); if (card) pintarPrecio(card); }
    });
  }

  // ---------- Sección Envíos y pagos ----------
  function iconoSVG(path) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }
  var ICONOS = {
    envio: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>',
    reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    banco: '<path d="M3 9.5 12 4l9 5.5"/><path d="M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 19.5h18"/>',
    tarjeta: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
    efectivo: '<rect x="2.5" y="6.5" width="19" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
    whatsapp: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z"/>',
    regalo: '<rect x="3.5" y="8.5" width="17" height="12" rx="1.5"/><path d="M2.5 8.5h19v4h-19zM12 8.5v12"/><path d="M12 8.5c-1.8-3.6-5.5-3.6-5.5-1.3 0 1.3 2.2 1.3 5.5 1.3zM12 8.5c1.8-3.6 5.5-3.6 5.5-1.3 0 1.3-2.2 1.3-5.5 1.3z"/>'
  };

  function seccionEnviosPagos() {
    var e = C.envio || {}, p = C.pagos || {};
    var pagos = [];
    if (p.transferencia) pagos.push(['banco', 'Transferencia bancaria', 'Te enviamos los datos de la cuenta al confirmar tu pedido.']);
    if (p.payphone) pagos.push(['tarjeta', 'Tarjeta con Payphone', 'Paga con tarjeta de crédito o débito mediante un enlace seguro de Payphone.']);
    if (p.contraEntregaCiudad) pagos.push(['efectivo', 'Contra entrega en ' + p.contraEntregaCiudad, 'Pagas en efectivo al recibir tu pedido (solo en ' + p.contraEntregaCiudad + ').']);

    var s = document.createElement("section");
    s.className = "ship-pay";
    s.id = "envios-pagos";
    s.setAttribute("aria-labelledby", "ship-pay-title");
    s.innerHTML =
      '<div class="ship-pay-head"><p class="ship-kicker">Envíos y pagos</p>' +
      '<h2 id="ship-pay-title">Recibe tu pedido en todo Ecuador</h2>' +
      '<p>' + (e.gratisDesde ? 'Envío gratis cuando tu pedido tiene ' + e.gratisDesde + ' o más productos, sean cuales sean.'
              : (e.incluido ? 'El precio publicado ya incluye el envío.' : '')) + '</p></div>' +
      '<div class="ship-grid">' +
        (e.gratisDesde
          ? tarjeta('envio', 'Envío gratis desde ' + e.gratisDesde + ' productos',
              'Con ' + (e.empresa || 'courier') + ' a cualquier ciudad de Ecuador cuando tu pedido tiene ' + e.gratisDesde + ' o más productos. Pueden ser diferentes: por ejemplo, Semaglutide + BPC-157.' +
              (e.costo ? ' Si pides 1 solo producto, el envío cuesta ' + fmt(e.costo) + '.' : ''))
          : tarjeta('envio', 'Envío con ' + (e.empresa || 'courier'), e.incluido ? 'Incluido en el precio, a cualquier ciudad de Ecuador.' : 'A cualquier ciudad de Ecuador.')) +
        tarjeta('reloj', 'Entrega en ' + (e.tiempo || 'pocos días'), 'Tiempo estimado desde la confirmación del pago. Recibes la guía de seguimiento de ' + (e.empresa || 'tu envío') + '.') +
        (hayRegalo() ? tarjeta('regalo', R.texto, 'Incluida gratis en cada pedido de péptidos. No se cobra aparte' + (e.gratisDesde ? ' ni cuenta para el envío gratis.' : '.')) : '') +
        pagos.map(function (x) { return tarjeta(x[0], x[1], x[2]); }).join('') +
      '</div>' +
      '<ol class="ship-steps" aria-label="Cómo hacer tu pedido">' +
        '<li><strong>1</strong>Elige el producto y la presentación.</li>' +
        '<li><strong>2</strong>Pulsa «Consultar disponibilidad» y escríbenos por WhatsApp.</li>' +
        '<li><strong>3</strong>Confirma tu pedido y elige la forma de pago.</li>' +
        '<li><strong>4</strong>Recibe tu pedido con ' + (e.empresa || 'el courier') + '.</li>' +
      '</ol>';
    return s;

    function tarjeta(icono, titulo, texto) {
      return '<div class="ship-item">' + iconoSVG(ICONOS[icono]) + '<strong>' + titulo + '</strong><span>' + texto + '</span></div>';
    }
  }

  // ---------- Reseñas de Google (solo si hay enlace) ----------
  function seccionResenas() {
    var r = C.resenasGoogle || {};
    if (!r.verUrl && !r.escribirUrl) return null;
    var s = document.createElement("section");
    s.className = "reviews-google";
    s.setAttribute("aria-labelledby", "reviews-title");
    s.innerHTML =
      '<p class="ship-kicker">Opiniones de clientes</p>' +
      '<h2 id="reviews-title">¿Ya compraste en BERYON?</h2>' +
      '<p>Las reseñas se publican directamente en nuestro perfil de Google.</p>' +
      '<div class="reviews-actions">' +
        (r.verUrl ? '<a class="rv-btn" href="' + r.verUrl + '" target="_blank" rel="noopener noreferrer">Ver reseñas en Google</a>' : '') +
        (r.escribirUrl ? '<a class="rv-btn rv-primary" href="' + r.escribirUrl + '" target="_blank" rel="noopener noreferrer">Dejar una reseña</a>' : '') +
      '</div>';
    return s;
  }

  function iniciarSecciones() {
    var ancla = document.querySelector(".info-strip") || document.getElementById("catalogo");
    if (!ancla) return;
    var sp = seccionEnviosPagos();
    ancla.parentNode.insertBefore(sp, ancla);
    // Los 4 pasos nuevos reemplazan a la franja antigua "Explora / Revisa / Contacta"
    if (ancla.classList.contains("info-strip")) ancla.remove();
    var rv = seccionResenas();
    if (rv) sp.insertAdjacentElement("afterend", rv);
  }

  function iniciar() { iniciarPrecios(); iniciarSecciones(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
