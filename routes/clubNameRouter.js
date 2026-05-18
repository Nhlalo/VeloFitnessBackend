import express from "express";
import { validateClubName } from "../validators/userValidators.js";
import { sanitizeClubName } from "../validators/userSanitizers.js";
import { changeClubName } from "../controller/clubNameController.js";
import { dataValidation } from "../middleware/validationMiddleware.js";
import authenticateToken from "../middleware/authMiddleware.js";

const clubNameRouter = express.Router();

//For club name change
clubNameRouter.patch(
  "/",
  authenticateToken,
  validateClubName(),
  sanitizeClubName(),
  dataValidation("Club name change failed", "Club name change successful"),
  changeClubName,
);

export { clubNameRouter };
