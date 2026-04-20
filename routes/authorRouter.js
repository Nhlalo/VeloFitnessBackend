import express from "express";
import { login, setPassword } from "../controller/authController.js";
import {
  loginValidationChain,
  passwordValidationChain,
} from "../validators/authValidators.js";

const authRouter = express.Router();

authRouter.post("/login", loginValidationChain, login);
authRouter.post("/set-password", passwordValidationChain, setPassword);

export { authRouter };
