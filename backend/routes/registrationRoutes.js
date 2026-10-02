/**
 * Registration Routes
 */

const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  submitFeedback
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, authorize('student'), getMyRegistrations);
router.get('/event/:eventId', protect, authorize('faculty', 'admin'), getEventRegistrations);
router.post('/:eventId', protect, authorize('student'), registerForEvent);
router.delete('/:id', protect, authorize('student'), cancelRegistration);
router.post('/:id/feedback', protect, authorize('student'), submitFeedback);

module.exports = router;
