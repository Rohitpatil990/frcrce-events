/**
 * Certificate Controller
 * Handles certificate generation and management
 */

const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { generateCertificatePDF } = require('../utils/certificateGenerator');
const path = require('path');
const fs = require('fs');

// @desc    Generate certificates for event
// @route   POST /api/certificates/event/:eventId/generate
// @access  Private (Faculty only)
exports.generateCertificates = async (req, res, next) => {
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
        message: 'Not authorized to generate certificates for this event'
      });
    }

    // Get all present students
    const attendanceRecords = await Attendance.find({
      event: event._id,
      present: true
    }).populate({
      path: 'registration',
      populate: {
        path: 'user',
        select: 'name email rollNumber department'
      }
    });

    if (attendanceRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No students marked present for this event'
      });
    }

    const generatedCertificates = [];

    for (const attendance of attendanceRecords) {
      // Check if certificate already exists
      let certificate = await Certificate.findOne({
        registration: attendance.registration._id
      });

      if (certificate) {
        generatedCertificates.push(certificate);
        continue; // Skip if already generated
      }

      // Generate certificate number
      const certNumber = `FRCRCE/${event.type.toUpperCase()}/${new Date().getFullYear()}/${Date.now()}-${attendance.registration._id}`;

      // Generate PDF
      const safeRollNumber = String(attendance.registration.user.rollNumber || 'student').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `certificate_${safeRollNumber}_${event._id}.pdf`;
      const filePath = path.join(process.env.CERTIFICATE_PATH || './public/certificates', fileName);

      await generateCertificatePDF({
        studentName: attendance.registration.user.name,
        eventTitle: event.title,
        eventType: event.type,
        eventDate: event.startDate,
        venue: event.venue,
        certificateNumber: certNumber,
        outputPath: filePath
      });

      certificate = await Certificate.create({
        registration: attendance.registration._id,
        event: event._id,
        user: attendance.registration.user._id,
        certificateUrl: `/certificates/${fileName}`,
        certificateNumber: certNumber,
        generatedBy: req.user.id
      });

      generatedCertificates.push(certificate);
    }

    res.status(200).json({
      success: true,
      message: `${generatedCertificates.length} certificates generated successfully`,
      count: generatedCertificates.length,
      certificates: generatedCertificates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's certificates
// @route   GET /api/certificates/my
// @access  Private (Student only)
exports.getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate('event', 'title type startDate venue')
      .sort('-issueDate');

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Private
exports.getCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('event', 'title type startDate venue')
      .populate('user', 'name email rollNumber department');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check if user owns the certificate (unless admin/faculty)
    if (req.user.role === 'student' && certificate.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this certificate'
      });
    }

    res.status(200).json({
      success: true,
      certificate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download certificate
// @route   GET /api/certificates/:id/download
// @access  Private
exports.downloadCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('user', 'name rollNumber');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check if user owns the certificate (unless admin/faculty)
    if (req.user.role === 'student' && certificate.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this certificate'
      });
    }

    const filePath = path.join(__dirname, '..', '..', 'public', certificate.certificateUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found'
      });
    }

    res.download(filePath, `Certificate_${certificate.user.rollNumber}.pdf`);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:certificateNumber
// @access  Public
exports.verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({
      certificateNumber: req.params.certificateNumber
    })
      .populate('event', 'title type startDate venue')
      .populate('user', 'name rollNumber department');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid certificate number',
        valid: false
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.user.name,
        rollNumber: certificate.user.rollNumber,
        department: certificate.user.department,
        eventTitle: certificate.event.title,
        eventType: certificate.event.type,
        eventDate: certificate.event.startDate,
        issueDate: certificate.issueDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get certificates for event
// @route   GET /api/certificates/event/:eventId
// @access  Private (Faculty/Admin)
exports.getEventCertificates = async (req, res, next) => {
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
        message: 'Not authorized to view certificates for this event'
      });
    }

    const certificates = await Certificate.find({ event: req.params.eventId })
      .populate('user', 'name email rollNumber department')
      .sort('-issueDate');

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    next(error);
  }
};
