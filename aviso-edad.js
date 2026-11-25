/* =====================================================
   AVISO DE EDAD Y USO — BERYON
   Ventana de confirmación que aparece la primera vez que
   alguien entra a cualquier página. Se recuerda 30 días.
   Los buscadores (Google) no la ven, así no afecta el SEO.
===================================================== */
(function () {
  "use strict";
  var CLAVE = "beryon_aviso_edad";
  var DIAS = 30;
  var SALIDA = "https://www.google.com/";

  // No molestar a los robots de buscadores
  if (/bot|crawl|spider|slurp|lighthouse|facebookexternalhit|whatsapp/i.test(navigator.userAgent)) return;

  try {
    var guardado = parseInt(localStorage.getItem(CLAVE) || "0", 10);
    if (guardado && Date.now() - guardado < DIAS * 864e5) return;
  } catch (e) { /* sin almacenamiento: se muestra igual */ }

  var css =
    "#ae-fondo{position:fixed;inset:0;z-index:5000;background:rgba(2,20,40,.82);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}" +
    "#ae-caja{background:#fff;color:#09234a;width:100%;max-width:440px;border-radius:18px;padding:0 24px 22px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.45);font-family:Inter,Arial,sans-serif;text-align:center;margin:auto}" +
    "#ae-caja .ae-top{background:#062543;margin:0 -24px 18px;padding:18px 0}" +
    "#ae-caja img{width:150px;height:auto;margin:0 auto;display:block}" +
    "#ae-caja h2{font-family:Montserrat,Inter,Arial,sans-serif;font-size:21px;margin:0 0 8px;color:#062543}" +
    "#ae-caja p.ae-intro{font-size:14px;line-height:1.5;margin:0 0 16px;color:#3a5470}" +
    "#ae-caja ul{list-style:none;padding:0;margin:0 0 18px;text-align:left}" +
    "#ae-caja li{display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.45;padding:9px 12px;background:#eef5f9;border-radius:10px;margin-bottom:8px}" +
    "#ae-caja li span.ae-ok{flex:0 0 20px;height:20px;border-radius:50%;background:#0789c5;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px}" +
    "#ae-si{display:block;width:100%;border:0;border-radius:12px;background:#0789c5;color:#fff;font:700 15px Montserrat,Inter,Arial,sans-serif;padding:14px;cursor:pointer;transition:background .2s}" +
    "#ae-si:hover,#ae-si:focus-visible{background:#056a99}" +
    "#ae-no{display:block;width:100%;border:0;background:transparent;color:#5b7189;font:600 14px Inter,Arial,sans-serif;padding:12px 8px 2px;cursor:pointer;text-decoration:underline}" +
    "#ae-caja p.ae-legal{font-size:11.5px;color:#6b8096;margin:12px 0 0;line-height:1.4}" +
    "html.ae-bloqueo,html.ae-bloqueo body{overflow:hidden}";

  function mostrar() {
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    var fondo = document.createElement("div");
    fondo.id = "ae-fondo";
    fondo.setAttribute("role", "dialog");
    fondo.setAttribute("aria-modal", "true");
    fondo.setAttribute("aria-labelledby", "ae-titulo");
    fondo.innerHTML =
      '<div id="ae-caja">' +
        '<div class="ae-top"><img src="logo-beryon.webp" alt="BERYON" width="150"></div>' +
        '<h2 id="ae-titulo">Antes de continuar</h2>' +
        '<p class="ae-intro">Este sitio ofrece péptidos de grado investigación. Para entrar, confirma que:</p>' +
        '<ul>' +
          '<li><span class="ae-ok">✓</span><span>Soy <strong>mayor de 18 años</strong>.</span></li>' +
          '<li><span class="ae-ok">✓</span><span>Entiendo que los productos son <strong>solo para investigación</strong> (Research Use Only) y <strong>no para consumo humano</strong>.</span></li>' +
          '<li><span class="ae-ok">✓</span><span>La información del sitio es educativa y <strong>no reemplaza la consulta con un profesional de salud</strong>.</span></li>' +
        '</ul>' +
        '<button type="button" id="ae-si">Sí, soy mayor de 18 y acepto</button>' +
        '<button type="button" id="ae-no">No, salir</button>' +
        '<p class="ae-legal">Al continuar aceptas estas condiciones de uso del sitio.</p>' +
      '</div>';
    document.body.appendChild(fondo);
    document.documentElement.classList.add("ae-bloqueo");

    var si = document.getElementById("ae-si");
    var no = document.getElementById("ae-no");
    si.focus();

    si.addEventListener("click", function () {
      try { localStorage.setItem(CLAVE, String(Date.now())); } catch (e) {}
      fondo.remove();
      document.documentElement.classList.remove("ae-bloqueo");
    });
    no.addEventListener("click", function () { location.href = SALIDA; });

    // Mantener el foco del teclado dentro de la ventana
    fondo.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === si) { e.preventDefault(); no.focus(); }
      else if (!e.shiftKey && document.activeElement === no) { e.preventDefault(); si.focus(); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mostrar);
  else mostrar();
})();
