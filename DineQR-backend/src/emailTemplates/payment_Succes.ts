export type EmailTemplate = {
  html: string;
};

function paymentSuccesUI(
  email: string,
  hotelName: string,
  hotelAddress: string,
  hotelContactNumber: string,
  orderId: string,
  totalAmount: number
): EmailTemplate {
  return {
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment Successful - ${hotelName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        body {
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
          font-family: 'Inter', sans-serif;
          color: #111827;
        }

        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }

        .header {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          text-align: center;
          padding: 40px 20px;
        }

        .header h1 {
          font-size: 28px;
          margin: 10px 0;
          font-weight: 700;
        }

        .header p {
          font-size: 16px;
          opacity: 0.9;
        }

        .icon {
          width: 64px;
          height: 64px;
          background: white;
          color: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
        }

        .content {
          padding: 35px 30px;
          text-align: center;
        }

        .content h2 {
          color: #111827;
          font-size: 22px;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .content p {
          color: #6b7280;
          font-size: 15px;
          margin-bottom: 25px;
          line-height: 1.6;
        }

        .order-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 20px;
          text-align: left;
          margin-bottom: 25px;
        }

        .order-box h3 {
          font-size: 16px;
          color: #065f46;
          margin-bottom: 12px;
        }

        .order-info {
          font-size: 14px;
          color: #374151;
          line-height: 1.6;
        }

        .highlight {
          font-weight: 600;
          color: #065f46;
        }

        .amount {
          font-size: 28px;
          font-weight: 700;
          color: #10b981;
          margin: 20px 0;
        }

        .hotel-info {
          text-align: left;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          margin-top: 20px;
        }

        .hotel-info h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #111827;
        }

        .hotel-info p {
          font-size: 14px;
          color: #6b7280;
          margin: 3px 0;
        }

        .contact-btn {
          display: inline-block;
          background: #10b981;
          color: white;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 15px;
          margin-top: 15px;
          transition: background 0.3s ease;
        }

        .contact-btn:hover {
          background: #059669;
        }

        .footer {
          background: #f9fafb;
          padding: 25px;
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }

        .brand {
          color: #10b981;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1>Payment Successful 🎉</h1>
          <p>Thank you for your payment!</p>
        </div>

        <div class="content">
          <h2>Hello ${email},</h2>
          <p>Your payment for <strong>${hotelName}</strong> has been successfully received.</p>

          <div class="order-box">
            <h3>Order Summary</h3>
            <p class="order-info">
              <span class="highlight">Order ID:</span> ${orderId}<br />
              <span class="highlight">Total Amount:</span> ₹${totalAmount.toFixed(2)}<br />
              <span class="highlight">Status:</span> Paid ✅
            </p>
          </div>

          <div class="hotel-info">
            <h3>Restaurant Details</h3>
            <p><strong>${hotelName}</strong></p>
            <p>${hotelAddress}</p>
            <p>📞 ${hotelContactNumber}</p>

            <a href="tel:${hotelContactNumber}" class="contact-btn">Call Restaurant</a>
          </div>
        </div>

        <div class="footer">
          <p>
            Thank you for dining with <span class="brand">DineQR</span>.<br />
            We hope to serve you again soon!
          </p>
        </div>
      </div>
    </body>
    </html>
    `,
  };
}

export default paymentSuccesUI;
