import { validationResult, matchedData } from "express-validator";
import logger from "../utils/logger.js";
import { dataValidation } from "../middleware/validationMiddleware.js";
import { validateEmail, validateMembershipTitle } from "./userValidators.js";
import { sanitizeEmail, sanitizeMembershipTitle } from "./userSanitizers.js";

const registerValidationChain = [
  validateEmail(),
  validateMembershipTitle(),
  sanitizeEmail(),
  sanitizeMembershipTitle(),
  dataValidation("Validation failed for signup", "Signup validation passed"),
];

export { registerValidationChain };
