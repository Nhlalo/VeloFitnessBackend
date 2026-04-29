import Stripe from "stripe";
import { prisma } from "../lib/prisma.js";
import logger from "../utils/logger.js";
import crypto from "crypto";
import userModel from "../model/userModels.js";
import { membershipPrices } from "../data/membershipPrice.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create user ONLY after payment succeeds
const createUserProfile = async (req, res, next) => {
  const {
    name,
    surname,
    email,
    zipCode,
    phoneNumber,
    membershipTitle,
    paymentIntentId,
    clubName,
  } = req.validatedData;

  logger.info(`${email}: profile creation started`);

  try {
    // Verify payment actually succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      logger.warn(
        `${email}: Payment not successful - Status: ${paymentIntent.status}`,
      );
      return res.status(400).json({
        success: false,
        error: "Payment not successful",
        message: `Cannot create account. Payment status: ${paymentIntent.status}`,
        paymentStatus: paymentIntent.status,
      });
    }

    const user = await userModel.findByEmail(email);

    if (user) {
      logger.warn(
        { email, userId: user.id },
        "Signup attempted with existing email",
      );
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please log in instead.",
      });
    }

    const newUser = await userModel.createAccount(
      name,
      surname,
      email,
      zipCode,
      phoneNumber,
      clubName,
      membershipTitle,
    );

    const validationToken = crypto.randomBytes(32).toString("hex");

    const updatedUser = await userModel.addSetPasswordToken(
      validationToken,
      newUser.id,
    );

    logger.info(`${email}: Profile successful created`);

    return res.status(201).json({
      success: true,
      message: "Account created successfully after payment confirmation",
      data: {
        userId: newUser.id,
        email: email,
        name: name,
        surname: surname,
        clubName: clubName,
        membershipTitle: membershipTitle,
        paymentStatus: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
        token: validationToken,
      },
    });
  } catch (error) {
    logger.error({ err: error, email }, "failed to create user profile");
    next(error);
  }
};

export { createUserProfile };
