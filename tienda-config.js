/* =====================================================
   CONFIGURACIÓN DE LA TIENDA BERYON
   Aquí se cambian precios, envíos y pagos sin tocar el diseño.
   - Precio en dólares, con el envío ya incluido.
   - null = "Precio a consultar" (no se muestra precio).
===================================================== */
window.BERYON_TIENDA = {

  precios: {
    "Semaglutide":          { "5 mg": 85,  "10 mg": 125, "15 mg": 159, "20 mg": 185 },
    "Tirzepatide":          { "10 mg": 149, "20 mg": 225, "30 mg": 289, "40 mg": 339, "60 mg": 459 },
    "Retatrutide":          { "10 mg": 169, "20 mg": 289, "30 mg": 315 },
    "MOTS-c":               { "10 mg": 105, "40 mg": 279 },
    "GHK-Cu":               { "50 mg": 89,  "100 mg": 129 },
    "Ipamorelin":           { "5 mg": 59,  "10 mg": 99 },
    "Tesamorelin":          { "5 mg": 79,  "10 mg": 135 },
    "Semax":                { "5 mg": 55,  "10 mg": 82 },
    "Selank":               { "10 mg": 75, "30 mg": 159 },
    "NAD+":                 { "250 mg": 69, "500 mg": 119, "1000 mg": 195 },
    "BPC-157":              { "5 mg": 69,  "10 mg": 109 },
    "TB-500":               { "5 mg": 79,  "10 mg": 109 },
    "Agua bacteriostática": { "3 mL": 12,  "10 mL": 25 }
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
