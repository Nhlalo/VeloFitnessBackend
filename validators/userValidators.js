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
    );
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
    .matches(/^\d{4,}(?:-\d{1,})?$/)
    .withMessage(
      "Valid postal code required (minimum 4 digits, e.g., 1234, 12345, 12345-6789)",
    );
};

const validatePhoneNumber = () => {
  return body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .custom((value) => {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        throw new Error("Phone number must have 7-15 digits");
      }
      return true;
    });
};

const validateClubName = () => {
  return body("clubName")
    .notEmpty()
    .withMessage("Club name is required")
    .isString()
    .withMessage("Club name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("club name must be between 2 and 50 characters");
};

const validateMembershipTitle = () => {
  return body("membershipTitle")
    .notEmpty()
    .withMessage("Please select a club")
    .isString()
    .withMessage("Club must be a string")
    .isLength({ min: 1, max: 100 })
    .withMessage("Club name is too long")
    .custom((value) => {
      const validMembershipTitle = [
        "l'ordre des champions",
        "la société privée",
        "le cercle d'or",
      ];
      const isValid = validMembershipTitle.some(
        (club) => club.toLowerCase() === value.toLowerCase(),
      );
      if (!isValid) {
        throw new Error(
          "Invalid membership title. Must be one of the membership titles.",
        );
      }
      return true;
    });
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
  return body("confirmPassword")
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

const validateToken = () => {
  return body("token")
    .notEmpty()
    .withMessage("Token is required")
    .isString()
    .withMessage("Token must be a string")
    .isLength({ min: 32, max: 64 })
    .withMessage("Invalid token format");
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
  validateClubName(),
  validateMembershipTitle(),
];

export {
  registerValidators,
  validateEmail,
  validateName,
  validatePhoneNumber,
  validateZipCode,
  validateClubName,
  validatePassword,
  validateConfirmPassword,
  validatePaymentIntentId,
  validateMembershipTitle,
  validateToken,
};
