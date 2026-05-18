const extractPaymentDetails = async (paymentIntent) => {
  // Extract payment method details
  const paymentMethod = paymentIntent.payment_method;
  let paymentMethodString = "Unknown";

  const { brand, last4 } = paymentMethod.card;
  paymentMethodString = `${brand.charAt(0).toUpperCase() + brand.slice(1)} ending in ${last4}`;

  // Extract invoice number from metadata or generate one
  const invoiceNumber =
    paymentIntent.metadata.invoiceNumber ||
    `INV-${paymentIntent.created}-${paymentIntent.id.slice(-6)}`;

  // Format amounts
  const amount = paymentIntent.amount / 100; // Convert cents to dollars
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: paymentIntent.currency.toUpperCase(),
  }).format(amount);

  // Get payment date
  const paymentDate = new Date(paymentIntent.created * 1000);

  const nextPaymentDate = new Date(paymentDate);
  nextPaymentDate.setDate(paymentDate.getDate() + 30);

  return {
    amount: amount,
    formattedAmount: formattedAmount,
    paymentDate: paymentDate,
    paymentMethod: paymentMethodString,
    transactionId: paymentIntent.id,
    invoiceNumber: invoiceNumber,
    currency: paymentIntent.currency,
    nextPaymentDate: nextPaymentDate,
  };
};

export { extractPaymentDetails };
