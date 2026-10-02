/**
 * Event Model
 * Stores event details and metadata
 */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please provide event type'],
    enum: ['Workshop', 'FDP', 'Seminar', 'Technical', 'Cultural', 'Sports', 'Other']
  },
  description: {
    type: String,
    required: [true, 'Please provide event description']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please provide end time']
  },
  venue: {
    type: String,
    required: [true, 'Please provide venue']
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide capacity'],
    min: 1
  },
  currentRegistrations: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eligibility: {
    allStudents: {
      type: Boolean,
      default: true
    },
    specificYears: [{
      type: Number,
      min: 1,
      max: 4
    }],
    departments: [String],
    facultyOnly: {
      type: Boolean,
      default: false
    }
  },
  prerequisites: {
    type: String,
    default: 'None'
  },
  resourcePerson: {
    type: String
  },
  registrationDeadline: {
    type: Date
  },
  adminRemarks: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Event', eventSchema);
