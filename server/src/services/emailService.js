import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// ===== SEND VERIFICATION EMAIL =====
export const sendVerificationEmail = async (email, firstName, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "LikhaCampus <noreply@likhacampus.com>", // Change when you verify domain
      to: [email],
      subject: "Verify Your LikhaCampus Email",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #00017a; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
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

// ===== RESEND VERIFICATION EMAIL =====
export const resendVerificationEmail = async (email, firstName, token) => {
  return sendVerificationEmail(email, firstName, token);
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "LikhaCampus <noreply@likhacampus.com>",
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

// ===== SEND EMAIL WARNING =====
export const sendWarningEmail = async (
  email,
  firstName,
  reason,
  warningCount
) => {
  const subject = "⚠️ Community Guidelines Warning - LikhaCampus";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .warning-count { background: #ff6b6b; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
        .button { display: inline-block; padding: 15px 30px; background: #00017a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Community Guidelines Warning</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${firstName}</strong>,</p>
          
          <p>This is an official warning regarding your activity on LikhaCampus. Our moderation team has reviewed reports about your conduct.</p>
          
          <div class="warning-box">
            <h3 style="margin-top: 0; color: #856404;">📋 Reason for Warning:</h3>
            <p style="margin-bottom: 0; font-size: 15px;"><strong>${reason}</strong></p>
          </div>
          
          <center>
            <div class="warning-count">Warning #${warningCount}</div>
          </center>
          
          <h3>What This Means:</h3>
          <ul>
            <li><strong>Review Required:</strong> Please review our community guidelines immediately</li>
            <li><strong>Future Conduct:</strong> Ensure your activities align with our platform policies</li>
            <li><strong>Consequences:</strong> Additional warnings may result in account suspension or permanent ban</li>
          </ul>
          
          <h3>Next Steps:</h3>
          <ul>
            <li>Read and understand our community guidelines</li>
            <li>Adjust your behavior to comply with platform rules</li>
            <li>Contact support if you have questions or wish to appeal</li>
          </ul>
          
          <center>
            <a href="${process.env.CLIENT_URL}/community-guidelines" class="button">Review Community Guidelines</a>
          </center>
          
          <p style="margin-top: 30px; padding: 15px; background: #e7f3ff; border-radius: 5px; border-left: 4px solid #2196F3;">
            <strong>💡 Appeal Process:</strong> If you believe this warning was issued in error, please contact our support team at <a href="mailto:support@likhacampus.com">support@likhacampus.com</a> within 7 days.
          </p>
        </div>
        <div class="footer">
          <p>LikhaCampus - Connect. Create. Aspire. Transform.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} LikhaCampus. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};
