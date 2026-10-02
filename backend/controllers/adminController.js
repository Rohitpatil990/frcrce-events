/**
 * Admin Controller
 * Admin-specific operations like user management and analytics
 */

const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;

    let query = {};

    if (role) {
      query.role = role;
    }

    if (department) {
      query.department = department;
    }

    if (typeof search === 'string' && search.trim()) {
      const escapedSearch = escapeRegex(search.trim().slice(0, 100));
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
        { rollNumber: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    let stats = {};

    if (user.role === 'student') {
      const totalRegistrations = await Registration.countDocuments({ user: user._id });
      const totalAttendance = await Attendance.countDocuments({ user: user._id, present: true });
      const totalCertificates = await Certificate.countDocuments({ user: user._id });

      stats = {
        totalRegistrations,
        totalAttendance,
        totalCertificates
      };
    } else if (user.role === 'faculty') {
      const totalEvents = await Event.countDocuments({ createdBy: user._id });
      const approvedEvents = await Event.countDocuments({ createdBy: user._id, status: 'Approved' });

      stats = {
        totalEvents,
        approvedEvents
      };
    }

    res.status(200).json({
      success: true,
      user,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user (Admin)
// @route   POST /api/admin/users
// @access  Private (Admin only)
exports.createUser = async (req, res, next) => {
  try {
    if (typeof req.body.password !== 'string' || req.body.password.length < 12) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 12 characters.'
      });
    }

    const user = await User.create(req.body);
    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow password update through this route
    delete req.body.password;

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate/Activate user
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin only)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private (Admin only)
exports.resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (typeof newPassword !== 'string' || newPassword.length < 12) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least 12 characters.'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Event statistics
    const totalEvents = await Event.countDocuments();
    const pendingEvents = await Event.countDocuments({ status: 'Pending' });
    const approvedEvents = await Event.countDocuments({ status: 'Approved' });
    const completedEvents = await Event.countDocuments({ status: 'Completed' });
    const rejectedEvents = await Event.countDocuments({ status: 'Rejected' });

    // Registration statistics
    const totalRegistrations = await Registration.countDocuments({ status: 'Confirmed' });
    const totalWaitlist = await Registration.countDocuments({ status: 'Waitlist' });

    // Attendance and certificates
    const totalAttendance = await Attendance.countDocuments({ present: true });
    const totalCertificates = await Certificate.countDocuments();

    // Recent events
    const recentEvents = await Event.find()
      .populate('createdBy', 'name department')
      .sort('-createdAt')
      .limit(5);

    // Events by type
    const eventsByType = await Event.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Events by status
    const eventsByStatus = await Event.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Top participating students
    const topStudents = await Registration.aggregate([
      { $match: { status: 'Confirmed' } },
      { $group: { _id: '$user', eventCount: { $sum: 1 } } },
      { $sort: { eventCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $project: {
          name: '$studentInfo.name',
          rollNumber: '$studentInfo.rollNumber',
          department: '$studentInfo.department',
          eventCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          faculty: totalFaculty,
          admins: totalAdmins
        },
        events: {
          total: totalEvents,
          pending: pendingEvents,
          approved: approvedEvents,
          completed: completedEvents,
          rejected: rejectedEvents
        },
        registrations: {
          total: totalRegistrations,
          waitlist: totalWaitlist
        },
        attendance: totalAttendance,
        certificates: totalCertificates,
        eventsByType,
        eventsByStatus,
        recentEvents,
        topStudents
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
exports.getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Events created over time
    const eventsOverTime = await Event.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Department-wise participation
    const departmentStats = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $lookup: {
          from: 'registrations',
          localField: '_id',
          foreignField: 'user',
          as: 'registrations'
        }
      },
      {
        $group: {
          _id: '$department',
          studentCount: { $sum: 1 },
          totalRegistrations: { $sum: { $size: '$registrations' } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        eventsOverTime,
        departmentStats
      }
    });
  } catch (error) {
    next(error);
  }
};
