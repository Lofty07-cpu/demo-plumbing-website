const configuredNumber = document.documentElement.getAttribute("data-whatsapp-number") || "";
const normalizedNumber = configuredNumber.replace(/\D/g, "");
const isValidNumber = /^\d{8,15}$/.test(normalizedNumber) && !normalizedNumber.startsWith("0");
const defaultMessage = "Hi, I'd like to enquire about a plumbing service. My area is: ";

const formatMoney = (value) => new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 0 }).format(value);

const buildWhatsAppUrl = (text) => {
  const encodedMessage = encodeURIComponent(text);
  return isValidNumber
    ? `https://wa.me/${normalizedNumber}?text=${encodedMessage}`
    : `https://api.whatsapp.com/send?text=${encodedMessage}`;
};

const pricingConfig = {
  services: {
    "Leak Repair": {
      base: 850,
      urgency: { Routine: 0, "Same Day": 220, Emergency: 430 },
      complexity: { Minor: 0, Moderate: 240, "Major / Not Sure": 470 },
      location: { Kitchen: 60, Bathroom: 80, Outside: 100, Geyser: 150, Other: 110 },
    },
    "Blocked Drain": {
      base: 950,
      urgency: { Routine: 0, "Same Day": 260, Emergency: 500 },
      complexity: { Minor: 0, Moderate: 230, "Major / Not Sure": 460 },
      location: { Kitchen: 80, Bathroom: 90, Outside: 110, Geyser: 130, Other: 120 },
    },
    "Toilet Repair": {
      base: 980,
      urgency: { Routine: 0, "Same Day": 280, Emergency: 520 },
      complexity: { Minor: 0, Moderate: 260, "Major / Not Sure": 520 },
      location: { Kitchen: 70, Bathroom: 95, Outside: 120, Geyser: 140, Other: 110 },
    },
    "Geyser Repair": {
      base: 1200,
      urgency: { Routine: 0, "Same Day": 300, Emergency: 560 },
      complexity: { Minor: 0, Moderate: 280, "Major / Not Sure": 540 },
      location: { Kitchen: 60, Bathroom: 75, Outside: 120, Geyser: 180, Other: 150 },
    },
    "Tap/Fitting Replacement": {
      base: 700,
      urgency: { Routine: 0, "Same Day": 180, Emergency: 350 },
      complexity: { Minor: 0, Moderate: 180, "Major / Not Sure": 340 },
      location: { Kitchen: 55, Bathroom: 70, Outside: 100, Geyser: 120, Other: 90 },
    },
    "Pipe Repair": {
      base: 1100,
      urgency: { Routine: 0, "Same Day": 260, Emergency: 520 },
      complexity: { Minor: 0, Moderate: 290, "Major / Not Sure": 560 },
      location: { Kitchen: 90, Bathroom: 120, Outside: 140, Geyser: 160, Other: 130 },
    },
    "General Plumbing": {
      base: 900,
      urgency: { Routine: 0, "Same Day": 200, Emergency: 420 },
      complexity: { Minor: 0, Moderate: 220, "Major / Not Sure": 420 },
      location: { Kitchen: 70, Bathroom: 80, Outside: 110, Geyser: 140, Other: 100 },
    },
  },
};

const serviceAliases = {
  "Leaks & dripping taps": "Tap/Fitting Replacement",
  "Drains & blockages": "Blocked Drain",
  "Toilets & plumbing fixtures": "Toilet Repair",
  "Geysers & hot water": "Geyser Repair",
  "Bathroom upgrades": "Pipe Repair",
  "General Plumbing Maintenance": "General Plumbing",
};

const estimateState = {
  service: "Leak Repair",
  urgency: "Routine",
  location: "Kitchen",
  complexity: "Minor",
  problem: "",
};

const setWhatsAppLinks = () => {
  document.querySelectorAll(".whatsapp-cta").forEach((link) => {
    const message = link.dataset.message || defaultMessage;
    link.href = buildWhatsAppUrl(message);
    link.target = "_blank";
    link.rel = "noreferrer";
  });
};

const setupNotice = document.querySelector("#whatsapp-setup");

if (setupNotice && configuredNumber && !isValidNumber) {
  setupNotice.textContent =
    "The configured WhatsApp number is not a valid international number. Use 8 to 15 digits including the country code, without a leading plus sign.";
} else if (setupNotice && isValidNumber) {
  setupNotice.textContent =
    "WhatsApp messages will open directly to the configured business number.";
}

setWhatsAppLinks();

const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 540) {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });
}

const navLinks = document.querySelectorAll(".main-nav a[href^='#']");
const sections = document.querySelectorAll("main section[id]");

if (navLinks.length && sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", isActive);
        });
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((section) => observer.observe(section));
}

const estimateTriggerLinks = document.querySelectorAll(".estimate-trigger");
const estimateSection = document.querySelector("#estimate");

