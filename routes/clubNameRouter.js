import express from "express";
import { validateClubName } from "../validators/userValidators.js";
import { sanitizeClubName } from "../validators/userSanitizers.js";
import { changeClubName } from "../controller/clubNameController.js";

const clubNameRouter = express.Router();

//For club name change
clubNameRouter.patch(
  "/",
  validateClubName(),
  sanitizeClubName(),
  changeClubName,
);

export { clubNameRouter };
