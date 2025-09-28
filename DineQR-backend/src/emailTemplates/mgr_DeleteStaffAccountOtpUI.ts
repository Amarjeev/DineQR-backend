import { generateOtp } from "../utils/otpGenerator";

type EmailTemplate = {
  html: string;
  Otp: string;
};

function mgr_DeleteStaffAccountOtpUI(email: string): EmailTemplate {
  const timestamp = new Date().toLocaleString();
  const Otp = generateOtp(5);

  return {
    Otp,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DineQR OTP</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 30px;
          }
          h2 {
            color: #c0392b;
            text-align: center;
            margin-bottom: 15px;
            font-size: 24px;
          }
          p {
            color: #555;
            text-align: center;
            line-height: 1.6;
            margin: 8px 0;
          }
          .otp-box {
            text-align: center;
            margin: 30px 0;
          }
          .otp {
            font-size: 36px;
            font-weight: bold;
            color: #fff;
            background-color: #e74c3c;
            padding: 15px 35px;
            border-radius: 12px;
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
              padding: 12px 28px;
            }
            h2 {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>⚠️ DineQR </h2>
          <p>Hello <strong>${email}</strong>,</p>

          <!-- New paragraph added -->
          <p>
            This email is part of the staff account deletion process. 
            Please use the OTP below to verify your request. 
            Only proceed if you truly wish to delete your account, as this action is permanent.
          </p>

          <p>
            You requested to <strong>delete your account</strong>. Use the OTP below to confirm this action. 
            This OTP is valid for <strong>3 minutes</strong>.
          </p>
          
          <div class="otp-box">
            <span class="otp">${Otp}</span>
          </div>

          <p class="timestamp">Requested at: ${timestamp}</p>

          <p class="footer">
            If you did not request account deletion, please ignore this email or contact support immediately.
          </p>
        </div>
      </body>
      </html>
    `,
  };
}

export default mgr_DeleteStaffAccountOtpUI;
