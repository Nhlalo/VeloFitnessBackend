import Stripe from "stripe";
import logger from "../utils/logger.js";
import { membershipPrices } from "../data/membershipPrice.js";
import createAccount from "../service/accountservice.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const checkout = async (req, res, next) => {
  try {
    const { email, userClub } = req.validatedData;
    logger.info(email, `Process payment commence`);

    const lowercaseUserClub = userClub.toLowerCase();
    const price = membershipPrices[lowercaseUserClub];

    if (!price || typeof price !== "number" || isNaN(price)) {
      return res.status(400).json({
        error: "Invalid membership price",
      });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: "usd",
      metadata: {
        product_name: userClub,
        timestamp: new Date().toISOString(),
      },
      payment_method_types: ["card"],
    });

    req.paymentIntentId = paymentIntent.id;
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
};

export { checkout };
