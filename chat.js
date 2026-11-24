/* =====================================================
   CHAT BERYON — asistente informativo
   Se carga en todas las páginas con:
     <script src="chat.js" defer></script>
   Crea el botón flotante y el panel, y carga chat.css.
   Para cambiar el chat en todo el sitio, solo se edita este archivo.
===================================================== */
(function () {
  "use strict";

  var URL_EXEC = "https://script.google.com/macros/s/AKfycbwVut9nxnVL7X3m49tCkIS4wk9C6kxYGacYHRldVGd6FeOsU7ianv7NJVn5b7WN6aLD/exec";
  var TIMEOUT_MS = 30000;   // tiempo máximo de espera por respuesta
  var MAX_TURNOS = 10;      // pares pregunta/respuesta que se envían como contexto

  // Evita cargarlo dos veces en la misma página
  if (window.__chatBeryon || document.getElementById("bb-open")) return;
  window.__chatBeryon = true;

  function iniciar() {
    // ---------- Estilos ----------
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "chat.css";
    document.head.appendChild(css);

    // ---------- Botón y panel ----------
    var cont = document.createElement("div");
    cont.innerHTML =
      '<button id="bb-open" type="button" aria-label="Abrir chat" aria-expanded="false" aria-controls="bb-chat">' +
        '<img src="chat-logo.webp" width="192" height="192" alt="" aria-hidden="true">' +
        '<span class="bb-x" aria-hidden="true">×</span>' +
      '</button>' +
      '<div id="bb-chat" role="dialog" aria-label="Asistente BERYON" hidden>' +
        '<div id="bb-head"><span id="bb-head-title"><img src="chat-logo.webp" width="192" height="192" alt=""><span>Asistente BERYON<small>Información educativa</small></span></span>' +
        '<button id="bb-close" type="button" aria-label="Cerrar chat">×</button></div>' +
        '<div id="bb-log" aria-live="polite"></div>' +
        '<div id="bb-note">Información educativa. No sustituye la valoración médica.</div>' +
        '<form id="bb-form">' +
          '<input id="bb-in" placeholder="Escribe tu pregunta..." maxlength="500" autocomplete="off" aria-label="Escribe tu pregunta">' +
          '<button id="bb-send" type="submit">Enviar</button>' +
        '</form>' +
      '</div>';
    while (cont.firstChild) document.body.appendChild(cont.firstChild);

    var open = document.getElementById("bb-open"),
        box = document.getElementById("bb-chat"),
        close = document.getElementById("bb-close"),
        log = document.getElementById("bb-log"),
        form = document.getElementById("bb-form"),
        input = document.getElementById("bb-in"),
        send = document.getElementById("bb-send"),
        msgs = [],
        busy = false;

    var ERRORES = {
      timeout: "La respuesta está tardando demasiado. Intenta de nuevo en un momento.",
      red: "No pude conectarme. Revisa tu conexión e intenta de nuevo.",
      formato: "Recibí una respuesta inválida del servidor. Intenta de nuevo en un momento.",
      servidor: "El asistente no está disponible en este momento. Intenta de nuevo más tarde o escríbenos por WhatsApp."
    };

    function add(text, who) {
      var d = document.createElement("div");
      d.className = "bb-m " + (who === "u" ? "bb-u" : "bb-b");
      d.textContent = text;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    }

    function setChat(show) {
      box.hidden = !show;
      open.setAttribute("aria-expanded", show ? "true" : "false");
      open.setAttribute("aria-label", show ? "Cerrar chat" : "Abrir chat");
      if (show) {
        if (!log.children.length)
          add("Hola, soy el asistente informativo de BERYON. ¿Qué te gustaría saber?", "b");
        input.focus();
      }
    }

    open.onclick = function () { setChat(box.hidden); };
    close.onclick = function () { setChat(false); open.focus(); };

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !box.hidden) { setChat(false); open.focus(); }
    });

    function setBusy(b) {
      busy = b;
      send.disabled = b;
      input.disabled = b;
      send.textContent = b ? "..." : "Enviar";
      if (!b) input.focus();
    }

    // Historial válido para Gemini: empieza con "user" y alterna user/model.
    // Solo se guardan pares completos (pregunta + respuesta real).
    function historial(pregunta) {
      var h = msgs.slice(-MAX_TURNOS * 2);
      while (h.length && h[0].role !== "user") h.shift();
      return h.concat([{ role: "user", text: pregunta }]);
    }

    form.onsubmit = function (e) {
      e.preventDefault();
      var t = input.value.trim();
      if (!t || busy) return;
      input.value = "";
      add(t, "u");
      var wait = add("...", "b");
      wait.setAttribute("aria-busy", "true");
      setBusy(true);

      var ctrl = typeof AbortController === "function" ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);
      var tipoError = "red";
      var mensajeServidor = "";

      fetch(URL_EXEC, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ messages: historial(t) }),
        signal: ctrl ? ctrl.signal : undefined
      })
        .then(function (r) {
          if (!r.ok) { tipoError = "servidor"; throw new Error("HTTP " + r.status); }
          return r.text();
        })
        .then(function (txt) {
          var j;
          try { j = JSON.parse(txt); } catch (err) { tipoError = "formato"; throw err; }
          if (!j || typeof j !== "object") { tipoError = "formato"; throw new Error("sin objeto"); }
          // El servidor indica fallo con { ok:false, error:"..." }
          if (j.ok === false || j.error) {
            tipoError = "servidor";
            // El script puede explicar el motivo (p. ej. consulta no permitida)
            if (typeof j.reply === "string" && j.reply.trim()) mensajeServidor = j.reply.trim().slice(0, 300);
            throw new Error(String(j.error || "error del servidor"));
          }
          var reply = typeof j.reply === "string" ? j.reply.trim() : "";
          if (!reply) { tipoError = "servidor"; throw new Error("respuesta vacía"); }
          wait.textContent = reply;
          msgs.push({ role: "user", text: t }, { role: "model", text: reply });
        })
        .catch(function (err) {
          if (err && err.name === "AbortError") tipoError = "timeout";
          wait.textContent = mensajeServidor || ERRORES[tipoError] || ERRORES.red;
          wait.classList.add("bb-err");
          if (window.console) console.warn("[Chat BERYON]", tipoError, err);
        })
        .then(function () {
          clearTimeout(timer);
          wait.removeAttribute("aria-busy");
          setBusy(false);
          log.scrollTop = log.scrollHeight;
        });
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
