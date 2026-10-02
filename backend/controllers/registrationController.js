/**
 * Registration Controller
 * Handles student event registrations
 */

const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Register for event
// @route   POST /api/registrations/:eventId
// @access  Private (Student only)
exports.registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is approved
    if (event.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Event is not open for registration'
      });
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      user: req.user.id,
      event: event._id
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check eligibility
    if (req.user.role === 'student') {
      if (event.eligibility.facultyOnly) {
        return res.status(403).json({
          success: false,
          message: 'This event is for faculty only'
        });
      }

      if (!event.eligibility.allStudents) {
        // Check year eligibility
        if (event.eligibility.specificYears.length > 0 && 
            !event.eligibility.specificYears.includes(req.user.year)) {
          return res.status(403).json({
            success: false,
            message: 'You are not eligible for this event based on year criteria'
          });
        }

        // Check department eligibility
        if (event.eligibility.departments.length > 0 && 
            !event.eligibility.departments.includes(req.user.department)) {
          return res.status(403).json({
            success: false,
            message: 'You are not eligible for this event based on department criteria'
          });
        }
      }
    }

    // Check seat availability
    let registrationStatus = 'Confirmed';
    if (event.currentRegistrations >= event.capacity) {
      registrationStatus = 'Waitlist';
    }

    // Create registration
    const registration = await Registration.create({
      user: req.user.id,
      event: event._id,
      status: registrationStatus
    });

    // Update event registration count
    if (registrationStatus === 'Confirmed') {
      event.currentRegistrations += 1;
      await event.save();
    }

    // Populate user details for response
    await registration.populate('user', 'name email rollNumber department year');
    await registration.populate('event', 'title type startDate venue');

    res.status(201).json({
      success: true,
      message: registrationStatus === 'Confirmed' 
        ? 'Registration successful' 
        : 'Added to waitlist',
      registration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Private (Student only)
exports.cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check ownership
    if (registration.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this registration'
      });
    }

    const event = await Event.findById(registration.event);

    // Update event registration count if confirmed
    if (registration.status === 'Confirmed') {
      event.currentRegistrations = Math.max(0, event.currentRegistrations - 1);
      await event.save();

      // Check waitlist and promote first person
      const waitlistRegistration = await Registration.findOne({
        event: event._id,
        status: 'Waitlist'
      }).sort('registeredAt');

      if (waitlistRegistration) {
        waitlistRegistration.status = 'Confirmed';
        await waitlistRegistration.save();
        event.currentRegistrations += 1;
        await event.save();
      }
    }

    registration.status = 'Cancelled';
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's registrations
// @route   GET /api/registrations/my
// @access  Private (Student only)
exports.getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ 
      user: req.user.id,
      status: { $ne: 'Cancelled' }
    })
      .populate('event', 'title type startDate endDate venue status')
      .sort('-registeredAt');

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get registrations for an event (Faculty)
// @route   GET /api/registrations/event/:eventId
// @access  Private (Faculty/Admin)
exports.getEventRegistrations = async (req, res, next) => {
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
        message: 'Not authorized to view registrations for this event'
      });
    }

    const registrations = await Registration.find({ 
      event: req.params.eventId,
      status: { $ne: 'Cancelled' }
    })
      .populate('user', 'name email rollNumber department year phone')
      .sort('user.rollNumber');

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback for event
// @route   POST /api/registrations/:id/feedback
// @access  Private (Student only)
exports.submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check ownership
    if (registration.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit feedback for this registration'
      });
    }

    registration.feedback = {
      rating,
      comment,
      submittedAt: Date.now()
    };

    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      registration
    });
  } catch (error) {
    next(error);
  }
};
