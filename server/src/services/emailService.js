import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Send verification email
export const sendVerificationEmail = async (email, firstName, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "LikhaCampus <onboarding@resend.dev>", // Change when you verify domain
      to: [email],
      subject: "Verify Your LikhaCampus Email",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #00017a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to LikhaCampus!</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>Thank you for registering with LikhaCampus! We're excited to have you join our creative community.</p>
              <p>Please verify your email address by clicking the button below:</p>
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create a LikhaCampus account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>LikhaCampus - Connect. Create. Aspire. Transform.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }

    console.log("Verification email sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
};

// Resend verification email
export const resendVerificationEmail = async (email, firstName, token) => {
  return sendVerificationEmail(email, firstName, token);
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "LikhaCampus <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }

    console.log("Email sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
};
