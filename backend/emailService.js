const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send welcome email to new client
async function sendWelcomeEmail(email, fullName, password) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to AMI-GROUP</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f0f2f5;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AMI-GROUP</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Client Portal Access</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 10px 0;">Welcome, ${fullName}! 🎉</h2>
          <p style="color: #475569; line-height: 1.6;">Your client portal account has been successfully created.</p>
          
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e293b;">🔐 Login Credentials</h3>
            <p><strong>Portal URL:</strong> <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #667eea;">${process.env.FRONTEND_URL || 'http://localhost:3000'}</a></p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
          </div>
          
          <p style="color: #ef4444; font-size: 13px;">⚠️ Please change your password after first login.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
          
          <p style="color: #64748b; font-size: 12px; text-align: center;">© 2026 AMI-GROUP. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"AMI-GROUP Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎉 Welcome to AMI-GROUP Client Portal`,
      html,
    });
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    return false;
  }
}

// Send credentials email (resend)
async function sendCredentialsEmail(email, fullName, password) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Login Credentials - AMI-GROUP</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f0f2f5;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AMI-GROUP</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Your Login Credentials</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1e293b; margin: 0 0 10px 0;">Hello ${fullName},</h2>
          <p style="color: #475569;">Here are your portal login credentials:</p>
          
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <p><strong>Portal URL:</strong> <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #667eea;">${process.env.FRONTEND_URL || 'http://localhost:3000'}</a></p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
          
          <p style="color: #64748b; font-size: 12px; text-align: center;">© 2026 AMI-GROUP</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"AMI-GROUP Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🔐 Your AMI-GROUP Portal Login Credentials`,
      html,
    });
    console.log(`✅ Credentials email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    return false;
  }
}

module.exports = { sendWelcomeEmail, sendCredentialsEmail };