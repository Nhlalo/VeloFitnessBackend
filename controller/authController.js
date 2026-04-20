import logger from "../utils/logger.js";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedData;
    logger.info(email, `Initiating login setup`);

    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { password },
    });

    if (!user) {
      logger.error(email, `Login Failure, User has no profile`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      logger.error(email, `Login Failure, incorrect password`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    logger.info(email, `login successful`);
    return res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

const setPassword = async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.validatedData;
    logger.info({ email }, "Initiating password setup");

    if (typeof password !== "string" || typeof confirmPassword !== "string") {
      logger.error({ email }, "Password must be a string");
      return res.status(400).json({
        success: false,
        error: "INVALID_PASSWORD_FORMAT",
        message: "Password must be a valid string",
      });
    }
    if (password !== confirmPassword) {
      logger.error(
        { email },
        "Password setup failure: password does not match confirm password",
      );

      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
        error: "PASSWORD_MISMATCH",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      logger.error({ email }, "Password setup failure: User has no profile");
      return res.status(401).json({
        success: false,
        error: "USER_NOT_FOUND",
        message: "Invalid email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        password: hashedPassword,
      },
    });

    logger.info({ email, userId: updatedUser.id }, "Password setup successful");

    return res.status(200).json({
      success: true,
      message: "Password set successfully",
      data: {
        email: updatedUser.email,
        passwordSetAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export { login, setPassword };
