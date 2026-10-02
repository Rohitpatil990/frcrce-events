/**
 * Attendance Model
 * Records student presence at events
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
    unique: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  present: {
    type: Boolean,
    default: false
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
attendanceSchema.index({ event: 1, present: 1 });
attendanceSchema.index({ user: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