const openEstimateCalculator = (serviceName) => {
  if (!estimateSection) return;
  const selectedService = serviceAliases[serviceName] || serviceName;
  estimateState.service = selectedService;

  const serviceButton = document.querySelector(`.option-button[data-group="service"][data-value="${selectedService}"]`);
  if (serviceButton) {
    document.querySelectorAll(".option-button[data-group='service']").forEach((button) => {
      button.classList.toggle("is-selected", button === serviceButton);
    });
  }

  const stepButtons = document.querySelectorAll(".calc-step-indicator");
  stepButtons.forEach((button, index) => {
    button.classList.toggle("is-active", index === 0);
  });

  setActiveStep(0);
  document.querySelector("#estimate-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

if (estimateTriggerLinks.length) {
  estimateTriggerLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openEstimateCalculator(link.dataset.service || "Leak Repair");
      const target = document.querySelector("#estimate");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

const optionButtons = Array.from(document.querySelectorAll(".option-button"));
const calcSummary = document.querySelector("#calc-summary");
const calcError = document.querySelector("#calc-error");
const estimateRange = document.querySelector("#estimate-range");
const estimateDetails = document.querySelector("#estimate-details");
const calcBackButton = document.querySelector("#calc-back");
const calcNextButton = document.querySelector("#calc-next");
const calcResetButton = document.querySelector("#calc-reset");
const calcDiscussButton = document.querySelector("#calc-discuss");
const estimateSteps = Array.from(document.querySelectorAll(".calc-step"));
const stepIndicators = Array.from(document.querySelectorAll(".calc-step-indicator"));

let activeStep = 0;

const setActiveStep = (stepIndex) => {
  activeStep = Math.min(Math.max(stepIndex, 0), 2);

  estimateSteps.forEach((step, index) => {
    step.classList.toggle("is-active", index === activeStep);
  });

  stepIndicators.forEach((indicator, index) => {
    indicator.classList.toggle("is-active", index === activeStep);
    indicator.setAttribute("aria-current", index === activeStep ? "step" : "false");
  });

  if (calcBackButton) {
    calcBackButton.hidden = activeStep === 0;
  }

  if (calcNextButton) {
    calcNextButton.hidden = activeStep !== 0 && activeStep !== 1;
    calcNextButton.textContent = activeStep === 0 ? "Next" : "Calculate estimate";
  }

  if (calcResetButton) {
    calcResetButton.hidden = activeStep === 2;
  }

  calcSummary?.classList.toggle("is-visible", activeStep === 2);
};

const getSelectedValue = (group) => {
  const selected = document.querySelector(`.option-button[data-group="${group}"].is-selected`);
  return selected ? selected.dataset.value : null;
};

const clearMessages = () => {
  if (calcError) {
    calcError.textContent = "";
    calcError.hidden = true;
  }
};

const calculateEstimate = () => {
  const serviceKey = estimateState.service || "Leak Repair";
  const serviceRules = pricingConfig.services[serviceKey];

  if (!serviceRules) return null;

  const urgencyValue = serviceRules.urgency[estimateState.urgency] ?? 0;
  const complexityValue = serviceRules.complexity[estimateState.complexity] ?? 0;
  const locationValue = serviceRules.location[estimateState.location] ?? 0;

  const minimum = serviceRules.base + urgencyValue + complexityValue + locationValue;
  const maximum = Math.round(minimum * 1.55);

  return { minimum, maximum, serviceKey };
};

const updateSummaryText = () => {
  const serviceSummary = document.querySelector("#service-summary");
  if (serviceSummary) serviceSummary.textContent = estimateState.service;

  const summaryService = document.querySelector("#summary-service");
  if (summaryService) summaryService.textContent = estimateState.service;
  const summaryUrgency = document.querySelector("#summary-urgency");
  if (summaryUrgency) summaryUrgency.textContent = estimateState.urgency;
  const summaryLocation = document.querySelector("#summary-location");
  if (summaryLocation) summaryLocation.textContent = estimateState.location;
  const summaryComplexity = document.querySelector("#summary-complexity");
  if (summaryComplexity) summaryComplexity.textContent = estimateState.complexity;
};

const updateEstimateDisplay = () => {
  const estimate = calculateEstimate();

  if (!estimate) {
    if (estimateRange) estimateRange.textContent = "Choose a service";
    return;
  }

  const rangeText = `R${formatMoney(estimate.minimum)} – R${formatMoney(estimate.maximum)}`;
  if (estimateRange) estimateRange.textContent = rangeText;
  updateSummaryText();
  if (estimateDetails) {
    const description = estimateState.problem.trim() || "No description provided yet.";
    estimateDetails.innerHTML = `<strong>${estimate.serviceKey}</strong><span>${estimateState.urgency}</span><span>${estimateState.location}</span><span>${estimateState.complexity}</span><span>${description}</span>`;
  }
};

const validateStep = () => {
  clearMessages();

  if (activeStep === 0 && !estimateState.service) {
    if (calcError) {
      calcError.textContent = "Please choose a service before continuing.";
      calcError.hidden = false;
    }
    return false;
  }

  if (activeStep === 1) {
    if (!estimateState.urgency || !estimateState.location || !estimateState.complexity) {
      if (calcError) {
        calcError.textContent = "Please complete the urgency, location and complexity details.";
        calcError.hidden = false;
      }
      return false;
    }
  }

  return true;
};

const setSelectedOption = (group, value) => {
  const items = document.querySelectorAll(`.option-button[data-group="${group}"]`);
  items.forEach((item) => {
    item.classList.toggle("is-selected", item.dataset.value === value);
  });

  if (group === "service") estimateState.service = value;
  if (group === "urgency") estimateState.urgency = value;
  if (group === "location") estimateState.location = value;
  if (group === "complexity") estimateState.complexity = value;
};

optionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const { group, value } = button.dataset;
    setSelectedOption(group, value);
      if (group === "service") {
      const summaryText = document.querySelector("#service-summary");
      if (summaryText) summaryText.textContent = value;
    }
      if (group !== "service") {
        updateSummaryText();
      }
      clearMessages();
    });
});

