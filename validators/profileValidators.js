import {
  sanitizeEmail,
  sanitizeName,
  sanitizeZipCode,
  sanitizePhoneNumber,
} from "./userSanitizers.js";
import {
  validateEmail,
  validateName,
  validateZipCode,
  validatePhoneNumber,
} from "./userValidators.js";
import { dataValidation } from "../middleware/validationMiddleware.js";

const updatePersonalDetailsValidationChain = [
  validateName("name", "Name"),
  validateName("surname", "Surname"),
  validateEmail(),
  validateZipCode(),
  validatePhoneNumber(),
  sanitizeName("name"),
  sanitizeName("surname"),
  sanitizeEmail(),
  sanitizeZipCode(),
  sanitizePhoneNumber(),
  dataValidation(
    "Personal details change failed",
    "Personal details changed successfully",
  ),
];

export { updatePersonalDetailsValidationChain };
