const createResetPasswordEmail = (resetLink) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Vélo Password</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
    <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      
      <!-- Header with logo -->
      <div style="background: #1a1a1a; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 10px 0 0 0; font-size: 24px; letter-spacing: 2px;">VÉLO</h1>
        <p style="color: #ccc; margin: 5px 0 0 0; font-size: 12px;">Premium Fitness Studio</p>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        <h2 style="margin-top: 0; color: #1a1a1a;">Reset Your Password</h2>
        
        <p style="color: #555; line-height: 1.6;">We received a request to reset your password for your Vélo account.</p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetLink}" 
             style="background: #1a1a1a; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 30px; display: inline-block;
                    font-weight: bold; letter-spacing: 1px;">
            RESET PASSWORD
          </a>
        </div>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>🔗 Link expires in 1 hour</strong><br>
            <span style="word-break: break-all;">${resetLink}</span>
          </p>
        </div>
        
        <p style="color: #999; font-size: 13px; margin-top: 30px;">
          If you didn't request this, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0; color: #888; font-size: 12px;">
          © ${new Date().getFullYear()} Vélo Fitness. All rights reserved.<br>
          Ride stronger. Live better.
        </p>
      </div>
    </div>
  </body>
  </html>
`;
};

const createPaymentConfirmationEmail = (paymentDetails) => {
  const {
    customerName,
    amount,
    paymentDate,
    paymentMethod,
    transactionId,
    membershipType,
    billingPeriod,
    nextPaymentDate,
    invoiceNumber,
  } = paymentDetails;

  const formattedAmount =
    typeof amount === "number"
      ? amount.toLocaleString("en-US", { style: "currency", currency: "USD" })
      : amount;

  const formattedPaymentDate = paymentDate
    ? new Date(paymentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const formattedNextPaymentDate = nextPaymentDate
    ? new Date(nextPaymentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Confirmation - Vélo</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; background: #ffffff;">
  <div style="max-width: 550px; margin: 0 auto;">
    
    <!-- Letterhead -->
    <div style="border-bottom: 2px solid #000000; padding-bottom: 20px; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 3px;">VÉLO FITNESS</h1>
      <p style="margin: 5px 0 0 0; font-size: 12px; color: #555555;">
        123 Cycling Avenue · New York, NY 10001<br>
        Tel: (212) 555-7890 · billing@velo.com
      </p>
    </div>
    
    <!-- Date and Reference -->
    <div style="margin-bottom: 30px; text-align: right;">
      <p style="margin: 0; font-size: 12px; color: #555555;">
        <strong>Date:</strong> ${formattedPaymentDate}<br>
        <strong>Invoice:</strong> ${invoiceNumber || `VEL-${Date.now()}`}<br>
        <strong>Transaction ID:</strong> ${transactionId || "N/A"}
      </p>
    </div>
    
    <!-- Recipient -->
    <div style="margin-bottom: 35px;">
      <p style="margin: 0 0 5px 0; font-size: 14px;">To:</p>
      <p style="margin: 0; font-size: 14px; font-weight: bold;">${customerName || "Valued Member"}</p>
    </div>
    
    <!-- Subject Line -->
    <div style="margin-bottom: 25px;">
      <p style="margin: 0; font-size: 16px; font-weight: bold;">RE: Payment Confirmation</p>
    </div>
    
    <!-- Body Text -->
    <div style="margin-bottom: 30px; line-height: 1.6;">
      <p style="margin: 0 0 15px 0; font-size: 14px; color: #000000;">
        Dear ${customerName || "Sir/Madam"},
      </p>
      
      <p style="margin: 0 0 15px 0; font-size: 14px; color: #000000;">
        This letter confirms receipt of your payment. Your membership remains in good standing.
      </p>
    </div>
    
    <!-- Payment Details Table -->
    <div style="margin: 30px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 1px solid #cccccc;">
            <th style="text-align: left; padding: 10px 0; font-weight: bold;">Description</th>
            <th style="text-align: right; padding: 10px 0; font-weight: bold;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 12px 0;">${membershipType || "Membership"} — ${billingPeriod || "Standard billing period"}</td>
            <td style="padding: 12px 0; text-align: right;">${formattedAmount}</td>
          </tr>
          <tr style="border-top: 2px solid #000000;">
            <td style="padding: 12px 0; font-weight: bold;">Total Paid</td>
            <td style="padding: 12px 0; text-align: right; font-weight: bold;">${formattedAmount}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Payment Method -->
    <div style="margin: 20px 0 30px 0;">
      <p style="margin: 0 0 5px 0; font-size: 14px;">
        <strong>Payment Method:</strong> ${paymentMethod || "Credit Card"}
      </p>
      ${
        formattedNextPaymentDate
          ? `
      <p style="margin: 5px 0 0 0; font-size: 14px;">
        <strong>Next Billing Date:</strong> ${formattedNextPaymentDate}
      </p>
      `
          : ""
      }
    </div>
    
    <!-- Closing -->
    <div style="margin: 40px 0 0 0; line-height: 1.6;">
      <p style="margin: 0 0 15px 0; font-size: 14px;">
        Should you have any questions regarding this transaction, please contact our billing department at your earliest convenience.
      </p>
      
      <p style="margin: 30px 0 0 0; font-size: 14px;">
        Respectfully,<br><br>
        <strong>Billing Department</strong><br>
        Vélo Fitness
      </p>
    </div>
    
    <!-- Footer Note -->
    <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #cccccc; font-size: 11px; color: #777777;">
      <p style="margin: 0;">
        This is an automated payment confirmation. Please retain this receipt for your records.
      </p>
    </div>
    
  </div>
</body>
</html>
  `;
};

export { createResetPasswordEmail, createPaymentConfirmationEmail };
