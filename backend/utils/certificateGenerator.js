/**
 * Certificate Generator Utility
 * Generates PDF certificates using PDFKit
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a certificate PDF
 * @param {Object} data - Certificate data
 * @param {string} data.studentName - Name of the student
 * @param {string} data.eventTitle - Title of the event
 * @param {string} data.eventType - Type of event
 * @param {Date} data.eventDate - Date of the event
 * @param {string} data.venue - Venue of the event
 * @param {string} data.certificateNumber - Unique certificate number
 * @param {string} data.outputPath - Path to save the PDF
 */
async function generateCertificatePDF(data) {
  return new Promise((resolve, reject) => {
    try {
      // Ensure certificate directory exists
      const certDir = path.dirname(data.outputPath);
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }

      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      // Pipe the PDF to a file
      const stream = fs.createWriteStream(data.outputPath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // Draw border
      doc.lineWidth(10)
         .rect(20, 20, pageWidth - 40, pageHeight - 40)
         .stroke('#1e3a8a');

      doc.lineWidth(3)
         .rect(30, 30, pageWidth - 60, pageHeight - 60)
         .stroke('#3b82f6');

      // Add decorative corner elements
      const cornerSize = 40;
      doc.lineWidth(2);
      
      // Top-left corner
      doc.moveTo(40, 80).lineTo(40, 40).lineTo(80, 40).stroke('#fbbf24');
      
      // Top-right corner
      doc.moveTo(pageWidth - 80, 40).lineTo(pageWidth - 40, 40).lineTo(pageWidth - 40, 80).stroke('#fbbf24');
      
      // Bottom-left corner
      doc.moveTo(40, pageHeight - 80).lineTo(40, pageHeight - 40).lineTo(80, pageHeight - 40).stroke('#fbbf24');
      
      // Bottom-right corner
      doc.moveTo(pageWidth - 80, pageHeight - 40).lineTo(pageWidth - 40, pageHeight - 40).lineTo(pageWidth - 40, pageHeight - 80).stroke('#fbbf24');

      // College Logo Area (Text placeholder)
      doc.fontSize(16)
         .fillColor('#1e3a8a')
         .font('Helvetica-Bold')
         .text('FRCRCE', 0, 70, { align: 'center' });

      // College Name
      doc.fontSize(20)
         .fillColor('#1e40af')
         .font('Helvetica-Bold')
         .text('Fr. Conceicao Rodrigues College of Engineering', 0, 100, { align: 'center' });

      doc.fontSize(12)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('Bandra, Mumbai - 400050', 0, 125, { align: 'center' });

      // Certificate Title
      doc.fontSize(40)
         .fillColor('#1e3a8a')
         .font('Helvetica-Bold')
         .text('CERTIFICATE', 0, 180, { align: 'center' });

      doc.fontSize(16)
         .fillColor('#6b7280')
         .font('Helvetica-Oblique')
         .text('OF PARTICIPATION', 0, 230, { align: 'center' });

      // Divider line
      doc.moveTo(pageWidth / 2 - 100, 260)
         .lineTo(pageWidth / 2 + 100, 260)
         .strokeColor('#fbbf24')
         .lineWidth(2)
         .stroke();

      // Certificate body
      doc.fontSize(14)
         .fillColor('#374151')
         .font('Helvetica')
         .text('This is to certify that', 0, 290, { align: 'center' });

      // Student Name
      doc.fontSize(28)
         .fillColor('#1e3a8a')
         .font('Helvetica-Bold')
         .text(data.studentName.toUpperCase(), 0, 320, { align: 'center' });

      // Name underline
      const nameWidth = doc.widthOfString(data.studentName.toUpperCase());
      const nameX = (pageWidth - nameWidth) / 2;
      doc.moveTo(nameX, 355)
         .lineTo(nameX + nameWidth, 355)
         .strokeColor('#3b82f6')
         .lineWidth(1)
         .stroke();

      // Participation text
      doc.fontSize(14)
         .fillColor('#374151')
         .font('Helvetica')
         .text(`has successfully participated in the ${data.eventType}`, 0, 375, { align: 'center' });

      // Event Title
      doc.fontSize(20)
         .fillColor('#1e40af')
         .font('Helvetica-Bold')
         .text(`"${data.eventTitle}"`, 0, 405, { align: 'center', width: pageWidth });

      // Event details
      const eventDateStr = new Date(data.eventDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fontSize(12)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text(`held on ${eventDateStr} at ${data.venue}`, 0, 445, { align: 'center' });

      // Issue date and certificate number
      const issueDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fontSize(10)
         .fillColor('#9ca3af')
         .font('Helvetica')
         .text(`Certificate No: ${data.certificateNumber}`, 60, pageHeight - 100);

      doc.text(`Issue Date: ${issueDate}`, 60, pageHeight - 85);

      // Signature sections
      const signatureY = pageHeight - 120;
      
      // Faculty Signature
      doc.fontSize(10)
         .fillColor('#374151')
         .font('Helvetica-Bold')
         .text('____________________', 150, signatureY);
      
      doc.fontSize(9)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('Event Coordinator', 165, signatureY + 20);

      // HOD Signature
      doc.fontSize(10)
         .fillColor('#374151')
         .font('Helvetica-Bold')
         .text('____________________', pageWidth / 2 - 50, signatureY);
      
      doc.fontSize(9)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('Head of Department', pageWidth / 2 - 35, signatureY + 20);

      // Principal Signature
      doc.fontSize(10)
         .fillColor('#374151')
         .font('Helvetica-Bold')
         .text('____________________', pageWidth - 270, signatureY);
      
      doc.fontSize(9)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('Principal', pageWidth - 235, signatureY + 20);

      // Footer
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .font('Helvetica-Oblique')
         .text('This is a computer-generated certificate and does not require a physical signature', 0, pageHeight - 40, {
           align: 'center',
           width: pageWidth
         });

      // Finalize the PDF
      doc.end();

      stream.on('finish', () => {
        resolve(data.outputPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateCertificatePDF
};
