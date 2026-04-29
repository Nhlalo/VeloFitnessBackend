import { body } from "express-validator";

const sanitizeName = (fieldName) => {
  return body(fieldName).trim().stripLow(); // Remove control characters
};

const sanitizeClubName = (fieldName) => {
  return body("club name").trim();
};

const sanitizeEmail = () => {
  return body("email")
    .trim()
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: true,
      outlook_remove_subaddress: true,
      yahoo_remove_subaddress: true,
    })
    .toLowerCase();
};

const sanitizePhoneNumber = () => {
  return body("phoneNumber").trim().blacklist(" -()[]+"); // Remove common separators
};

const sanitizeZipCode = () => {
  return body("zipCode").trim().whitelist("0123456789-"); // Keep only digits and hyphen
};

const sanitizeMembershipTitle = () => {
  return body("membershipTitle")
    .trim()
    .customSanitizer((value) => {
      const validClubs = [
        "l'ordre des champions",
        "la société privée",
        "le cercle d'or",
      ];
      const match = validClubs.find(
        (club) => club.toLowerCase() === value.toLowerCase(),
      );
      return match || null;
    });
};
const sanitizePassword = (password) => {
  return body(password).trim();
};

const sanitizeToken = () => {
  return body("token").trim();
};

const sanitizePaymentIntentId = () => {
  return body("paymentIntentId")
    .trim() // Remove whitespace from beginning and end
    .stripLow() // Remove control characters (non-printable)
    .blacklist("^a-zA-Z0-9_"); // Remove any characters NOT allowed (inverse logic)
};

const registerSanitizers = [
  sanitizeName("name"),
  sanitizeName("surname"),
  sanitizeEmail(),
  sanitizeZipCode(),
  sanitizePhoneNumber(),
  sanitizeClubName(),
  sanitizeMembershipTitle(),
];

export {
  registerSanitizers,
  sanitizeEmail,
  sanitizeClubName,
  sanitizePassword,
  sanitizePaymentIntentId,
  sanitizeMembershipTitle,
  sanitizeToken,
};
