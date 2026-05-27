import logger from "../utils/logger.js";
import userModel from "../model/userModels.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { createResetPasswordEmail } from "../utils/emailTemplate.js";

const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // Allows cookies to be sent with cross-origin requests in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Authentication Controller
 * Handles user login, logout, password setup, and token refresh
 * Uses JWT for access tokens (15min) and refresh tokens (7 days)
 */

const setPassword = async (req, res, next) => {
  const { token, email, password, confirmPassword } = req.validatedData;

  logger.info({ email }, "Initiating password setup");

  try {
    const setTokenRecord = await userModel.findValidSetPasswordToken(token);

    if (!setTokenRecord) {
      logger.error("Invalid token");

      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const hashedPassword = await userModel.hashPassword(password);

    const updatedUser = await userModel.updatePassword(email, hashedPassword);

    logger.info({ email, userId: updatedUser.id }, "Password setup successful");

    await userModel.deleteSetPasswordToken(token);

    return res.status(200).json({
      success: true,
      message: "Password set successfully",
      data: {
        email: updatedUser.email,
        passwordSetAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error({ err: error, email }, "Failed to set a password");
    next(error);
  }
};

const generateNewAccessToken = async (req, res, next) => {
  const { email } = req.validatedData;
  const refreshToken = req.cookies.refreshToken;

  logger.info({ email }, `Initiating new token generation`);

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
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
          clubName: user.clubName,
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
    logger.error({ err: error, email }, "Failed to generate new access token");
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.validatedData;
  logger.info({ email }, `Initiating login setup`);

  try {
    const user = await userModel.findByEmail(email, true);

    if (!user || !user.password) {
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
        clubName: user.clubName,
        membershipStatus: user.membershipStatus,
        membershipStartDate: user.membershipStartDate,
        membershipEndDate: user.membershipEndDate,
        nextBillingDate: user.nextBillingDate,
        membershipTitle: user.currentMembership.title,
        zipCode: user.zipCode,
        phoneNumber: user.phoneNumber,
      },
      SECRET_KEY,
      { expiresIn: "15m" },
    );
    if (!REFRESH_SECRET_KEY) {
      logger.info("REFRESH_SECRET_KEY INVALID");
    }
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
      user: {
        userId: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        clubName: user.clubName,
        membershipStatus: user.membershipStatus,
        membershipStartDate: user.membershipStartDate,
        membershipEndDate: user.membershipEndDate,
        nextBillingDate: user.nextBillingDate,
        membershipTitle: user.currentMembership.title,
        zipCode: user.zipCode,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    logger.error({ err: error, email }, "Failed to login");
    next(error);
  }
};

const logout = async (req, res, next) => {
  const email = req.user?.email;
  if (!email) {
    logger.error("No email found in request user object");

    return res.status(400).json({
      success: false,
      message: "User email is required",
    });
  }

  logger.info({ email }, "Initiating logout process");

  const refreshToken = req.cookies.refreshToken;

  try {
    if (refreshToken) {
      await userModel.deleteRefreshToken(refreshToken);
      logger.info({ refreshToken }, "Refresh token deleted");
    }

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", refreshCookieOptions);

    logger.info({ email }, `Logged out successfully`);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error({ err: error, email }, "Failed to logout");
    next(error);
  }
};

const resetPasswordRequest = async (req, res, next) => {
  const { email } = req.validatedData;
  logger.info({ email }, `Initiating password reset request`);

  if (!process.env.APP_URL || !process.env.RESEND_API_KEY) {
    logger.error({ email }, "APP_URL environment variable is not set");
    throw new Error("Server configuration error");
  }

  try {
    const user = await userModel.findByEmail(email);

    if (!user) {
      logger.warn({ email }, "Password setup attempted for non-existent user");
      return res.status(200).json({
        success: true,
        message: "If an account exists, a password reset link has been sent.",
      });
    }

    const validationToken = crypto.randomBytes(32).toString("hex");

    const updatedUser = await userModel.addSetPasswordToken(
      validationToken,
      user.id,
    );

    const resetLink = `${process.env.APP_URL}/set-password?email=${email}&token=${validationToken}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Reset Password",
        html: createResetPasswordEmail(resetLink),
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        logger.error({ email }, "Invalid or missing Resend API key");
        throw new Error("Invalid or missing Resend API key");
      }
      if (response.status === 429) {
        logger.error({ email }, "Rate limited by Resend");
        throw new Error("Rate limited by Resend");
      }
      logger.error({ email }, "Resend Server down");
      throw new Error("Resend Server down");
    }

    logger.info({ email }, "Email sent successfully");

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: {
        email: updatedUser.email,
        emailSentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error({ err: error, email }, "Failed to send email");
    next(error);
  }
};

const verify = async (req, res) => {
  const email = req.user.email;

  if (!email) {
    logger.error({ email }, "No email found in request user object");

    return res.status(400).json({
      success: false,
      message: "User email is required",
    });
  }
  try {
    const user = await userModel.findByEmail(email, true);

    if (!user) {
      logger.error({ email }, `Login Failure, User has no profile`);
      return res.status(401).json({ message: "Invalid email" });
    }

    res.status(200).json({
      success: true,
      message: "Authentication confirmed",
      user: {
        userId: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        clubName: user.clubName,
        membershipStatus: user.membershipStatus,
        membershipStartDate: user.membershipStartDate,
        membershipEndDate: user.membershipEndDate,
        nextBillingDate: user.nextBillingDate,
        membershipTitle: user.currentMembership.title,
        phoneNumber: user.phoneNumber,
        zipCode: user.zipCode,
      },
    });
  } catch (error) {
    logger.error({ err: error, email }, "Failed to verify user");
    next(error);
  }
};

export {
  login,
  setPassword,
  generateNewAccessToken,
  logout,
  resetPasswordRequest,
  verify,
};
