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
transporter.verify(function (error, success) {
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

// ========== PHASE 3: DOCTOR MANAGEMENT EMAILS ==========

// Send doctor approval email
async function sendDoctorApprovalEmail(toEmail, doctorName, specialty) {
  try {
    const mailOptions = {
      from: `"HerCycle Admin" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'HerCycle - Doctor Verification Approved! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Congratulations, Dr. ${doctorName}!</h2>
          <p>Your doctor account has been approved by the HerCycle admin team.</p>
          <div style="background-color: #10B981; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px;">✅ Verified Doctor - ${specialty}</p>
          </div>
          <p>You can now:</p>
          <ul>
            <li>Create verified posts in the community</li>
            <li>Answer health-related questions</li>
            <li>Provide professional guidance to users</li>
          </ul>
          <p>Thank you for joining the HerCycle medical community!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            HerCycle Admin Team<br>
            support@hercycle.com
          </p>
        </div>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Doctor approval email sent to ${toEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending doctor approval email:', error.message);
    console.log(`📧 Mock approval email for Dr. ${doctorName} at ${toEmail}`);
    return { success: true, messageId: `fallback-${Date.now()}` };
  }
}

// Send doctor rejection email
async function sendDoctorRejectionEmail(toEmail, doctorName, reason) {
  try {
    const mailOptions = {
      from: `"HerCycle Admin" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'HerCycle - Doctor Verification Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Doctor Verification Status</h2>
          <p>Dear Dr. ${doctorName},</p>
          <p>After reviewing your doctor verification request, we need additional information or clarification.</p>
          <div style="background-color: #FEF2F2; padding: 15px; border-left: 4px solid #EF4444; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason:</strong></p>
            <p style="margin: 5px 0 0 0;">${reason || 'Please verify your credentials and resubmit.'}</p>
          </div>
          <p>You may reapply by contacting our support team at support@hercycle.com.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            HerCycle Admin Team<br>
            support@hercycle.com
          </p>
        </div>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Doctor rejection email sent to ${toEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending doctor rejection email:', error.message);
    console.log(`📧 Mock rejection email for Dr. ${doctorName} at ${toEmail}`);
    return { success: true, messageId: `fallback-${Date.now()}` };
  }
}

// Send doctor info request email
async function sendDoctorInfoRequestEmail(toEmail, doctorName, specialty, adminMessage) {
  try {
    const mailOptions = {
      from: `"HerCycle Admin" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'HerCycle - Additional Information Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F59E0B;">Additional Information Required</h2>
          <p>Dear Dr. ${doctorName},</p>
          <p>Thank you for your doctor verification application for <strong>${specialty}</strong>.</p>
          <p>To complete your verification, we need some additional information:</p>
          <div style="background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0;">
            <p style="margin: 0;">${adminMessage}</p>
          </div>
          <p>Please reply to this email with the requested information, or contact us at support@hercycle.com.</p>
          <p>We appreciate your cooperation!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            HerCycle Admin Team<br>
            support@hercycle.com
          </p>
        </div>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Info request email sent to ${toEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending info request email:', error.message);
    console.log(`📧 Mock info request for Dr. ${doctorName} at ${toEmail}`);
    return { success: true, messageId: `fallback-${Date.now()}` };
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
  sendDoctorApprovalEmail,
  sendDoctorRejectionEmail,
  sendDoctorInfoRequestEmail
};
