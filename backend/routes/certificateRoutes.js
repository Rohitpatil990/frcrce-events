/**
 * Certificate Routes
 */

const express = require('express');
const router = express.Router();
const {
  generateCertificates,
  getMyCertificates,
  getCertificate,
  downloadCertificate,
  verifyCertificate,
  getEventCertificates
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, authorize('student'), getMyCertificates);
router.get('/event/:eventId', protect, authorize('faculty', 'admin'), getEventCertificates);
router.post('/event/:eventId/generate', protect, authorize('faculty', 'admin'), generateCertificates);
router.get('/verify/:certificateNumber', verifyCertificate); // Public route
router.get('/:id', protect, getCertificate);
router.get('/:id/download', protect, downloadCertificate);

module.exports = router;
