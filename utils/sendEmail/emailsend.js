const nodemailer = require("nodemailer");

const htmlForOTP = (otp) => `
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
        
        <p>Your verification code is: <strong style="color: #0077b6;">${otp}</strong></p>
        
        <p>Please use this code to complete your verification process.</p>
        
        <p>Thank you for using our service.</p>
    </div>
</body>
</html>
`;

const sendOTPEmail = async (email, otp) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER, // your email
      pass: process.env.SMTP_PASS, // your email password
    },
  });

  let mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Verification Code",
    text: `Your verification code is: ${otp}`,
    html: htmlForOTP(otp),
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;
