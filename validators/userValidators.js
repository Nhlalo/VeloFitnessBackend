import { body } from "express-validator";

// Name validation (reusable for name & surname)
const validateName = (fieldName, displayName) => {
  return body(fieldName)
    .notEmpty()
    .withMessage(`${displayName} is required`)
    .isString()
    .withMessage(`${displayName} must be a string`)
    .isLength({ min: 2, max: 50 })
    .withMessage(`${displayName} must be between 2 and 50 characters`)
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage(
      `${displayName} can only contain letters, spaces, apostrophes, and hyphens`,
    )
    .escape();
};

const validateEmail = () => {
  return body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email address is required")
    .normalizeEmail() // Removes dots from Gmail addresses, normalizes case, etc.
    .isLength({ max: 100 })
    .withMessage("Email cannot exceed 100 characters");
};

const validateZipCode = () => {
  return body("zipCode")
    .notEmpty()
    .withMessage("ZIP code is required")
    .isString()
    .withMessage("ZIP code must be a string")
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage("Valid ZIP code required (e.g., 12345 or 12345-6789)");
};

const validatePhoneNumber = () => {
  return body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("any")
    .withMessage("Valid phone number required")
    .custom((value) => {
      // Remove non-digit characters for validation
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        throw new Error("Phone number must have 10-15 digits");
      }
      return true;
    });
};

const validateUserClub = () => {
  return body("userClub")
    .notEmpty()
    .withMessage("Please select a club")
    .isString()
    .withMessage("Club must be a string")
    .isLength({ min: 1, max: 100 })
    .withMessage("Club name is too long")
    .isIn(["l'ordre des champions", "la société privée", "le cercle d'or"])
    .withMessage("Invalid membership type");
};

const validatePassword = () => {
  return body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isLength({ max: 100 })
    .withMessage("Password must not exceed 100 characters");
};
const validateConfirmPassword = () => {
  return body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isLength({ max: 100 })
    .withMessage("Password must not exceed 100 characters")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    });
};

const validatePaymentIntentId = () => {
  return body("paymentIntentId")
    .notEmpty()
    .withMessage("Payment intent ID is required")
    .isString()
    .withMessage("Payment intent ID must be a string")
    .matches(/^pi_[A-Za-z0-9_]+$/)
    .withMessage("Invalid payment intent ID format")
    .isLength({ min: 14, max: 100 })
    .withMessage("Payment intent ID has invalid length");
};

const registerValidators = [
  validateName("name", "Name"),
  validateName("surname", "Surname"),
  validateEmail(),
  validateZipCode(),
  validatePhoneNumber(),
  validateUserClub(),
];

export {
  registerValidators,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePaymentIntentId,
};
