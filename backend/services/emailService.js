import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  initialize() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  async sendContactFormEmail(contactDetails, conversationSummary, unansweredQuestion) {
    this.initialize();

    const recipients = process.env.RECIPIENT_EMAILS.split(',');
    
    const htmlContent = `
      <h2>Cincinnati Hotel - Unanswered Question</h2>
      <p>A guest could not get their question answered by the chatbot and left their contact information.</p>
      
      <h3>Contact Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${contactDetails.name}</li>
        <li><strong>Phone:</strong> ${contactDetails.phone}</li>
        <li><strong>Email:</strong> ${contactDetails.email}</li>
      </ul>
      
      <h3>Unanswered Question:</h3>
      <p>${unansweredQuestion}</p>
      
      <h3>Conversation History:</h3>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${conversationSummary}
      </div>
      
      <p><em>Please follow up with this guest as soon as possible.</em></p>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipients,
        subject: `Cincinnati Hotel - Contact Request from ${contactDetails.name}`,
        html: htmlContent
      });

      console.log('Contact form email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async verifyConnection() {
    this.initialize();
    try {
      await this.transporter.verify();
      console.log('[Email] Server is ready to send emails');
      return true;
    } catch (error) {
      console.error('[Email] Server connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();
