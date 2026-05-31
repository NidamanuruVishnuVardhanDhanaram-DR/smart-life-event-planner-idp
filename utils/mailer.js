const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Event Planner'}" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Email could not be sent');
  }
};

const sendEventReminder = async (userEmail, userName, event) => {
  const subject = `Reminder: ${event.title} is coming up!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Event Reminder</h2>
      <p>Hi ${userName},</p>
      <p>This is a friendly reminder about your upcoming event:</p>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #007bff;">${event.title}</h3>
        <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()}</p>
        <p><strong>Location:</strong> ${event.location?.address || 'TBD'}</p>
        <p><strong>Description:</strong> ${event.description}</p>
      </div>

      <p>Don't forget to prepare everything for a successful event!</p>

      <div style="margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event._id}"
           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Event Details
        </a>
      </div>

      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        You're receiving this because you have event reminders enabled.
        <a href="#">Unsubscribe</a> if you no longer wish to receive these emails.
      </p>
    </div>
  `;

  await sendEmail({
    email: userEmail,
    subject,
    html,
  });
};

const sendEventInvitation = async (userEmail, userName, event, inviterName) => {
  const subject = `You're invited to: ${event.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Event Invitation</h2>
      <p>Hi ${userName},</p>
      <p>${inviterName} has invited you to join an event:</p>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #007bff;">${event.title}</h3>
        <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()}</p>
        <p><strong>Location:</strong> ${event.location?.address || 'TBD'}</p>
        <p><strong>Description:</strong> ${event.description}</p>
      </div>

      <div style="margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event._id}/rsvp"
           style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">
          Accept Invitation
        </a>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event._id}"
           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Details
        </a>
      </div>

      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This invitation was sent by ${inviterName}.
      </p>
    </div>
  `;

  await sendEmail({
    email: userEmail,
    subject,
    html,
  });
};

const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = 'Welcome to AI-Powered Smart Life Event Planner!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Event Planner!</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for joining our AI-powered event planning platform. We're excited to help you create amazing events!</p>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">What you can do:</h3>
        <ul>
          <li>Plan events with AI assistance</li>
          <li>Get weather-aware planning suggestions</li>
          <li>Collaborate with team members</li>
          <li>Track budgets and resources</li>
          <li>Receive smart reminders</li>
        </ul>
      </div>

      <div style="margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard"
           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Get Started
        </a>
      </div>

      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Need help? Contact our support team at support@eventplanner.com
      </p>
    </div>
  `;

  await sendEmail({
    email: userEmail,
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
  sendEventReminder,
  sendEventInvitation,
  sendWelcomeEmail,
};
