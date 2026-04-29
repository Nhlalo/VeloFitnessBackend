import Stripe from "stripe";
import logger from "../utils/logger.js";
import { membershipPrices } from "../data/membershipPrice.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const checkout = async (req, res, next) => {
  const { email, membershipTitle } = req.validatedData;
  logger.info({ email }, `Process payment commence`);

  const lowercaseMembershipTitle = membershipTitle.toLowerCase();
  const price = membershipPrices[lowercaseMembershipTitle];

  if (!price || typeof price !== "number" || isNaN(price)) {
    logger.error({ err: error, email }, "Invalid membership price");

    return res.status(400).json({
      error: "Invalid membership price",
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: "usd",
      metadata: {
        product_name: membershipTitle,
        timestamp: new Date().toISOString(),
      },
      payment_method_types: ["card"],
    });

    const confirmedPayment = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      { payment_method: "pm_card_visa" },
    );

    req.paymentIntentId = paymentIntent.id;
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    logger.error({ err: error, email }, "failed to complete payment");
    next(error);
  }
};

export { checkout };
