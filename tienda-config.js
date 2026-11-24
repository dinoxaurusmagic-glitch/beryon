/* =====================================================
   CONFIGURACIÓN DE LA TIENDA BERYON
   Aquí se cambian precios, envíos y pagos sin tocar el diseño.
   - Precio en dólares, con el envío ya incluido.
   - null = "Precio a consultar" (no se muestra precio).
===================================================== */
window.BERYON_TIENDA = {

  precios: {
    "Semaglutide":          { "5 mg": null, "10 mg": null, "15 mg": null, "20 mg": null },
    "Tirzepatide":          { "10 mg": null, "20 mg": null, "30 mg": null, "40 mg": null, "60 mg": null },
    "Retatrutide":          { "10 mg": null, "20 mg": null, "30 mg": null },
    "MOTS-c":               { "10 mg": null, "40 mg": null },
    "GHK-Cu":               { "50 mg": null, "100 mg": null },
    "Ipamorelin":           { "5 mg": null, "10 mg": null },
    "Tesamorelin":          { "5 mg": null, "10 mg": null },
    "Semax":                { "5 mg": null, "10 mg": null },
    "Selank":               { "10 mg": null, "30 mg": null },
    "NAD+":                 { "250 mg": null, "500 mg": null, "1000 mg": null },
    "BPC-157":              { "5 mg": null, "10 mg": null },
    "TB-500":               { "5 mg": null, "10 mg": null },
    "Agua bacteriostática": { "3 mL": null, "10 mL": null }
  },

  envio: {
    empresa: "Servientrega",
    tiempo: "24 a 72 horas hábiles",
    incluido: true            // el precio ya incluye el envío dentro de Ecuador
  },

  pagos: {
    transferencia: true,
    payphone: false,          // cambiar a true cuando la cuenta de Payphone esté activa
    contraEntregaCiudad: ""   // p. ej. "Quito"; vacío = no se muestra
  },

  resenasGoogle: {
    verUrl: "",               // enlace a tu perfil de Google (reseñas)
    escribirUrl: ""           // enlace "Escribir una reseña" de Google Business Profile
  }
};
