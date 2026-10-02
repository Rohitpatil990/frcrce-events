/**
 * Event Controller
 * Handles event CRUD operations and approval workflow
 */

const Event = require('../models/Event');
const Registration = require('../models/Registration');

const eventFields = [
  'title',
  'type',
  'description',
  'startDate',
  'endDate',
  'startTime',
  'endTime',
  'venue',
  'capacity',
  'eligibility',
  'prerequisites',
  'resourcePerson',
  'registrationDeadline'
];

const pickEventFields = (body) => Object.fromEntries(
  eventFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]])
);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Create new event (Faculty)
// @route   POST /api/events
// @access  Private (Faculty only)
exports.createEvent = async (req, res, next) => {
  try {
    // Add createdBy field
    const event = await Event.create({
      ...pickEventFields(req.body),
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully and sent for approval',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
exports.getAllEvents = async (req, res, next) => {
  try {
    let query = {};

    // Role-based filtering
    if (req.user.role === 'faculty') {
      // Faculty sees their own events
      query.createdBy = req.user.id;
    } else if (req.user.role === 'student') {
      // Students see only approved events
      query.status = 'Approved';
    }

    // Apply filters from query params
    if (req.user.role !== 'student' && typeof req.query.status === 'string') {
      query.status = req.query.status;
    }

    if (typeof req.query.type === 'string') {
      query.type = req.query.type;
    }

    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const search = escapeRegex(req.query.search.trim().slice(0, 100));
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email department')
      .populate('approvedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email department phone')
      .populate('approvedBy', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (req.user.role === 'student' && event.status !== 'Approved') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (req.user.role === 'faculty' && event.createdBy?._id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this event'
      });
    }

    // Check if user is registered (for students)
    let isRegistered = false;
    if (req.user.role === 'student') {
      const registration = await Registration.findOne({
        user: req.user.id,
        event: event._id
      });
      isRegistered = !!registration;
    }

    res.status(200).json({
      success: true,
      event,
      isRegistered
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event (Faculty - only pending events)
// @route   PUT /api/events/:id
// @access  Private (Faculty only)
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // Only pending events can be edited by faculty
    if (event.status !== 'Pending' && req.user.role === 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit event after approval/rejection'
      });
    }

    Object.assign(event, pickEventFields(req.body));
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Faculty/Admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    // Only pending events can be deleted
    if (event.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete approved/completed events'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject event (Admin)
// @route   PUT /api/events/:id/approve
// @access  Private (Admin only)
exports.approveEvent = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Approved or Rejected'
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Event has already been processed'
      });
    }

    event.status = status;
    event.adminRemarks = adminRemarks || '';
    event.approvedBy = req.user.id;
    event.approvedAt = Date.now();

    await event.save();

    res.status(200).json({
      success: true,
      message: `Event ${status.toLowerCase()} successfully`,
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events pending approval (Admin)
// @route   GET /api/events/pending/list
// @access  Private (Admin only)
exports.getPendingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'Pending' })
      .populate('createdBy', 'name email department')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event statistics (Admin)
// @route   GET /api/events/stats
// @access  Private (Admin only)
exports.getEventStats = async (req, res, next) => {
  try {
    const totalEvents = await Event.countDocuments();
    const pendingEvents = await Event.countDocuments({ status: 'Pending' });
    const approvedEvents = await Event.countDocuments({ status: 'Approved' });
    const completedEvents = await Event.countDocuments({ status: 'Completed' });
    const totalRegistrations = await Registration.countDocuments();

    // Events by type
    const eventsByType = await Event.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        pendingEvents,
        approvedEvents,
        completedEvents,
        totalRegistrations,
        eventsByType
      }
    });
  } catch (error) {
    next(error);
  }
};
