import express from "express";
import { registerValidationChain } from "../validators/createUserProfileValidators.js";
import { createUserProfile } from "../controller/profileController.js";

const profileRouter = express.Router();

profileRouter.post("/create", registerValidationChain, createUserProfile);
export { profileRouter };
