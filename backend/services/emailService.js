const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an HTML email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML email body content
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Lets Cook'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send email verification OTP
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} otp - OTP code
 */
const sendVerificationEmail = async (email, name, otp) => {
  const subject = 'Verify Your Let\'s Cook Account';
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #ff6b35; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #ff6b35; margin: 0; font-size: 28px; font-weight: 700;">🍳 Let's Cook!</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-style: italic;">Welcome to your ultimate kitchen companion</p>
      </div>
      
      <div style="padding: 10px 0;">
        <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${name},</p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">Thank you for signing up with Let's Cook! To get started on your culinary journey, please verify your email address using the one-time password (OTP) below:</p>
        
        <div style="background-color: #fff8f5; border: 1px dashed #ff6b35; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #ff6b35;">${otp}</span>
          <p style="font-size: 12px; color: #888; margin: 10px 0 0 0;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
        </div>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">If you didn't create a Let's Cook account, you can safely ignore this email.</p>
      </div>
      
      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; text-align: center; color: #999; font-size: 12px;">
        <p style="margin: 0;">Happy Cooking!</p>
        <p style="margin: 5px 0 0 0; font-weight: 600; color: #666;">The Let's Cook Culinary Team</p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};

/**
 * Send password reset OTP
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} otp - OTP code
 */
const sendPasswordResetEmail = async (email, name, otp) => {
  const subject = 'Reset Your Let\'s Cook Password';
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #ff6b35; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #ff6b35; margin: 0; font-size: 28px; font-weight: 700;">🔑 Password Reset Request</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-style: italic;">Let's get you back into the kitchen</p>
      </div>
      
      <div style="padding: 10px 0;">
        <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${name},</p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">We received a request to reset the password for your Let's Cook account. Use the OTP code below to reset your password:</p>
        
        <div style="background-color: #fff8f5; border: 1px dashed #ff6b35; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #ff6b35;">${otp}</span>
          <p style="font-size: 12px; color: #888; margin: 10px 0 0 0;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
        </div>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
      </div>
      
      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; text-align: center; color: #999; font-size: 12px;">
        <p style="margin: 0;">Happy Cooking!</p>
        <p style="margin: 5px 0 0 0; font-weight: 600; color: #666;">The Let's Cook Culinary Team</p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
