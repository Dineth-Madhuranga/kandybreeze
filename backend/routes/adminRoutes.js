const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'kandy-breeze-secret';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function getApprovalEmailTemplate(booking) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Approved - Kandy Breeze</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', Arial, sans-serif; background-color: #0D1B2A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D1B2A;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #162840; border-radius: 12px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background: linear-gradient(135deg, #2ECC71, #27AE60); padding: 30px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px;">Kandy Breeze</h1>
              <p style="color: #FFF8EE; margin: 10px 0 0 0; font-size: 14px;">Booking Approved!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="color: #FFF8EE; font-size: 16px; line-height: 1.6;">Dear ${booking.fullName},</p>
              
              <p style="color: #FFF8EE; font-size: 16px; line-height: 1.6;">Congratulations! Your stall <strong style="color: #2ECC71;">${booking.stallName}</strong> has been <strong style="color: #2ECC71;">approved</strong> for Kandy Breeze on <strong style="color: #2ECC71;">${formatDate(new Date(booking.targetSaturday))}</strong>.</p>
              
              <div style="background-color: rgba(46,204,113,0.1); border-left: 4px solid #2ECC71; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #FFF8EE; margin: 0; font-size: 14px;"><strong>Important:</strong> Please arrive by 5:30 PM for setup. Gates open to the public at 7:00 PM.</p>
              </div>
              
              <p style="color: #8A9BB0; font-size: 14px; line-height: 1.6;">We look forward to seeing you there!</p>
              
              <p style="color: #FFF8EE; font-size: 16px; line-height: 1.6; margin-top: 30px;">Warm regards,<br><strong style="color: #2ECC71;">The Kandy Breeze Team</strong></p>
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

function getRejectionEmailTemplate(booking) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Update - Kandy Breeze</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', Arial, sans-serif; background-color: #0D1B2A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D1B2A;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #162840; border-radius: 12px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background: linear-gradient(135deg, #E74C3C, #C0392B); padding: 30px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px;">Kandy Breeze</h1>
              <p style="color: #FFF8EE; margin: 10px 0 0 0; font-size: 14px;">Booking Update</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="color: #FFF8EE; font-size: 16px; line-height: 1.6;">Dear ${booking.fullName},</p>
              
              <p style="color: #FFF8EE; font-size: 16px; line-height: 1.6;">Unfortunately, we couldn't accommodate your stall <strong style="color: #E74C3C;">${booking.stallName}</strong> for this week's event.</p>
              
              <div style="background-color: rgba(231,76,60,0.1); border-left: 4px solid #E74C3C; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #FFF8EE; margin: 0; font-size: 14px;">Please try again next Sunday when bookings reopen. We appreciate your interest in Kandy Breeze!</p>
              </div>
              
              <p style="color: #FFF8EE; font-size: 16px; line-height: 1.6; margin-top: 30px;">Warm regards,<br><strong style="color: #E74C3C;">The Kandy Breeze Team</strong></p>
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

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'MediaAsia' && password === 'Mediaasia@55') {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '1d' });
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('kb_token', token, {
      httpOnly: true,
      secure: isProduction,
      maxAge: 86400000,
      sameSite: isProduction ? 'none' : 'lax'
    });

    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

router.post('/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('kb_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  res.json({ success: true });
});

router.get('/check-auth', authMiddleware, (req, res) => {
  res.json({ authenticated: true });
});

router.get('/bookings', authMiddleware, async (req, res) => {
  try {
    const { status, week, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (week) filter.weekNumber = parseInt(week);

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      bookings,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const currentWeekNum = Math.ceil((((now - new Date(Date.UTC(now.getFullYear(), 0, 1))) / 86400000) + 1) / 7);

    const stats = {
      total: await Booking.countDocuments(),
      pending: await Booking.countDocuments({ status: 'Pending' }),
      approved: await Booking.countDocuments({ status: 'Approved' }),
      notApproved: await Booking.countDocuments({ status: 'Not Approved' }),
      thisWeek: await Booking.countDocuments({ weekNumber: currentWeekNum })
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/bookings/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Not Approved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (status === 'Approved') {
      await transporter.sendMail({
        from: `"Kandy Breeze" <${process.env.EMAIL_USER}>`,
        to: booking.email,
        subject: '🎉 Your Kandy Breeze Stall is Approved!',
        html: getApprovalEmailTemplate(booking)
      });
    } else {
      await transporter.sendMail({
        from: `"Kandy Breeze" <${process.env.EMAIL_USER}>`,
        to: booking.email,
        subject: 'Kandy Breeze Booking Update',
        html: getRejectionEmailTemplate(booking)
      });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
