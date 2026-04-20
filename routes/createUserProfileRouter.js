import express from "express";
import { registerValidationChain } from "../model/createUserProfileModel.js";
import { createUserProfile } from "../controller/createUserProfileController.js";

const createUserProfileRouter = express.Router();

createUserProfileRouter.post("/", registerValidationChain, createUserProfile);
export { createUserProfileRouter };
