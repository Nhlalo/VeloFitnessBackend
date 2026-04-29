import express from "express";
import authenticateToken from "../middleware/authMiddleware.js";
import {
  changeMembership,
  cancelMembership,
  reactivateMembership,
} from "../controller/membershipController.js";
import { validateMembershipTitle } from "../validators/userValidators.js";
import { sanitizeMembershipTitle } from "../validators/userSanitizers.js";
import { dataValidation } from "../middleware/validationMiddleware.js";

const membershipRouter = express.Router();

//For membership change
membershipRouter.patch(
  "/",
  authenticateToken,
  validateMembershipTitle(),
  sanitizeMembershipTitle(),
  dataValidation("Memberhsip change failed", "Membership change successful"),
  changeMembership,
);

membershipRouter.post("/cancel", authenticateToken, cancelMembership);

membershipRouter.post("/reactivate", authenticateToken, reactivateMembership);

export { membershipRouter };
