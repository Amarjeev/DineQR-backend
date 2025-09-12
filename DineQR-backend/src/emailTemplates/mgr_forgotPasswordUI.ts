import { generateSixDigitOtp } from "../utils/otpGenerator";

type EmailTemplate = {
  html: string;
  Otp: string;
};

function mgr_passwordResetUI(email: string): EmailTemplate {
  const timestamp = new Date().toLocaleString();
  const Otp = generateSixDigitOtp();

  return {
    Otp,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DineQR Manager Password Reset OTP</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 30px;
          }
          h2 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 10px;
          }
          p {
            color: #555;
            text-align: center;
            line-height: 1.6;
          }
          .otp-box {
            text-align: center;
            margin: 25px 0;
          }
          .otp {
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
            background-color: #dc3545; /* red to indicate password reset */
            padding: 15px 30px;
            border-radius: 10px;
            letter-spacing: 6px;
            display: inline-block;
          }
          .timestamp {
            color: #888;
            font-size: 13px;
            text-align: center;
          }
          .footer {
            color: #aaa;
            font-size: 12px;
            text-align: center;
            margin-top: 25px;
          }
          @media only screen and (max-width: 480px) {
            .container {
              padding: 20px;
              margin: 20px 10px;
            }
            .otp {
              font-size: 28px;
              padding: 12px 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🔐 DineQR Manager Password Reset</h2>
          <p>Hello <strong>${email}</strong>,</p>
          <p>You requested a password reset for your manager account. Use the following One-Time Password (OTP) to reset your password. This OTP is valid for <strong>3 minutes</strong>.</p>
          
          <div class="otp-box">
            <span class="otp">${Otp}</span>
          </div>

          <p class="timestamp">Requested at: ${timestamp}</p>

          <p class="footer">
            If you did not request a password reset, please ignore this email or contact support immediately.
          </p>
        </div>
      </body>
      </html>
    `
  };
}

export default mgr_passwordResetUI;
