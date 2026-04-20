import { validationResult, matchedData } from "express-validator";
import logger from "../utils/logger.js";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "./userValidators.js";
import { sanitizePassword } from "./userSanitizers.js";
import { dataValidation } from "../middleware/validationMiddleware.js";

const loginValidationChain = [
  validateEmail(),
  validatePassword(),
  sanitizePassword("password"),
  dataValidation("Validation failed for signup", "Log in validation passed"),
];
const passwordValidationChain = [
  validateEmail(),
  validatePassword(),
  validateConfirmPassword(),
  sanitizePassword("password"),
  sanitizePassword("confirmPassword"),
  dataValidation("Password creation failed", "Password set successfully"),
];

export { loginValidationChain, passwordValidationChain };
