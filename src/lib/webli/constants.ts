export const WHATSAPP_NUMBER = "+919609022523";
export const WHATSAPP_DIGITS = "919609022523";
export const CONTACT_EMAIL = "hello@webli.agency";
export const BRAND = {
  name: "Webli",
  tagline: "Websites that convert. Crafted, not templated.",
};

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(message)}`;
}
