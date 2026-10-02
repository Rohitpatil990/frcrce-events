/**
 * Attendance Controller
 * Handles attendance marking and tracking
 */

const Attendance = require('../models/Attendance');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Mark attendance for event
// @route   POST /api/attendance/event/:eventId
// @access  Private (Faculty only)
exports.markAttendance = async (req, res, next) => {
  try {
    const { attendanceData } = req.body; // Array of {registrationId, present}
    if (!Array.isArray(attendanceData) || attendanceData.some((item) =>
      !item || typeof item.registrationId !== 'string' || typeof item.present !== 'boolean'
    )) {
      return res.status(400).json({
        success: false,
        message: 'Attendance data must be an array of registration IDs and boolean present values.'
      });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if faculty owns the event
    if (req.user.role === 'faculty' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark attendance for this event'
      });
    }

    const attendanceRecords = [];

    for (const item of attendanceData) {
      const registration = await Registration.findById(item.registrationId);

      if (!registration || registration.event.toString() !== event._id.toString()) {
        continue; // Skip invalid registrations
      }

      // Check if attendance already exists
      let attendance = await Attendance.findOne({ registration: registration._id });

      if (attendance) {
        // Update existing attendance
        attendance.present = item.present;
        attendance.markedBy = req.user.id;
        attendance.markedAt = Date.now();
        attendance.remarks = item.remarks || '';
        await attendance.save();
      } else {
        // Create new attendance record
        attendance = await Attendance.create({
          registration: registration._id,
          event: event._id,
          user: registration.user,
          present: item.present,
          markedBy: req.user.id,
          remarks: item.remarks || ''
        });
      }

      attendanceRecords.push(attendance);
    }

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      count: attendanceRecords.length,
      attendanceRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for event
// @route   GET /api/attendance/event/:eventId
// @access  Private (Faculty/Admin)
exports.getEventAttendance = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if faculty owns the event
    if (req.user.role === 'faculty' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view attendance for this event'
      });
    }

    const attendanceRecords = await Attendance.find({ event: req.params.eventId })
      .populate({
        path: 'registration',
        populate: {
          path: 'user',
          select: 'name email rollNumber department year'
        }
      })
      .populate('markedBy', 'name');

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      attendanceRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's attendance records
// @route   GET /api/attendance/my
// @access  Private (Student only)
exports.getMyAttendance = async (req, res, next) => {
  try {
    const attendanceRecords = await Attendance.find({ user: req.user.id })
      .populate('event', 'title type startDate venue')
      .sort('-markedAt');

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      attendanceRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance statistics for event
// @route   GET /api/attendance/event/:eventId/stats
// @access  Private (Faculty/Admin)
exports.getAttendanceStats = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const totalRegistrations = await Registration.countDocuments({
      event: req.params.eventId,
      status: 'Confirmed'
    });

    const totalPresent = await Attendance.countDocuments({
      event: req.params.eventId,
      present: true
    });

    const totalAbsent = await Attendance.countDocuments({
      event: req.params.eventId,
      present: false
    });

    const attendanceMarked = totalPresent + totalAbsent;
    const attendancePending = totalRegistrations - attendanceMarked;
    const attendancePercentage = totalRegistrations > 0 
      ? ((totalPresent / totalRegistrations) * 100).toFixed(2) 
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalRegistrations,
        attendanceMarked,
        attendancePending,
        totalPresent,
        totalAbsent,
        attendancePercentage: parseFloat(attendancePercentage)
      }
    });
  } catch (error) {
    next(error);
  }
};
