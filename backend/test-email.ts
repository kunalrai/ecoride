import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

async function testEmailSending() {
  console.log('Testing Email Configuration...\n');
  console.log('SMTP Host:', process.env.SMTP_HOST);
  console.log('SMTP Port:', process.env.SMTP_PORT);
  console.log('SMTP User:', process.env.SMTP_USER);
  console.log('SMTP Pass:', process.env.SMTP_PASS ? '***configured***' : 'NOT SET');
  console.log('\n');

  // Create transporter
  const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Verify connection
    console.log('Verifying SMTP connection...');
    await emailTransporter.verify();
    console.log('✓ SMTP connection verified successfully!\n');

    // Generate test OTP
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const testEmail = process.env.SMTP_USER; // Send to self for testing
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');

    console.log('Sending test email...');
    console.log('To:', testEmail);
    console.log('OTP:', testOTP);
    console.log('\n');

    // Send test email
    const info = await emailTransporter.sendMail({
      from: process.env.SMTP_USER,
      to: testEmail,
      subject: 'EcoRide - Email Verification OTP (TEST)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Email Verification Test</h2>
          <p>This is a test email to verify the email sending functionality.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
            <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px;">${testOTP}</p>
          </div>
          <p style="color: #666; font-size: 14px;">Valid for ${expiryMinutes} minutes.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated test email from EcoRide.</p>
        </div>
      `,
    });

    console.log('✓ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nPlease check your inbox at:', testEmail);
    console.log('\n==========================================');
    console.log('EMAIL SENDING TEST: PASSED ✓');
    console.log('==========================================\n');
  } catch (error: any) {
    console.error('\n✗ Email sending failed!');
    console.error('Error:', error.message);
    console.log('\n==========================================');
    console.log('EMAIL SENDING TEST: FAILED ✗');
    console.log('==========================================\n');

    if (error.code === 'EAUTH') {
      console.log('\nTroubleshooting:');
      console.log('1. Check if SMTP credentials are correct');
      console.log('2. For Gmail, you need to use an App Password, not your regular password');
      console.log('3. Enable "Less secure app access" or use 2FA with App Password');
      console.log('4. Visit: https://myaccount.google.com/apppasswords');
    }
    process.exit(1);
  }
}

testEmailSending();
