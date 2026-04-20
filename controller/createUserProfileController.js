import Stripe from "stripe";
import logger from "../utils/logger.js";
import { prisma } from "../lib/prisma.js";
import { membershipPrices } from "../data/membershipPrice.js";
import createAccount from "../service/accountservice.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create user ONLY after payment succeeds
const createUserProfile = async (req, res, next) => {
  try {
    const {
      name,
      surname,
      email,
      zipCode,
      phoneNumber,
      userClub,
      paymentIntentId,
    } = req.validatedData;
    logger.info(`${email}: profile creation started`);

    const lowercaseUserClub = userClub.toLowerCase();

    if (!paymentIntentId) {
      logger.error(`${email}: No paymentIntentId provided`);
      return res.status(400).json({
        success: false,
        error: "Missing payment intent ID",
        message: "Payment verification required to create account",
      });
    }

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

    const doesUserExists = await prisma.user.findUnique({
      where: { email: email },
    });

    if (doesUserExists) {
      logger.info(`${email}: User already exists`);
      return res.status(409).json({
        success: false,
        error: "User already exists",
        message: "An account with this email already exists",
        userId: doesUserExists.id,
      });
    }

    if (!doesUserExists) {
      await createAccount(
        name,
        surname,
        email,
        zipCode,
        phoneNumber,
        lowercaseUserClub,
        next,
      );
    }

    logger.info(`${email}: Profile successful created`);

    return res.status(201).json({
      success: true,
      message: "Account created successfully after payment confirmation",
      data: {
        userId: newUser.id,
        email: email,
        name: name,
        surname: surname,
        userClub: lowercaseUserClub,
        paymentStatus: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { createUserProfile };
