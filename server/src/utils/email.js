const nodemailer = require('nodemailer');

// Create a test account or use configured email
const createTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    // Create a reusable transporter with production settings
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Create a test account for development
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.text] - Plain text version (optional)
 * @param {string} [options.from] - Sender email (defaults to configured)
 * @returns {Promise<Object>} - Send info
 */
exports.sendEmail = async (options) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: options.from || `"EduFlow" <${process.env.EMAIL_FROM || 'noreply@eduflow.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

/**
 * Send welcome email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @returns {Promise<Object>} - Send info
 */
exports.sendWelcomeEmail = async (to, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4361ee;">Welcome to EduFlow</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2>Marhaba, ${name}!</h2>
        <p>Thank you for joining EduFlow, the premier Lebanese online learning platform.</p>
        <p>We're excited to have you as part of our community of learners!</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Browse our course catalog</li>
          <li>Enroll in your first course</li>
          <li>Complete your profile</li>
          <li>Connect with other students</li>
        </ul>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://eduflow.com/courses" style="background-color: #4361ee; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Explore Courses</a>
        </div>
      </div>
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777;">
        <p>If you have any questions, feel free to contact our support team at support@eduflow.com</p>
      </div>
    </div>
  `;
  
  return this.sendEmail({
    to,
    subject: 'Welcome to EduFlow!',
    html
  });
};

/**
 * Send certificate email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} courseName - Course name
 * @param {string} certificateUrl - Certificate URL
 * @returns {Promise<Object>} - Send info
 */
exports.sendCertificateEmail = async (to, name, courseName, certificateUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4361ee;">Certificate of Completion</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2>Congratulations, ${name}!</h2>
        <p>You have successfully completed the course:</p>
        <h3 style="color: #4361ee;">${courseName}</h3>
        <p>Your certificate is ready for download. Click the button below to view and download your certificate.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${certificateUrl}" style="background-color: #4361ee; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Certificate</a>
        </div>
      </div>
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777;">
        <p>If you have any questions, feel free to contact our support team at support@eduflow.com</p>
      </div>
    </div>
  `;
  
  return this.sendEmail({
    to,
    subject: `Your Certificate for ${courseName}`,
    html
  });
}; 