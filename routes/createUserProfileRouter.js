import express from "express";
import { registerValidationChain } from "../validators/createUserProfileValidators.js";
import { createUserProfile } from "../controller/createUserProfileController.js";

const createUserProfileRouter = express.Router();

createUserProfileRouter.post("/", registerValidationChain, createUserProfile);
export { createUserProfileRouter };
