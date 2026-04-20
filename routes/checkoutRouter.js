import express from "express";
import { registerValidationChain } from "../model/checkoutModel.js";
import { checkout } from "../controller/checkoutController.js";
import { createUserProfile } from "../controller/createUserProfileController.js";

const checkoutRouter = express.Router();
checkoutRouter.post("/", registerValidationChain, checkout, createUserProfile);

export { checkoutRouter };
