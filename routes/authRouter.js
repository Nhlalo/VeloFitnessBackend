import express from "express";
import {
  login,
  setPassword,
  logout,
  generateNewAccessToken,
  resetPasswordRequest,
  resetPassword,
  verify,
} from "../controller/authController.js";
import {
  loginValidationChain,
  passwordValidationChain,
  resetPasswordValidationChain,
  resetPasswordRequestValidationChain,
  newAcessTokenValidationChain,
} from "../validators/authValidators.js";
import authenticateToken from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/set-password", passwordValidationChain, setPassword);
authRouter.post(
  "/refresh",
  newAcessTokenValidationChain,
  generateNewAccessToken,
);
authRouter.post("/login", loginValidationChain, login);
authRouter.post("/logout", authenticateToken, logout);
authRouter.post(
  "/reset-password-request",
  resetPasswordRequestValidationChain,
  resetPasswordRequest,
);
authRouter.post("/reset-password", resetPasswordValidationChain, resetPassword);
authRouter.post("/verify", resetPasswordValidationChain, verify);

export { authRouter };
