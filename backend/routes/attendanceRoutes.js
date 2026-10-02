/**
 * Attendance Routes
 */

const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getEventAttendance,
  getMyAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, authorize('student'), getMyAttendance);
router.get('/event/:eventId', protect, authorize('faculty', 'admin'), getEventAttendance);
router.get('/event/:eventId/stats', protect, authorize('faculty', 'admin'), getAttendanceStats);
router.post('/event/:eventId', protect, authorize('faculty', 'admin'), markAttendance);

module.exports = router;
