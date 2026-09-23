// Central business details. Update here and the whole site follows.
export const site = {
  name: "Natural Health Retreat",
  legalName: "Natural Health Retreat Reform Center",
  tagline: "Choose Health, Choose Life",
  domain: "choosehealth.com.gh",
  description:
    "100% natural health products, herbal remedies and naturopathic care in Awoshie, Accra. Shop spices, detox powders, nuts & seeds — pickup or delivery.",
  doctor: {
    name: "ND William Owusu",
    title: "Lead Naturopathic Physician",
    photo: "/images/nd-william-owusu.jpg",
  },
  phones: [
    { label: "Call", display: "026 270 8245", tel: "+233262708245" },
    { label: "WhatsApp", display: "024 370 8245", tel: "+233243708245" },
  ],
  whatsapp: {
    number: "233243708245",
    catalog: "https://wa.me/c/233243708245",
  },
  address: {
    line1: "Awoshie Lane 14",
    line2: "Near Vision School",
    city: "Awoshie, Accra",
    mapQuery: "Vision School, Awoshie, Accra, Ghana",
  },
  hours: [
    { days: "Monday – Thursday", time: "9:00am – 5:00pm" },
    { days: "Friday – Sunday", time: "Closed (WhatsApp orders welcome)" },
  ],
  // TODO(owner): confirm the account name exactly as it appears on the MTN MoMo prompt.
  momo: {
    network: "MTN Mobile Money",
    number: "024 370 8245",
    accountName: "Natural Health Retreat",
  },
} as const;

export function whatsappLink(message?: string, number: string = site.whatsapp.number) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Converts a local Ghanaian number (024…) or +233… to the digits-only form wa.me expects. */
export function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `233${digits.slice(1)}` : digits;
}
