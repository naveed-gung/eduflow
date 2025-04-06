const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF certificate for a course completion
 * @param {Object} options - Certificate options
 * @param {string} options.userName - User's full name
 * @param {string} options.courseName - Course name
 * @param {string} options.certificateId - Unique certificate ID
 * @param {Date} options.issueDate - Issue date
 * @param {string} options.outputPath - Path to save the PDF
 * @returns {Promise<string>} - Path to the generated PDF
 */
exports.generateCertificate = (options) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        userName,
        courseName,
        certificateId,
        issueDate,
        outputPath
      } = options;
      
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Format date
      const formattedDate = new Date(issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Create PDF document (landscape orientation)
      const doc = new PDFDocument({ 
        size: 'A4', 
        layout: 'landscape',
        margin: 50
      });
      
      // Pipe output to file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Add background color
      doc.rect(0, 0, doc.page.width, doc.page.height)
        .fill('#f9f9fa');
      
      // Add decorative border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(3)
        .strokeColor('#4361ee');
      
      // Add inner decorative border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(1)
        .strokeColor('#4361ee')
        .stroke();
      
      // Add certificate header
      doc.font('Helvetica-Bold')
        .fontSize(32)
        .fillColor('#333333')
        .text('CERTIFICATE OF COMPLETION', { align: 'center' })
        .moveDown(0.5);
      
      // Add EduFlow logo placeholder
      doc.font('Helvetica')
        .fontSize(20)
        .fillColor('#4361ee')
        .text('EduFlow', { align: 'center' })
        .fontSize(14)
        .fillColor('#777777')
        .text('Lebanese Online Learning Platform', { align: 'center' })
        .moveDown(1.5);
      
      // Add certificate text
      doc.font('Helvetica')
        .fontSize(16)
        .fillColor('#555555')
        .text('This is to certify that', { align: 'center' })
        .moveDown(0.5);
      
      // Add user name
      doc.font('Helvetica-Bold')
        .fontSize(28)
        .fillColor('#333333')
        .text(userName, { align: 'center' })
        .moveDown(0.5);
      
      // Add completion text
      doc.font('Helvetica')
        .fontSize(16)
        .fillColor('#555555')
        .text('has successfully completed the course', { align: 'center' })
        .moveDown(0.5);
      
      // Add course name
      doc.font('Helvetica-Bold')
        .fontSize(24)
        .fillColor('#4361ee')
        .text(courseName, { align: 'center' })
        .moveDown(1.5);
      
      // Add date
      doc.font('Helvetica')
        .fontSize(14)
        .fillColor('#555555')
        .text(`Issued on: ${formattedDate}`, { align: 'center' })
        .moveDown(0.5);
      
      // Add certificate ID
      doc.font('Helvetica')
        .fontSize(12)
        .fillColor('#777777')
        .text(`Certificate ID: ${certificateId}`, { align: 'center' })
        .moveDown(0.5);
      
      // Add verification text
      doc.fontSize(10)
        .text('This certificate can be verified at eduflow.com/verify', { align: 'center' })
        .moveDown(1);
      
      // Add signature line
      const signatureY = doc.y + 30;
      doc.moveTo(doc.page.width / 2 - 100, signatureY)
        .lineTo(doc.page.width / 2 + 100, signatureY)
        .stroke();
      
      doc.font('Helvetica')
        .fontSize(14)
        .fillColor('#555555')
        .text('Authorized Signature', { align: 'center' });
      
      // Finalize PDF
      doc.end();
      
      // Return path when done
      stream.on('finish', () => {
        resolve(outputPath);
      });
      
      // Handle errors
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}; 