import express from "express";
import {
  login,
  setPassword,
  logout,
  generateNewToken,
} from "../controller/authController.js";
import {
  loginValidationChain,
  passwordValidationChain,
} from "../validators/authValidators.js";
import authenticateToken from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/set-password", passwordValidationChain, setPassword);
authRouter.post("/refresh", generateNewToken);
authRouter.post("/login", loginValidationChain, login);
authRouter.post("/logout", authenticateToken, logout);

export { authRouter };
