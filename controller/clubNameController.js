import logger from "../utils/logger.js";
import userModel from "../model/userModels.js";

export const changeClubName = async (req, res, next) => {
  const email = req.user.email;
  logger.info(email);
  const previousclubName = req.user.clubName;
  logger.info({ previousclubName }, "Initiating club name change process");
  const { clubName } = req.validatedData;

  if (!email) {
    logger.error({ email }, "No email found in request user object");

    return res.status(400).json({
      success: false,
      message: "User email is required",
    });
  }

  if (previousclubName === clubName) {
    logger.error(
      { email },
      "Existing club name present in the request user object",
    );

    return res.status(409).json({
      success: false,
      message: "Club name must be different from the current club name",
    });
  }

  logger.info({ email }, "Initiating club name change process");

  try {
    const updatedUser = await userModel.changeClubName(email, clubName);

    if (!updatedUser) {
      logger.warn({ email }, "User not found or club name update failed");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    logger.info({ email }, "club name change successful");

    res.status(200).json({
      success: true,
      message: "club name changed successfully",
      data: {
        email: updatedUser.email,
        clubName: updatedUser.clubName,
        changedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error({ err: error, email }, "Club Name change failed");
    next(error);
  }
};
