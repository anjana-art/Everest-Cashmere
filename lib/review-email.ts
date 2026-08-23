// lib/review-email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// CUSTOMER EMAILS
// ============================================

interface ReviewApprovedNotification {
  email: string;
  name: string;
  productName: string;
  review: string;
  rating: number;
}

export async function sendReviewApprovedEmail({
  email,
  name,
  productName,
  review,
  rating,
}: ReviewApprovedNotification) {
  try {
    const subject = 'Your review has been published! ✨';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Georgia, serif; line-height: 1.6; color: #1a1a1a; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #f3e8d6; padding-bottom: 20px; }
          .header h1 { color: #7f1d1d; font-size: 24px; }
          .content { padding: 20px 0; }
          .review-box { background: #fdf8f3; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b45309; }
          .rating { color: #f59e0b; font-size: 20px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #f3e8d6; text-align: center; font-size: 12px; color: #666; }
          .btn { background: #b45309; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Review! ✨</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Your review for <strong>${productName}</strong> has been approved and is now live on our website!</p>
            
            <div class="review-box">
              <p class="rating">${'⭐'.repeat(rating)}</p>
              <p>"${review}"</p>
            </div>
            
            <p>Your feedback helps other customers make informed decisions, and we truly appreciate you taking the time to share your experience.</p>
            
            <p style="margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/products" class="btn">
                View Our Collection
              </a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_STORE_NAME || 'Himkash'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Himkash <reviews@himkash.com>',
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('❌ Review approved email failed:', error);
    // Don't throw - just log
  }
}

interface ExperienceApprovedNotification {
  email: string;
  name: string;
  content: string;
}

export async function sendExperienceApprovedEmail({
  email,
  name,
  content,
}: ExperienceApprovedNotification) {
  try {
    const subject = 'Your experience has been published! 💫';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Georgia, serif; line-height: 1.6; color: #1a1a1a; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #f3e8d6; padding-bottom: 20px; }
          .header h1 { color: #7f1d1d; font-size: 24px; }
          .content { padding: 20px 0; }
          .experience-box { background: #fdf8f3; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b45309; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #f3e8d6; text-align: center; font-size: 12px; color: #666; }
          .btn { background: #b45309; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Story Matters! 💫</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Thank you for sharing your experience with us. Your story has been published and is now inspiring other customers!</p>
            
            <div class="experience-box">
              <p>"${content}"</p>
            </div>
            
            <p>We're grateful for customers like you who help us grow and improve.</p>
            
            <p style="margin-top: 20px; font-style: italic; color: #666;">
              "Your experience is the heart of our brand."
            </p>
            
            <p style="margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/about" class="btn">
                Learn More About Us
              </a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_STORE_NAME || 'Himkash'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Himkash <reviews@himkash.com>',
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('❌ Experience approved email failed:', error);
    // Don't throw - just log
  }
}

// ============================================
// ADMIN EMAILS
// ============================================

interface AdminReviewNotification {
  reviewId: string;
  productName: string;
  userName: string;
  userEmail: string;
  rating: number;
  review: string;
}

export async function sendAdminReviewNotification({
  reviewId,
  productName,
  userName,
  userEmail,
  rating,
  review,
}: AdminReviewNotification) {
  try {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'himkash.info@gmail.com';
    
    const subject = `📝 New Review: ${productName} (${rating}⭐)`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: #8B1E1E; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .review-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .btn { background: #8B1E1E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 New Review Submitted</h1>
          </div>
          <div class="content">
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Customer:</strong> ${userName} (${userEmail})</p>
            <p><strong>Rating:</strong> ${'⭐'.repeat(rating)} (${rating}/5)</p>
            <div class="review-box">
              <p><strong>Review:</strong></p>
              <p>"${review}"</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/reviews/${reviewId}" class="btn">Moderate Review →</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Himkash <reviews@himkash.com>',
      to: adminEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error('❌ Admin review notification failed:', error);
    // Don't throw - just log
  }
}

interface AdminExperienceNotification {
  experienceId: string;
  userName: string;
  userEmail: string;
  content: string;
}

export async function sendAdminExperienceNotification({
  experienceId,
  userName,
  userEmail,
  content,
}: AdminExperienceNotification) {
  try {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'himkash.info@gmail.com';
    
    const subject = `💬 New Customer Experience Submitted`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: #8B1E1E; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .exp-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .btn { background: #8B1E1E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Customer Experience</h1>
          </div>
          <div class="content">
            <p><strong>Customer:</strong> ${userName} (${userEmail})</p>
            <div class="exp-box">
              <p><strong>Experience:</strong></p>
              <p>"${content}"</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/experiences/${experienceId}" class="btn">Moderate →</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Himkash <reviews@himkash.com>',
      to: adminEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error('❌ Admin experience notification failed:', error);
    // Don't throw - just log
  }
}