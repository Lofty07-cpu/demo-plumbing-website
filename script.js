const configuredNumber = document.documentElement.getAttribute("data-whatsapp-number") || "";
const normalizedNumber = configuredNumber.replace(/\D/g, "");
const isValidNumber = /^\d{8,15}$/.test(normalizedNumber) && !normalizedNumber.startsWith("0");
const defaultMessage =
  "Hi, I'd like to enquire about a plumbing service. My area is: ";

document.querySelectorAll(".whatsapp-cta").forEach((link) => {
  const message = link.dataset.message || defaultMessage;
  const encodedMessage = encodeURIComponent(message);
  link.href = isValidNumber
    ? `https://wa.me/${normalizedNumber}?text=${encodedMessage}`
    : `https://api.whatsapp.com/send?text=${encodedMessage}`;
  link.target = "_blank";
  link.rel = "noreferrer";
});

const setupNotice = document.querySelector("#whatsapp-setup");

if (setupNotice && configuredNumber && !isValidNumber) {
  setupNotice.textContent =
    "The configured WhatsApp number is not a valid international number. Use 8 to 15 digits including the country code, without a leading plus sign.";
} else if (setupNotice && isValidNumber) {
  setupNotice.textContent =
    "WhatsApp messages will open directly to the configured business number.";
}
