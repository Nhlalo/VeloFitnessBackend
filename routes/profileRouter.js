import express from "express";
import authenticateToken from "../middleware/authMiddleware.js";
import { profile } from "../controller/profileController.js";

const profileRouter = express.Router();

profileRouter.post("/", authenticateToken, profile);

export { profileRouter };
