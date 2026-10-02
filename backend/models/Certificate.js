/**
 * Certificate Model
 * Stores certificate metadata and download URLs
 */

const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
  certificateUrl: {
    type: String,
    required: true
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
certificateSchema.index({ user: 1 });
certificateSchema.index({ event: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
