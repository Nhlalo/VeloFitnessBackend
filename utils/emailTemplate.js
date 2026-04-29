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

export { createResetPasswordEmail };
