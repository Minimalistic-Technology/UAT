// Central place for site-wide / brand details (name, contact info, social links, etc).
// Update values here instead of hardcoding them across components.

export const SITE_CONFIG = {
  name: "DDTEC",
  logoLetter: "D",
  tagline:
    "Precision-crafted power tools for professionals who demand excellence. Built to last, engineered to perform.",
};

export const CONTACT_INFO = {
  email: "parth.ddtec@gmail.com",
  supportEmail: "support@ddtec.com",
  // Digits only, with country code — used for tel:/wa.me links.
  phone: "917777099930",
  phoneDisplay: "+91 77770 99930",
  whatsapp: "917777099930",
  address: {
    line1: "G-77 Sai Dham Shopping Center,",
    line2: "PK Road, Mulund(W) - 400080",
  },
  hours: "Mon - Fri: 9:00 AM - 6:00 PM",
};

// TODO: replace with the real profile URLs. These are placeholders so the
// footer has something to link to for now — swap them before launch.
export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/ddtec",
  twitter: "https://twitter.com/ddtec",
  instagram: "https://instagram.com/ddtec",
  linkedin: "https://linkedin.com/company/ddtec",
  youtube: "",
};

export function buildWhatsAppLink(message: string, phone: string = CONTACT_INFO.whatsapp) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppShareLink(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
