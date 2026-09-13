const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Resend } = require('resend');

const app = express();
app.use(bodyParser.json());

// Serve frontend static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Resend API Key
const resend = new Resend('key');

// In-memory OTP store
const otpStore = {};

// 1. ENDPOINT: Send 6-Digit Email OTP
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Generate random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with 5-minute expiry
  otpStore[email] = {
    otp: otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  };

  try {
    const data = await resend.emails.send({
      from: 'Upchar Support <onboarding@resend.dev>',
      to: [email],
      subject: 'Your UPCHAR Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #153940;">
          <h2>Welcome to UPCHAR</h2>
          <p>Your 6-digit verification code is:</p>
          <h1 style="color: #0d8a8a; letter-spacing: 4px;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `
    });

    if (data.error) {
      console.error('Resend API Error:', data.error);
      return res.status(400).json({ success: false, message: data.error.message });
    }

    res.json({ success: true, message: 'OTP sent successfully to ' + email });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email OTP: ' + error.message });
  }
});

// 2. ENDPOINT: Verify 6-Digit OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ success: false, message: 'No OTP requested for this email' });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: 'OTP code expired. Please request a new one.' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP code. Please try again.' });
  }

  delete otpStore[email];
  res.json({ success: true, message: 'OTP verified successfully!' });
});

// Fallback to serve index.html for non-API route requests
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});