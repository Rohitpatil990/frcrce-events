/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  getDashboardStats,
  getAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are admin-only
router.use(protect);
router.use(authorize('admin'));

router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser);

router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/users/:id/reset-password', resetUserPassword);
router.get('/dashboard-stats', getDashboardStats);
router.get('/analytics', getAnalytics);

module.exports = router;
