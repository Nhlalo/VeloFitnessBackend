import logger from "../utils/logger.js";
import userModel from "../model/userModels.js";

const changeMembership = async (req, res, next) => {
  const email = req.user.email;
  const membershipEndDate = req.user.membershipEndDate;
  const { membershipTitle } = req.validatedData;

  if (!email) {
    logger.error({ email }, "No email found in request user object");

    return res.status(400).json({
      success: false,
      message: "User email is required",
    });
  }

  if (!membershipEndDate) {
    logger.warn({ email }, "User has no membership end date");
    return res.status(400).json({
      success: false,
      message: "User does not have an active membership",
    });
  }

  logger.info({ email }, "Initiating membership change process");

  try {
    const updatedUser = await userModel.changeMembership(
      email,
      membershipEndDate,
      membershipTitle.toLowerCase(),
    );

    if (!updatedUser) {
      logger.warn({ email }, "User not found or membership update failed");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    logger.info({ email }, "Membership change successful");

    res.status(200).json({
      success: true,
      message: "Membership changed successfully",
      data: {
        email: updatedUser.email,
        membershipTitle: updatedUser.membershipTitle,
        nextBillingDate: updatedUser.nextBillingDate,
        changedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error({ err: error, email }, "Membership change failed");
    next(error);
  }
};

const cancelMembership = async (req, res, next) => {
  const email = req.user.email;

  if (!email) {
    logger.error({ email }, "No email found in request user object");
    return res.status(400).json({
      success: false,
      message: "User email is required",
    });
  }

  logger.info({ email }, "Initiating membership cancellation process");

  try {
    const updatedUser = await userModel.updateMembershipStatus(
      email,
      "Inactive",
      null,
      new Date(),
    );

    if (!updatedUser) {
      logger.warn({ email }, "User not found or membership update failed");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    logger.info({ email }, "Membership cancellation successful");

    res.status(200).json({
      success: true,
      message: "Membership cancelled successfully",
      data: {
        email: updatedUser.email,
        membershipStatus: updatedUser.membershipStatus,
        cancelledAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error({ err: error, email }, "Failed to cancel membership");
    next(error);
  }
};

const reactivateMembership = async (req, res, next) => {
  const email = req.user.email;
  const membershipEndDate = req.user.membershipEndDate;

  if (!email) {
    logger.error({ email }, "No email found in request user object");
    return res.status(400).json({
      success: false,
      message: "User email is required",
    });
  }
  if (!membershipEndDate) {
    logger.warn({ email }, "User has no membership end date");
    return res.status(400).json({
      success: false,
      message: "User does not have an active membership",
    });
  }

  logger.info({ email }, "Initiating membership reactivation process");

  try {
    const updatedUser = await userModel.updateMembershipStatus(
      email,
      "Active",
      membershipEndDate,
      null,
    );

    if (!updatedUser) {
      logger.warn({ email }, "User not found or membership update failed");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    logger.info({ email }, "Membership reactivation successful");

    res.status(200).json({
      success: true,
      message: "Membership reactivation successfully",
      data: {
        email: updatedUser.email,
        membershipStatus: updatedUser.membershipStatus,
        membershipTitle: updatedUser.currentMembership.title,
        nextBillingDate: membershipEndDate,
        reactivatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error({ err: error, email }, "Membership reactiviation failed");
    next(error);
  }
};

export { changeMembership, cancelMembership, reactivateMembership };
