import express from "express";
import { registerValidationChain } from "../validators/createUserProfileValidators.js";
import { updatePersonalDetailsValidationChain } from "../validators/profileValidators.js";
import {
  createUserProfile,
  updatePersonalDetails,
} from "../controller/profileController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const profileRouter = express.Router();

profileRouter.post("/create", registerValidationChain, createUserProfile);
profileRouter.post(
  "/update",
  updatePersonalDetailsValidationChain,
  updatePersonalDetails,
);
export { profileRouter };