const problemInput = document.querySelector("#problem-description");
if (problemInput) {
  problemInput.addEventListener("input", (event) => {
    estimateState.problem = event.target.value;
  });
}

if (calcBackButton) {
  calcBackButton.addEventListener("click", () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  });
}

if (calcNextButton) {
  calcNextButton.addEventListener("click", () => {
    if (!validateStep()) return;

    if (activeStep === 0) {
      setActiveStep(1);
      return;
    }

    if (activeStep === 1) {
      updateEstimateDisplay();
      setActiveStep(2);
    }
  });
}

if (calcResetButton) {
  calcResetButton.addEventListener("click", () => {
    estimateState.service = "Leak Repair";
    estimateState.urgency = "Routine";
    estimateState.location = "Kitchen";
    estimateState.complexity = "Minor";
    estimateState.problem = "";

    if (problemInput) {
      problemInput.value = "";
    }

    optionButtons.forEach((button) => {
      const { group, value } = button.dataset;
      const selected = group === "service" ? value === "Leak Repair" : group === "urgency" ? value === "Routine" : group === "location" ? value === "Kitchen" : value === "Minor";
      button.classList.toggle("is-selected", selected);
    });

    clearMessages();
    setActiveStep(0);
    if (estimateRange) estimateRange.textContent = "R0 – R0";
  });
}

if (calcDiscussButton) {
  calcDiscussButton.addEventListener("click", () => {
    const estimate = calculateEstimate();
    const totalRange = estimate ? `R${formatMoney(estimate.minimum)}–R${formatMoney(estimate.maximum)}` : "R0–R0";
    const message = [
      "Hi Flow Plumbing Co., I'd like to enquire about a plumbing job.",
      "",
      `Service: ${estimateState.service}`,
      `Location: ${estimateState.location}`,
      `Urgency: ${estimateState.urgency}`,
      `Complexity: ${estimateState.complexity}`,
      `Problem: ${estimateState.problem.trim() || "No details provided yet"}`,
      `Website estimate: ${totalRange}`,
      "",
      "Could you please confirm pricing and availability?",
    ].join("\n");

    calcDiscussButton.href = buildWhatsAppUrl(message);
  });
}

setActiveStep(0);

const projectFilterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");
const lightbox = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxText = document.querySelector("#lightbox-text");
const lightboxCloseButton = document.querySelector("#lightbox-close");
let lightboxTrigger = null;

const applyProjectFilter = (filter) => {
  projectFilterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  projectCards.forEach((card) => {
    const matches = filter === "all" || card.dataset.category === filter;
    card.hidden = !matches;
  });
};

if (projectFilterButtons.length) {
  projectFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyProjectFilter(button.dataset.filter);
    });
  });
}

const openLightbox = (imageSrc, title, summary) => {
  if (!lightbox || !lightboxImg) return;
  lightboxTrigger = document.activeElement;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightboxImg.src = imageSrc;
  lightboxImg.alt = title;
  if (lightboxTitle) lightboxTitle.textContent = title;
  if (lightboxText) lightboxText.textContent = summary;
  lightboxCloseButton?.focus();
};

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  if (lightboxTrigger instanceof HTMLElement) lightboxTrigger.focus();
  lightboxTrigger = null;
};

const galleryImages = document.querySelectorAll(".project-visual button");
if (galleryImages.length) {
  galleryImages.forEach((button) => {
    button.addEventListener("click", () => {
      openLightbox(button.dataset.image, button.dataset.title, button.dataset.summary);
    });
  });
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  if (lightboxCloseButton) lightboxCloseButton.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeLightbox();
    } else if (event.key === "Tab") {
      event.preventDefault();
      lightboxCloseButton?.focus();
    }
  });
}

applyProjectFilter("all");

if (estimateRange) estimateRange.textContent = "R850 – R1,400";

const serviceSummary = document.querySelector("#service-summary");
if (serviceSummary) serviceSummary.textContent = estimateState.service;

updateSummaryText();

setWhatsAppLinks();
