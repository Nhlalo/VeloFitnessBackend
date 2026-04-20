import { validationResult, matchedData } from "express-validator";
import logger from "../utils/logger.js";
import {
  registerValidators,
  validatePaymentIntentId,
} from "./userValidators.js";
import {
  registerSanitizers,
  sanitizePaymentIntentId,
} from "./userSanitizers.js";
import { dataValidation } from "../middleware/validationMiddleware.js";

const registerValidationChain = [
  ...registerValidators,
  validatePaymentIntentId(),
  ...registerSanitizers,
  sanitizePaymentIntentId(),
  dataValidation(
    "Validation failed for user creation",
    "User creation validation passed",
  ),
];

export { registerValidationChain };
