const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function getSriLankaDate() {
  const now = new Date();
  const sriLankaTime = now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
  return new Date(sriLankaTime);
}

function getNextSaturday(fromDate) {
  const date = new Date(fromDate);
  const day = date.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntilSaturday);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function getAdminEmailTemplate(booking) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking - Kandy Breeze</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', Arial, sans-serif; background-color: #0D1B2A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D1B2A;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #162840; border-radius: 12px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background: linear-gradient(135deg, #F5A623, #FF5F40); padding: 30px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px;">Kandy Breeze</h1>
              <p style="color: #FFF8EE; margin: 10px 0 0 0; font-size: 14px;">New Stall Booking Received</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #F5A623; margin: 0 0 20px 0; font-size: 20px;">Booking Details</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="color: #FFF8EE;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2); width: 40%;"><strong>Full Name:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);">${booking.fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);"><strong>Email:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);">${booking.email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);"><strong>Phone:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);">${booking.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);"><strong>Stall Name:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);">${booking.stallName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);"><strong>Stall Type:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);">${booking.stallType}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);"><strong>Number of Stalls:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);">${booking.numberOfStalls}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);"><strong>Target Date:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(245,166,35,0.2);">${formatDate(new Date(booking.targetSaturday))}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Special Requirements:</strong></td>
                  <td style="padding: 10px 0;">${booking.specialRequirements || 'None'}</td>
                </tr>
              </table>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #F5A623, #FF5F40); color: #FFFFFF; text-decoration: none; padding: 15px 30px; border-radius: 999px; font-weight: 600;">View Dashboard</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0D1B2A; padding: 20px; text-align: center; color: #8A9BB0; font-size: 12px;">
              <p style="margin: 0;">&copy; 2025 Kandy Breeze &middot; Kandy, Sri Lanka</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getUserEmailTemplate(booking) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Received - Kandy Breeze</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', Arial, sans-serif; background-color: #0D1B2A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D1B2A;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #162840; border-radius: 12px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background: linear-gradient(135deg, #F5A623, #FF5F40); padding: 30px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px;">Kandy Breeze</h1>
              <p style="color: #FFF8EE; margin: 10px 0 0 0; font-size: 14px;">Booking Request Received</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="color: #FFF8EE; font-size: 16px; line-height: 1.6;">Dear ${booking.fullName},</p>
              
              <p style="color: #FFF8EE; font-size: 16px; line-height: 1.6;">We've received your booking request for <strong style="color: #F5A623;">${booking.stallName}</strong> (${booking.stallType}) at Kandy Breeze on <strong style="color: #F5A623;">${formatDate(new Date(booking.targetSaturday))}</strong>.</p>
              
              <div style="background-color: rgba(245,166,35,0.1); border-left: 4px solid #F5A623; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #FFF8EE; margin: 0; font-size: 14px;">Our team will review your application and contact you as soon as possible. Bookings are subject to approval by our team.</p>
              </div>
              
              <p style="color: #8A9BB0; font-size: 14px; line-height: 1.6;">If you have any questions, please don't hesitate to contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #F5A623; text-decoration: none;">${process.env.EMAIL_USER}</a></p>
              
              <p style="color: #FFF8EE; font-size: 16px; line-height: 1.6; margin-top: 30px;">Warm regards,<br><strong style="color: #F5A623;">The Kandy Breeze Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0D1B2A; padding: 20px; text-align: center; color: #8A9BB0; font-size: 12px;">
              <p style="margin: 0;">&copy; 2025 Kandy Breeze &middot; Kandy, Sri Lanka</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

router.post('/', async (req, res) => {
  try {
    const sriLankaDate = getSriLankaDate();

    const targetSaturday = getNextSaturday(sriLankaDate);
    const weekNumber = getISOWeekNumber(targetSaturday);

    const { fullName, email, phone, stallName, stallType, numberOfStalls, specialRequirements } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Full name is required (min 2 characters)' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    if (!phone || phone.trim().length < 9) {
      return res.status(400).json({ success: false, message: 'Phone number is required (min 9 digits)' });
    }
    if (!stallName || stallName.trim().length < 1) {
      return res.status(400).json({ success: false, message: 'Stall name is required' });
    }
    if (!stallType) {
      return res.status(400).json({ success: false, message: 'Stall type is required' });
    }

    const booking = new Booking({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      stallName: stallName.trim(),
      stallType,
      numberOfStalls: numberOfStalls || 1,
      specialRequirements: specialRequirements || '',
      targetSaturday,
      weekNumber
    });

    await booking.save();

    await transporter.sendMail({
      from: `"Kandy Breeze" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '🎪 New Stall Booking — Kandy Breeze',
      html: getAdminEmailTemplate(booking)
    });

    await transporter.sendMail({
      from: `"Kandy Breeze" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: '✅ Your Kandy Breeze Booking Request Received',
      html: getUserEmailTemplate(booking)
    });

    res.status(200).json({
      success: true,
      message: 'Booking submitted successfully!'
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;
