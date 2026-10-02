/**
 * Event Routes
 */

const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  getPendingEvents,
  getEventStats
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// Public/Protected routes
router.route('/')
  .get(protect, getAllEvents)
  .post(protect, authorize('faculty'), createEvent);

router.get('/pending/list', protect, authorize('admin'), getPendingEvents);
router.get('/stats', protect, authorize('admin'), getEventStats);

router.route('/:id')
  .get(protect, getEvent)
  .put(protect, authorize('faculty', 'admin'), updateEvent)
  .delete(protect, authorize('faculty', 'admin'), deleteEvent);

router.put('/:id/approve', protect, authorize('admin'), approveEvent);

module.exports = router;
