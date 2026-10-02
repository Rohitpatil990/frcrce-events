/**
 * Registration Model
 * Links users to events
 */

const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Waitlist', 'Cancelled'],
    default: 'Confirmed'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
