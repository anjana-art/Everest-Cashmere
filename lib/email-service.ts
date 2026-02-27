// lib/email-service.ts
import nodemailer from 'nodemailer';

export class EmailService {
  // Create transporter with SSL/TLS options
  private static createTransporter() {
    // For development without SMTP, return null
    if (!process.env.SMTP_HOST && process.env.NODE_ENV === 'development') {
      return null;
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
        // Try to use TLS if available
        ciphers: 'SSLv3'
      },
      // For Gmail, these settings help
      requireTLS: true,
      // Connection timeout
      connectionTimeout: 10000, // 10 seconds
    });
  }

  private static transporter = EmailService.createTransporter();

  static async sendPasswordResetEmail(email: string, token: string) {
    // Check if SMTP is configured, use dev version if not
    if (!this.transporter && process.env.NODE_ENV === 'development') {
      return this.sendPasswordResetEmailDev(email, token);
    }

    if (!this.transporter) {
      throw new Error('Email service not configured. Please set SMTP environment variables.');
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || '"Your App" <noreply@yourapp.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #7f1d1d, #991b1b); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 16px;">Hello,</p>
            
            <p style="font-size: 16px;">We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #d97706; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; hover:background-color: #b45309; transition: background-color 0.3s;">Reset Password</a>
            </div>
            
            <p style="font-size: 16px;">Or copy and paste this link into your browser:</p>
            <p style="background: #eee; padding: 12px; border-radius: 5px; word-break: break-all; font-size: 14px;">
              <a href="${resetUrl}" style="color: #d97706;">${resetUrl}</a>
            </p>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 5px;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ This link will expire in 1 hour.</strong>
              </p>
            </div>
            
            <p style="font-size: 16px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              © ${new Date().getFullYear()} Your Company. All rights reserved.<br>
              <small>This is an automated message, please do not reply.</small>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        RESET YOUR PASSWORD
        
        We received a request to reset your password.
        
        Click the link below to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        
        © ${new Date().getFullYear()} Your Company
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully to:', email);
      console.log('📨 Message ID:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('❌ Email sending error:', error);
      
      // Detailed error logging
      if (error.code === 'ECONNECTION' || error.code === 'ESOCKET') {
        console.error('🔌 Connection error. Check your SMTP settings.');
        console.error('📡 Current SMTP config:', {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SECURE,
          user: process.env.SMTP_USER ? '✓ Set' : '✗ Missing',
          pass: process.env.SMTP_PASSWORD ? '✓ Set' : '✗ Missing',
        });
      }
      
      // Fallback to dev logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('\x1b[33m%s\x1b[0m', '⚠️ Email failed, using dev logger instead:');
        return this.sendPasswordResetEmailDev(email, token);
      }
      
      throw new Error(`Failed to send reset email: ${error.message}`);
    }
  }

  // Welcome email on signup
  static async sendWelcomeEmail(email: string, name?: string) {
    if (!this.transporter && process.env.NODE_ENV === 'development') {
      console.log('\n📧 ========== DEV WELCOME EMAIL ==========');
      console.log('📧 To:', email);
      console.log('📧 Subject: Welcome to Our App!');
      console.log('📧 =======================================\n');
      return { success: true, dev: true };
    }

    if (!this.transporter) {
      return { success: false, error: 'Email service not configured' };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || '"Your App" <noreply@yourapp.com>',
      to: email,
      subject: 'Welcome to Our App!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #7f1d1d, #991b1b); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">Welcome ${name || 'there'}! 🎉</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Thank you for signing up. We're excited to have you on board!</p>
            <p style="font-size: 16px;">Start exploring our products and enjoy shopping.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" style="background-color: #d97706; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Start Shopping</a>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent to:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Welcome email error:', error);
      return { success: false };
    }
  }

  // Development version - logs to console
  private static async sendPasswordResetEmailDev(email: string, token: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    
    console.log('\n\x1b[36m%s\x1b[0m', '📧 ========== DEV EMAIL (SMTP not configured) ==========');
    console.log('\x1b[36m%s\x1b[0m', `📧 To: ${email}`);
    console.log('\x1b[36m%s\x1b[0m', '📧 Subject: Password Reset Request');
    console.log('\x1b[36m%s\x1b[0m', `📧 Reset URL: ${resetUrl}`);
    console.log('\x1b[36m%s\x1b[0m', `📧 Token: ${token}`);
    console.log('\x1b[36m%s\x1b[0m', '📧 ====================================================\n');
    
    return { success: true, dev: true };
  }

  // Test email configuration
  static async testConfig() {
    if (!this.transporter) {
      console.log('❌ Email service not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service configured successfully');
      return true;
    } catch (error) {
      console.error('❌ Email service verification failed:', error);
      return false;
    }
  }
}

// Optional: Add a warning in development if SMTP not configured
if (process.env.NODE_ENV === 'development') {
  if (!process.env.SMTP_HOST) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  SMTP not configured. Emails will be logged to console in development.');
  } else {
    // Test the configuration in development
    setTimeout(() => {
      EmailService.testConfig().catch(console.error);
    }, 1000);
  }
}