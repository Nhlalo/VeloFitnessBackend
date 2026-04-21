import logger from "../utils/logger.js";
import userModel from "../model/userModels.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "my-secret-key";
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET || "my-refresh-secret";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Authentication Controller
 * Handles user login, logout, password setup, and token refresh
 * Uses JWT for access tokens (15min) and refresh tokens (7 days)
 */

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

    const user = await userModel.findByEmail(email);

    if (!user) {
      logger.error({ email }, "Password setup failure: User has no profile");
      return res.status(401).json({
        success: false,
        error: "USER_NOT_FOUND",
        message: "Invalid email",
      });
    }

    const hashedPassword = await userModel.hashPassword(password);

    const updatedUser = await userModel.updatePassword(email, hashedPassword);

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

const generateNewToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    logger.info(`Initiating new token generation`);

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const storedToken = await userModel.findByToken(refreshToken);

    if (!storedToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    if (storedToken.expiresAt < Date.now()) {
      await userModel.deleteRefreshToken(refreshToken);
      return res.status(403).json({ error: "Refresh token expired" });
    }

    jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid refresh token" });
      }
      const user = storedToken.user;

      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          membershipStatus: user.membershipStatus,
          membershipEndDate: user.membershipEndDate,
          nextBillingDate: user.nextBillingDate,
          membershipTitle: user.currentMembership.title,
        },
        SECRET_KEY,
        { expiresIn: "15m" },
      );

      res.cookie("accessToken", newAccessToken, cookieOptions);

      res.json({ message: "Access token refreshed successfully" });
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedData;
    logger.info({ email }, `Initiating login setup`);

    const user = await userModel.findByEmail(email, true);

    if (!user) {
      logger.error({ email }, `Login Failure, User has no profile`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await userModel.validatePassword(password, user.password);

    if (!match) {
      logger.error({ email }, `Login Failure, incorrect password`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        membershipStatus: user.membershipStatus,
        membershipEndDate: user.membershipEndDate,
        nextBillingDate: user.nextBillingDate,
        membershipTitle: user.currentMembership.title,
      },
      SECRET_KEY,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET_KEY, {
      expiresIn: "7d",
    });

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // Add 7 days, in milliseconds, from the current day
    await userModel.addRefreshToken(refreshToken, user.id, new Date(expiresAt));

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    logger.info({ email }, `login successful`);
    return res.status(200).json({
      message: "Login successful",
      userId: user.id,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    logger.info({ userId: req.user?.id }, "Initiating logout process");
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await userModel.deleteRefreshToken(refreshToken);
      logger.info({ refreshToken }, "Refresh token deleted");
    }

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", refreshCookieOptions);

    logger.info(`Logged out successfully`);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    logger.info(`Logout failed`);
    next(error);
  }
};

export { login, setPassword, generateNewToken, logout };
