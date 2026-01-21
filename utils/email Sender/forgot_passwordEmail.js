const nodemailer = require("nodemailer");

const AppError = require("../../utils/appError");

const htmlForOTP = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verification Code</title>
    <style>
        body {
            background-color: #f0f0f0;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .email-container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <h1>Verification Code</h1>
        
        <p>Dear User,</p>
        
        <p>Your verification code is: <strong style="color: #0077b6;">#code#</strong></p>
        
        <p>Please use this code to complete your verification process.</p>
        
        <p>Thank you for using our service.</p>
    </div>
</body>
</html>
`;
// Define the sendForgotOtp class

class sendForgotOtp {
  constructor(email, resetcode) {
    this.to = email;
    this.resetcode = resetcode;

    // Create a transporter object using the default SMTP transport
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER, // Your email address
        pass: process.env.SMTP_PASS, // Your email password
      },
    });
  }

  async send() {
    // Define the email options
    const mailOptions = {
      to: this.to,
      subject: " verification code",
      text: " verification code",
      html: htmlForOTP.replace("#code#", this.resetcode),
    };

    try {
      // Send the email
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error("error send otp");
    }
  }

  async sendVerificationCode() {
    await this.send();
  }
}
// Export the sendForgotOtp class
module.exports = sendForgotOtp

