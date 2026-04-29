import express from "express";
import { registerValidationChain } from "../validators/checkoutValidators.js";
import { checkout } from "../controller/checkoutController.js";

const checkoutRouter = express.Router();
checkoutRouter.post("/", registerValidationChain, checkout);

export { checkoutRouter };
