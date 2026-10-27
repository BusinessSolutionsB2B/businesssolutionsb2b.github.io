const WHATSAPP = "59177408901";

document.getElementById("year").textContent = new Date().getFullYear();

const nav = document.getElementById("nav");
document.getElementById("menuToggle").addEventListener("click", () => nav.classList.toggle("open"));
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

// El formulario arma un mensaje y abre WhatsApp (el sitio es estático, no necesita servidor)
document.getElementById("quoteForm").addEventListener("submit", e => {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  const msg = [
    "Hola, quiero solicitar una cotización:",
    `Tipo: ${v("tipo")}`,
    `Nombre: ${v("nombre")}`,
    v("empresa") && `Empresa: ${v("empresa")}`,
    `Correo: ${v("email")}`,
    `Ciudad: ${v("ciudad")}`,
    `País: ${v("pais")}`,
    `Monto: ${v("monto")} ${v("moneda")}`,
    `Motivo: ${v("motivo")}`
  ].filter(Boolean).join("\n");
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
});
