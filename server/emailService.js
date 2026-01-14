// emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('📧 Loading email service...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✓' : 'Not set ✗');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set ✓' : 'Not set ✗');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email connection failed:', error.message);
    console.log('⚠️  Check your .env file and Gmail App Password settings');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Send password reset email
async function sendPasswordResetEmail(toEmail, resetCode) {
  try {
    console.log(`📧 Attempting to send reset email to: ${toEmail}`);
    
    const mailOptions = {
      from: `"HerCycle Support" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'HerCycle - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B5CF6;">HerCycle Password Reset</h2>
          <p>You requested a password reset. Use the code below to reset your password:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #7C3AED; font-size: 32px; letter-spacing: 10px; margin: 0;">${resetCode}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            HerCycle Support Team<br>
            support@hercycle.com
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${toEmail}: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    console.log('⚠️  Using fallback - logging code to console');
    
    // Fallback: log to console
    console.log('\n' + '='.repeat(50));
    console.log('📧 PASSWORD RESET CODE (FALLBACK)');
    console.log('='.repeat(50));
    console.log(`For: ${toEmail}`);
    console.log(`Code: ${resetCode}`);
    console.log('='.repeat(50) + '\n');
    
    return {
      success: true, // Return success anyway for development
      messageId: `console-fallback-${Date.now()}`,
      resetCode: resetCode // Include code for testing
    };
  }
}

// Send password reset confirmation
async function sendPasswordResetConfirmation(toEmail) {
  try {
    const mailOptions = {
      from: `"HerCycle Security" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'HerCycle - Password Reset Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Password Reset Successful</h2>
          <p>Your HerCycle account password has been successfully reset.</p>
          <div style="background-color: #10B981; color: white; padding: 10px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0;">✅ Password Updated Successfully</p>
          </div>
          <p>If you did not make this change, please contact our support team immediately at <a href="mailto:support@hercycle.com">support@hercycle.com</a>.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            HerCycle Security Team<br>
            support@hercycle.com
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset confirmation sent to ${toEmail}: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error.message);
    
    // Fallback
    console.log(`📧 Mock confirmation for: ${toEmail}`);
    
    return {
      success: true,
      messageId: `console-fallback-confirm-${Date.now()}`
    };
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetConfirmation
};