import Stripe from "stripe";
import { prisma } from "../lib/prisma.js";
import logger from "../utils/logger.js";
import crypto from "crypto";
import userModel from "../model/userModels.js";
import { membershipPrices } from "../data/membershipPrice.js";
import { extractPaymentDetails } from "../utils/extractPaymentDetails.js";
import { createPaymentConfirmationEmail } from "../utils/emailTemplate.js";

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

    // Verify payment actually succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {
        expand: ["payment_method", "charges.data.balance_transaction"],
      },
    );

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

    const paymentDetails = await extractPaymentDetails(paymentIntent);

    const paymentConfirmationEmailData = {
      customerName: name + " " + surname,
      amount: paymentDetails.formattedAmount,
      paymentDate: paymentDetails.paymentDate,
      paymentMethod: paymentDetails.paymentMethod,
      transactionId: paymentDetails.transactionId,
      membershipType: membershipTitle,
      billingPeriod: "Monthly",
      nextPaymentDate: paymentDetails.nextPaymentDate,
      invoiceNumber: paymentDetails.invoiceNumber,
    };

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

    res.status(201).json({
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

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Velo Fitness",
          email: "noreply.velofitness@gmail.com",
        },
        to: [{ email: email, name: name + " " + surname }],
        subject: "Payment Confirmation",
        htmlContent: createPaymentConfirmationEmail(
          paymentConfirmationEmailData,
        ),
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        logger.error({ email }, "Invalid or missing Brevo API key");
      }
      if (response.status === 429) {
        logger.error({ email }, "Rate limited by BREVO");
      }
      logger.error({ email }, "Brevo Server down");
    } else {
      logger.info({ email }, "Email sent successfully");
    }
  } catch (error) {
    logger.error({ err: error, email }, "failed to create user profile");
    next(error);
  }
};

const updatePersonalDetails = async (req, res, next) => {
  const { name, surname, email, zipCode, phoneNumber } = req.validatedData;

  logger.info(`${email}:  "Initiating personal details change process"`);

  try {
    const updatedUser = await userModel.updatePersonalDetails(
      email,
      name,
      surname,
      zipCode,
      phoneNumber,
    );

    if (!updatedUser) {
      logger.warn(
        { email },
        "User not found or personal details update failed",
      );
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    logger.info({ email }, "personal details change successful");

    res.status(200).json({
      success: true,
      message: "Personal details changed successfully",
      data: {
        success: true,
        email: updatedUser.email,
        changedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error({ err: error, email }, "Personal details change failed");
    next(error);
  }
};

export { createUserProfile, updatePersonalDetails };
