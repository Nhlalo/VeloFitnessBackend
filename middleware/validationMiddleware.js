import { validationResult, matchedData } from "express-validator";
import logger from "../utils/logger.js";

const dataValidation = (loggerErrorMessage, loggerSuccessMessage) => {
  return function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error({ errors: errors.array() }, loggerErrorMessage);
      return res.status(400).json({
        success: false,
        errors: errors.array({ onlyFirstError: true }),
      });
    }

    const validatedData = matchedData(req);

    logger.info({ email: validatedData.email }, loggerSuccessMessage);
    req.validatedData = validatedData;
    next();
  };
};
export { dataValidation };
