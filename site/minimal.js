const body = document.body;
const navToggle = document.querySelector("[data-nav-toggle]");
const quoteForm = document.querySelector("#minimalQuoteForm");
const statusNode = document.querySelector("[data-form-status]");
const serviceLinks = document.querySelectorAll("[data-service-target]");
const serviceSelect = document.querySelector('select[name="service"]');
const currentLanguage = document.documentElement.lang.startsWith("es") ? "es" : "en";

const copy = {
  en: {
    demo: "Static concept demo. Email sending remains available only in the backend version.",
  },
  es: {
    demo: "Demo estatico del concepto. El envio por correo sigue disponible solo en la version con backend.",
  },
};

navToggle?.addEventListener("click", () => {
  body.classList.toggle("menu-open");
});

document.querySelectorAll('.primary-nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("menu-open");
  });
});

serviceLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (serviceSelect) {
      serviceSelect.value = link.dataset.serviceTarget;
    }
  });
});

quoteForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  statusNode.textContent = copy[currentLanguage].demo;
  statusNode.dataset.state = "success";
});
