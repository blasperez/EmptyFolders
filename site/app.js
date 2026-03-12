const body = document.body;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const panelParents = document.querySelectorAll("[data-panel-parent]");
const panelToggles = document.querySelectorAll("[data-panel-toggle]");
const serviceButtons = document.querySelectorAll("[data-service-select]");
const servicePanels = document.querySelectorAll("[data-service-panel]");
const serviceInput = document.querySelector('input[name="serviceType"]');
const quoteSection = document.querySelector("#quote");
const quoteForm = document.querySelector("#quoteForm");
const statusNode = document.querySelector("[data-form-status]");
const fileInput = document.querySelector('input[name="supportingDocument"]');
const fileNameNode = document.querySelector("[data-file-name]");
const currentLanguage = document.documentElement.lang.startsWith("es") ? "es" : "en";
const urlParams = new URLSearchParams(window.location.search);
const initialServiceFromQuery = urlParams.get("service");
const defaultHomeTarget = currentLanguage === "es" ? "propuesta1-es" : "propuesta1";
const homeTarget = urlParams.get("home") || defaultHomeTarget;
const isStaticPreview =
  window.location.protocol === "file:" ||
  window.location.hostname.endsWith("github.io") ||
  !window.location.hostname ||
  window.location.pathname.includes("/proyectoMJ/");

function rewriteLinks(prefixes, nextBase) {
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const matchedPrefix = prefixes.find((prefix) => href.startsWith(prefix));
    if (!matchedPrefix) {
      return;
    }

    link.setAttribute("href", `${nextBase}${href.slice(matchedPrefix.length)}`);
  });
}

function getLocalizedHomeTarget(language) {
  if (language === "es") {
    return homeTarget.endsWith("-es") ? homeTarget : `${homeTarget}-es`;
  }

  return homeTarget.endsWith("-es") ? homeTarget.slice(0, -3) : homeTarget;
}

if (homeTarget) {
  const homeBase = `./${homeTarget}.html`;
  const localizedPrefixes =
    currentLanguage === "es"
      ? ["./minimal-es.html", "./propuesta1-es.html", "./propuesta5-es.html"]
      : ["./minimal.html", "./propuesta1.html", "./propuesta5.html"];

  rewriteLinks(localizedPrefixes, homeBase);

  if (window.location.pathname.endsWith("/minimal-services.html") || window.location.pathname.endsWith("/minimal-services-es.html")) {
    document.querySelectorAll(".language-switch__link").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href.includes("minimal-services-es.html")) {
        link.setAttribute("href", `./minimal-services-es.html?home=${getLocalizedHomeTarget("es")}`);
      }
      if (href.includes("minimal-services.html") && !href.includes("minimal-services-es.html")) {
        link.setAttribute("href", `./minimal-services.html?home=${getLocalizedHomeTarget("en")}`);
      }
    });
  }
}

const uiText = {
  en: {
    sending: "Sending quote request...",
    noFile: "No file selected",
    preview: "Quote request saved in preview mode. Add SMTP credentials to enable live email delivery.",
    success: "Quote request sent successfully. Our team will contact you shortly.",
    error: "The quote request could not be sent.",
    staticDemo:
      "Static demo on GitHub Pages. The design is fully visible, but email sending requires the backend version.",
  },
  es: {
    sending: "Enviando solicitud de cotizacion...",
    noFile: "Ningun archivo seleccionado",
    preview: "Solicitud guardada en modo de prueba. Falta configurar el correo real.",
    success: "Solicitud enviada correctamente. Nuestro equipo te contactara pronto.",
    error: "No se pudo enviar la solicitud de cotizacion.",
    staticDemo:
      "Demo estatica en GitHub Pages. El diseno funciona completo, pero el envio por correo requiere la version con backend.",
  },
};

const serviceFieldMap = {
  ftl: ["equipmentType", "shippingFrequency", "cargoDetails"],
  ltl: [
    "palletCount",
    "weight",
    "weightUnit",
    "dimensions",
    "measurementUnit",
    "ltlServiceLevel",
    "shippingFrequency",
    "commodityDescription",
  ],
  drayage: ["weight", "weightUnit", "containerType", "shippingFrequency", "cargoDetails"],
  courier: [
    "packageCount",
    "weight",
    "weightUnit",
    "dimensions",
    "measurementUnit",
    "courierServiceLevel",
    "shippingFrequency",
    "commodityDescription",
  ],
  insurance: ["weight", "weightUnit", "estimatedValue", "cargoDetails", "supportingDocument"],
};

