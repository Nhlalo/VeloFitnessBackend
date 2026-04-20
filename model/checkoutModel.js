import { validationResult, matchedData } from "express-validator";
import logger from "../utils/logger.js";
import { registerValidators } from "../validators/userValidators.js";
import { registerSanitizers } from "../validators/userSanitizers.js";
import { dataValidation } from "../middleware/validationMiddleware.js";

const registerValidationChain = [
  ...registerValidators,
  ...registerSanitizers,
  dataValidation("Validation failed for signup", "Signup validation passed"),
];

export { registerValidationChain };
