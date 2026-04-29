import { validationResult, matchedData } from "express-validator";
import logger from "../utils/logger.js";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateToken,
} from "./userValidators.js";
import {
  sanitizePassword,
  sanitizeEmail,
  sanitizeToken,
} from "./userSanitizers.js";
import { dataValidation } from "../middleware/validationMiddleware.js";

const loginValidationChain = [
  validateEmail(),
  validatePassword(),
  sanitizeEmail(),
  sanitizePassword("password"),
  dataValidation("Validation failed for signup", "Log in validation passed"),
];
const passwordValidationChain = [
  validateToken(),
  validateEmail(),
  validatePassword(),
  validateConfirmPassword(),
  sanitizeToken(),
  sanitizeEmail(),
  sanitizePassword("password"),
  sanitizePassword("confirmPassword"),
  dataValidation("Password creation failed", "Password set successfully"),
];

const resetPasswordRequestValidationChain = [
  validateEmail(),
  sanitizeEmail(),
  dataValidation("Password reset failed", "Password set successfully"),
];
const resetPasswordValidationChain = [
  validateToken(),
  validatePassword(),
  validateConfirmPassword(),
  sanitizeToken(),
  sanitizePassword("password"),
  sanitizePassword("confirmPassword"),

  dataValidation("Password creation failed", "Password set successfully"),
];
const newAcessTokenValidationChain = [
  validateEmail(),
  sanitizeEmail(),
  dataValidation(
    "Failed to generate new access token",
    "Access token generated successfully",
  ),
];

export {
  loginValidationChain,
  passwordValidationChain,
  resetPasswordRequestValidationChain,
  resetPasswordValidationChain,
  newAcessTokenValidationChain,
};
