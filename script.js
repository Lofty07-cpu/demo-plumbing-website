const configuredNumber = document.documentElement.getAttribute("data-whatsapp-number") || "";
const normalizedNumber = configuredNumber.replace(/\D/g, "");
const isValidNumber = /^\d{8,15}$/.test(normalizedNumber) && !normalizedNumber.startsWith("0");
const defaultMessage = "Hi, I'd like to enquire about a plumbing service. My area is: ";

const formatMoney = (value) => new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 0 }).format(value);

const buildWhatsAppUrl = (text, phoneNumber = normalizedNumber) => {
  const encodedMessage = encodeURIComponent(text);
  return isValidNumber && phoneNumber
    ? `https://wa.me/${phoneNumber}?text=${encodedMessage}`
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

const getElement = (selector, root = document) => root.querySelector(selector);
const getAllElements = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const setWhatsAppLinks = () => {
  getAllElements(".whatsapp-cta").forEach((link) => {
    const message = link.dataset.message || defaultMessage;
    link.href = buildWhatsAppUrl(message);
    link.target = "_blank";
    link.rel = "noreferrer";
  });
};

const initializeWhatsAppNotice = () => {
  const setupNotice = getElement("#whatsapp-setup");

  if (setupNotice && configuredNumber && !isValidNumber) {
    setupNotice.textContent =
      "The configured WhatsApp number is not a valid international number. Use 8 to 15 digits including the country code, without a leading plus sign.";
    return;
  }

  if (setupNotice && isValidNumber) {
    setupNotice.textContent = "WhatsApp messages will open directly to the configured business number.";
  }
};

const initializeNavigation = () => {
  const navToggle = getElement(".nav-toggle");
  const mainNav = getElement(".main-nav");

  if (!navToggle || !mainNav) return;

  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 760) {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation menu");
      }
    });
  });
};

const initializeStickyNav = () => {
  const navLinks = getAllElements(".main-nav a[href^='#']");
  const sections = getAllElements("main section[id]");

  if (!navLinks.length || !sections.length) return;

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
};

const initializeEstimateCalculator = () => {
  const estimateTriggerLinks = getAllElements(".estimate-trigger");
  const estimateSection = getElement("#estimate");
  const optionButtons = getAllElements(".option-button");
  const calcSummary = getElement("#calc-summary");
  const calcError = getElement("#calc-error");
  const estimateRange = getElement("#estimate-range");
  const estimateDetails = getElement("#estimate-details");
  const calcBackButton = getElement("#calc-back");
  const calcNextButton = getElement("#calc-next");
  const calcResetButton = getElement("#calc-reset");
  const calcDiscussButton = getElement("#calc-discuss");
  const estimateSteps = getAllElements(".calc-step");
  const stepIndicators = getAllElements(".calc-step-indicator");
  const problemInput = getElement("#problem-description");

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

  const clearMessages = () => {
    if (!calcError) return;
    calcError.textContent = "";
    calcError.hidden = true;
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
    const serviceSummary = getElement("#service-summary");
    if (serviceSummary) serviceSummary.textContent = estimateState.service;

    const summaryService = getElement("#summary-service");
    if (summaryService) summaryService.textContent = estimateState.service;
    const summaryUrgency = getElement("#summary-urgency");
    if (summaryUrgency) summaryUrgency.textContent = estimateState.urgency;
    const summaryLocation = getElement("#summary-location");
    if (summaryLocation) summaryLocation.textContent = estimateState.location;
    const summaryComplexity = getElement("#summary-complexity");
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

    const stepButtons = getAllElements(".calc-step-indicator");
    stepButtons.forEach((button, index) => {
      button.classList.toggle("is-active", index === 0);
    });

    setActiveStep(0);
    getElement("#estimate-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  optionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const { group, value } = button.dataset;
      setSelectedOption(group, value);

      if (group === "service") {
        const summaryText = getElement("#service-summary");
        if (summaryText) summaryText.textContent = value;
      }

      if (group !== "service") {
        updateSummaryText();
      }

      clearMessages();
    });
  });

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
        const selected =
          group === "service"
            ? value === "Leak Repair"
            : group === "urgency"
              ? value === "Routine"
              : group === "location"
                ? value === "Kitchen"
                : value === "Minor";

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

  estimateTriggerLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openEstimateCalculator(link.dataset.service || "Leak Repair");
      const target = getElement("#estimate");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  setActiveStep(0);

  if (estimateRange) estimateRange.textContent = "R850 – R1,400";

  const serviceSummary = getElement("#service-summary");
  if (serviceSummary) serviceSummary.textContent = estimateState.service;

  updateSummaryText();
};

const initializeProjectGallery = () => {
  const projectFilterButtons = getAllElements(".filter-button");
  const projectCards = getAllElements(".project-card");
  const lightbox = getElement("#lightbox");
  const lightboxImg = getElement("#lightbox-image");
  const lightboxTitle = getElement("#lightbox-title");
  const lightboxText = getElement("#lightbox-text");
  const lightboxCloseButton = getElement("#lightbox-close");

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

  const galleryImages = getAllElements(".project-visual button");
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

    if (lightboxCloseButton) {
      lightboxCloseButton.addEventListener("click", closeLightbox);
    }

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
};

const initializeApp = () => {
  initializeWhatsAppNotice();
  setWhatsAppLinks();
  initializeNavigation();
  initializeStickyNav();
  initializeEstimateCalculator();
  initializeProjectGallery();
};

initializeApp();