function closeNavigation() {
  body.classList.remove("menu-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

function closePanels(exceptParent = null) {
  panelParents.forEach((parent) => {
    const isOpen = parent === exceptParent;
    parent.classList.toggle("is-open", isOpen);
    parent.querySelector("[data-panel-toggle]")?.setAttribute("aria-expanded", String(isOpen));
  });
}

function setHeaderState() {
  header?.classList.toggle("is-condensed", window.scrollY > 18);
}

function setActiveService(service, options = {}) {
  if (!serviceFieldMap[service] || !serviceInput) {
    return;
  }

  serviceInput.value = service;

  serviceButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.serviceSelect === service);
  });

  servicePanels.forEach((panel) => {
    const isActive = panel.dataset.servicePanel === service;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);

    panel.querySelectorAll("input, select, textarea").forEach((field) => {
      const fieldName = field.getAttribute("name");
      field.required = isActive && serviceFieldMap[service].includes(fieldName);
      field.disabled = !isActive;
    });
  });

  if (options.scrollToForm) {
    quoteSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

navToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

panelToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const parent = toggle.closest("[data-panel-parent]");
    const open = !parent.classList.contains("is-open");
    closePanels(open ? parent : null);
  });
});

document.addEventListener("click", (event) => {
  if (nav && !nav.contains(event.target) && !navToggle?.contains(event.target)) {
    closeNavigation();
  }

  if (![...panelParents].some((parent) => parent.contains(event.target))) {
    closePanels();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
    closePanels();
  }
});

document.querySelectorAll('.primary-nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    closeNavigation();
    closePanels();
  });
});

serviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveService(button.dataset.serviceSelect, { scrollToForm: button.tagName === "BUTTON" });
    closeNavigation();
    closePanels();
  });
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const delay = entry.target.dataset.revealDelay || "0";
      entry.target.style.setProperty("--reveal-delay", `${delay}ms`);
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll("[data-reveal]").forEach((node) => {
  revealObserver.observe(node);
});

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const target = Number(entry.target.dataset.count || "0");
      const duration = 1200;
      const start = performance.now();

      const tick = (timestamp) => {
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        entry.target.textContent = Math.round(target * eased).toString();
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.45 }
);

document.querySelectorAll("[data-count]").forEach((counter) => {
  counterObserver.observe(counter);
});

document.querySelectorAll("[data-accordion-trigger]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const item = trigger.closest(".accordion__item");
    const panel = item?.querySelector(".accordion__panel");
    const isOpen = item?.classList.contains("is-open");

    document.querySelectorAll(".accordion__item").forEach((currentItem) => {
      currentItem.classList.remove("is-open");
      currentItem.querySelector(".accordion__panel")?.setAttribute("hidden", "");
      currentItem.querySelector("[data-accordion-trigger]")?.setAttribute("aria-expanded", "false");
    });

    if (!isOpen && item && panel) {
      item.classList.add("is-open");
      panel.removeAttribute("hidden");
      trigger.setAttribute("aria-expanded", "true");
    }
  });
});

fileInput?.addEventListener("change", () => {
  if (fileNameNode) {
    fileNameNode.textContent = fileInput.files?.[0]?.name || uiText[currentLanguage].noFile;
  }
});

quoteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!quoteForm.reportValidity()) {
    return;
  }

  const submitButton = quoteForm.querySelector('button[type="submit"]');
  const formData = new FormData(quoteForm);

  if (isStaticPreview) {
    statusNode.textContent = uiText[currentLanguage].staticDemo;
    statusNode.dataset.state = "success";
    return;
  }

  statusNode.textContent = uiText[currentLanguage].sending;
  statusNode.dataset.state = "";
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/quote", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(currentLanguage === "es" ? uiText.es.error : result.message || uiText.en.error);
    }

    quoteForm.reset();
    setActiveService("ftl");
    if (fileNameNode) {
      fileNameNode.textContent = uiText[currentLanguage].noFile;
    }
    statusNode.textContent =
      currentLanguage === "es"
        ? response.status === 202
          ? uiText.es.preview
          : uiText.es.success
        : result.message;
    statusNode.dataset.state = "success";
  } catch (error) {
    statusNode.textContent = error.message || uiText[currentLanguage].error;
    statusNode.dataset.state = "error";
  } finally {
    submitButton.disabled = false;
  }
});

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
setActiveService(serviceFieldMap[initialServiceFromQuery] ? initialServiceFromQuery : "ftl");
