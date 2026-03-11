const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  stallName: {
    type: String,
    required: true,
    trim: true
  },
  stallType: {
    type: String,
    required: true,
    enum: ['Food Stall', 'General / Shopping Stall', 'Handicraft Stall', 'Beverage Stall', 'Other']
  },
  numberOfStalls: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  specialRequirements: {
    type: String,
    trim: true,
    default: ''
  },
  targetSaturday: {
    type: Date,
    required: true
  },
  weekNumber: {
    type: Number
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Not Approved'],
    default: 'Pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

BookingSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('Booking', BookingSchema);
