const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '94093f1bf1ff37',
    pass: 'e8f5919af82d16'
  }
})

// Function to send email
const sendMail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: '"Your Name" <from@example.com>', // Sender address
      to, // List of recipients
      subject, // Subject line
      text, // Plain text body
      html: `<b>${text}</b>` // HTML body
    })
    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

// Example usage
sendMail('to@example.com', 'Test Subject', 'Hello, this is a test email!')

module.exports = sendMail
