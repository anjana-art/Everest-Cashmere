// lib/email-templates.ts - Email with review form link

export const reviewRequestEmail = (data: {
  customerName: string;
  productName: string;
  productId: string;
  orderId: string;
  storeName: string;
}) => {
  const { customerName, productName, productId, orderId, storeName } = data;
  // Direct link to profile reviews page
  const reviewLink = `${process.env.NEXT_PUBLIC_BASE_URL}/profile/my-reviews`;

  return {
    subject: `How are you enjoying your ${productName}? 💫`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Georgia, serif; line-height: 1.6; color: #1a1a1a; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fdf8f3; }
          .header { text-align: center; border-bottom: 2px solid #e8d5c4; padding-bottom: 20px; }
          .header h1 { color: #7f1d1d; font-size: 28px; font-weight: 300; }
          .content { padding: 30px 0; }
          .product-box { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e8d5c4; margin: 20px 0; }
          .btn { display: inline-block; background: #b45309; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; }
          .btn:hover { background: #92400e; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8d5c4; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Your Thoughts Matter</h1>
          </div>
          <div class="content">
            <p>Dear ${customerName},</p>
            <p>I hope you've been enjoying your <strong>${productName}</strong>! It's been a few weeks since your purchase, and I'd love to hear your thoughts.</p>
            
            <div class="product-box">
              <p style="margin: 0; text-align: center;">
                <strong>${productName}</strong><br>
                <span style="font-size: 14px; color: #666;">Order #${orderId}</span>
              </p>
            </div>
            
            <p><strong>Would you mind sharing a few thoughts?</strong></p>
            <ul style="color: #555;">
              <li>⭐ How do you like the quality?</li>
              <li>📋 Is it what you expected?</li>
              <li>💭 Any feedback for us?</li>
            </ul>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${reviewLink}" class="btn">Write a Review →</a>
            </p>
            
            <p style="color: #888; font-size: 14px;">
              Your feedback helps us improve and helps other customers make confident decisions.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};