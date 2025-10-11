export type EmailTemplate = {
  html: string;
};

function orderCanceledUI(
  email: string,
  hotelName: string,
  hotelAddress: string,
  hotelContactNumber: string,
  orderId: string,
  totalAmount: number,
  cancellationReason: string,
  orderDate?: Date,
  canceledDate?: Date
): EmailTemplate {
  const orderTimestamp = orderDate
    ? orderDate.toLocaleString()
    : new Date().toLocaleString();
  const canceledTimestamp = canceledDate
    ? canceledDate.toLocaleString()
    : new Date().toLocaleString();

  return {
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Cancellation Request - ${hotelName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #333333;
            line-height: 1.6;
            -webkit-text-size-adjust: 100%;
            -webkit-font-smoothing: antialiased;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            width: 100%;
          }
          
          .header {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .logo {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .title {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
            line-height: 1.3;
          }
          
          .subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
            line-height: 1.5;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            margin-bottom: 30px;
          }
          
          .greeting h2 {
            color: #1f2937;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 10px;
            line-height: 1.4;
          }
          
          .greeting p {
            color: #6b7280;
            font-size: 16px;
            line-height: 1.6;
          }
          
          .cancellation-notice {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          
          .cancellation-icon {
            font-size: 48px;
            margin-bottom: 15px;
          }
          
          .cancellation-text {
            color: #dc2626;
            font-size: 16px;
            font-weight: 600;
            line-height: 1.5;
          }
          
          .order-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
          }
          
          .card-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            line-height: 1.4;
          }
          
          /* Simple Table Layout for Order Details */
          .order-details-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .order-details-table tr {
            border-bottom: 1px solid #e5e7eb;
          }
          
          .order-details-table tr:last-child {
            border-bottom: none;
          }
          
          .order-details-table td {
            padding: 12px 0;
            vertical-align: top;
          }
          
          .detail-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.4;
            width: 120px;
            padding-right: 15px;
          }
          
          .detail-value {
            font-size: 14px;
            color: #1f2937;
            font-weight: 500;
            line-height: 1.4;
            word-break: break-word;
          }
          
          /* Cancellation Reason Section */
          .reason-section {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
          }
          
          .reason-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            line-height: 1.4;
          }
          
          .reason-content {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 16px;
            margin-top: 10px;
          }
          
          .reason-text {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
            font-style: italic;
          }
          
          /* Hotel Information */
          .hotel-info {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
          }
          
          .hotel-name {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            line-height: 1.4;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          /* Simple Table Layout for Hotel Details */
          .hotel-details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          
          .hotel-details-table tr {
            border-bottom: 1px solid #e5e7eb;
          }
          
          .hotel-details-table tr:last-child {
            border-bottom: none;
          }
          
          .hotel-details-table td {
            padding: 12px 0;
            vertical-align: top;
          }
          
          .hotel-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.4;
            width: 120px;
            padding-right: 15px;
          }
          
          .hotel-value {
            font-size: 14px;
            color: #1f2937;
            font-weight: 500;
            line-height: 1.5;
            word-break: break-word;
          }
          
          .contact-button {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            transition: background-color 0.3s ease;
            text-align: center;
            margin-top: 10px;
          }
          
          .contact-button:hover {
            background: #b91c1c;
          }
          
          .refund-section {
            background: #fffbeb;
            border: 1px solid #fed7aa;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
          }
          
          .refund-icon {
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .refund-label {
            font-size: 14px;
            color: #92400e;
            font-weight: 500;
            margin-bottom: 8px;
            line-height: 1.4;
          }
          
          .refund-amount {
            font-size: 28px;
            color: #dc2626;
            font-weight: 700;
            margin: 5px 0;
            line-height: 1.2;
          }
          
          .refund-note {
            color: #92400e;
            font-size: 12px;
            line-height: 1.4;
            margin-top: 10px;
          }
          
          .next-steps {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          
          .steps-title {
            font-size: 16px;
            font-weight: 600;
            color: #0369a1;
            margin-bottom: 15px;
            line-height: 1.4;
          }
          
          .steps-list {
            color: #0369a1;
            font-size: 14px;
            line-height: 1.6;
            padding-left: 20px;
          }
          
          .steps-list li {
            margin-bottom: 8px;
          }
          
          .support-section {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
          }
          
          .support-text {
            color: #dc2626;
            font-size: 14px;
            font-weight: 500;
            line-height: 1.5;
          }
          
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer-text {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .brand {
            color: #2563eb;
            font-weight: 600;
          }

          /* Enhanced Responsive Design */
          @media only screen and (max-width: 620px) {
            .container {
              margin: 10px;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
          }
          
          @media only screen and (max-width: 600px) {
            .content {
              padding: 30px 20px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .title {
              font-size: 24px;
            }
            
            .subtitle {
              font-size: 15px;
            }
            
            .logo {
              font-size: 22px;
            }
            
            /* Mobile: Stack table rows */
            .order-details-table tr,
            .hotel-details-table tr {
              display: block;
              margin-bottom: 15px;
              padding-bottom: 15px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .order-details-table tr:last-child,
            .hotel-details-table tr:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            
            .order-details-table td,
            .hotel-details-table td {
              display: block;
              width: 100% !important;
              padding: 5px 0;
            }
            
            .detail-label,
            .hotel-label {
              width: 100%;
              padding-right: 0;
              margin-bottom: 5px;
            }
            
            .detail-value,
            .hotel-value {
              width: 100%;
            }
            
            .refund-amount {
              font-size: 24px;
            }
            
            .contact-button {
              width: 100%;
              padding: 14px 20px;
            }
            
            .order-card,
            .reason-section,
            .hotel-info {
              padding: 20px;
              margin: 20px 0;
            }
            
            .card-title,
            .reason-title {
              font-size: 16px;
            }
            
            .hotel-name {
              font-size: 16px;
            }
            
            .greeting h2 {
              font-size: 18px;
            }
          }
          
          @media only screen and (max-width: 480px) {
            .content {
              padding: 25px 15px;
            }
            
            .header {
              padding: 25px 15px;
            }
            
            .title {
              font-size: 22px;
            }
            
            .subtitle {
              font-size: 14px;
            }
            
            .logo {
              font-size: 20px;
            }
            
            .refund-amount {
              font-size: 22px;
            }
            
            .order-card,
            .reason-section,
            .hotel-info {
              padding: 15px;
            }
            
            .refund-section {
              padding: 20px 15px;
            }
            
            .footer {
              padding: 25px 15px;
            }
            
            .contact-button {
              padding: 12px 16px;
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header Section -->
          <div class="header">
            <div class="logo">DineQR</div>
            <h1 class="title">Cancellation Requested</h1>
            <p class="subtitle">Your order cancellation is being processed</p>
          </div>
          
          <!-- Content Section -->
          <div class="content">
            <!-- Greeting -->
            <div class="greeting">
              <h2>Hello ${email},</h2>
              <p>We've received your request to cancel your order from <strong>${hotelName}</strong>.</p>
            </div>
            
            <!-- Cancellation Notice -->
            <div class="cancellation-notice">
              <div class="cancellation-icon">❌</div>
              <p class="cancellation-text">Your cancellation request has been submitted and is under review.</p>
            </div>
  
            <!-- Order Information -->
            <div class="order-card">
              <div class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                Order Details
              </div>
  
              <table class="order-details-table">
                <tr>
                  <td class="detail-label">ORDER ID</td>
                  <td class="detail-value">${orderId}</td>
                </tr>
                <tr>
                  <td class="detail-label">ORDER DATE</td>
                  <td class="detail-value">${orderTimestamp}</td>
                </tr>
                <tr>
                  <td class="detail-label">CANCELLATION DATE</td>
                  <td class="detail-value">${canceledTimestamp}</td>
                </tr>
                <tr>
                  <td class="detail-label">STATUS</td>
                  <td class="detail-value" style="color: #dc2626; font-weight: 600;">Cancellation Requested</td>
                </tr>
              </table>
            </div>
  
            <!-- Cancellation Reason -->
            <div class="reason-section">
              <div class="reason-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Cancellation Reason
              </div>
              <div class="reason-content">
                <p class="reason-text">"${cancellationReason}"</p>
              </div>
            </div>
  
            <!-- Hotel Information -->
            <div class="hotel-info">
              <div class="hotel-name">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                  <line x1="6" y1="1" x2="6" y2="4"></line>
                  <line x1="10" y1="1" x2="10" y2="4"></line>
                  <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
                ${hotelName}
              </div>
  
              <table class="hotel-details-table">
                <tr>
                  <td class="hotel-label">ADDRESS</td>
                  <td class="hotel-value">${hotelAddress}</td>
                </tr>
                <tr>
                  <td class="hotel-label">PHONE NUMBER</td>
                  <td class="hotel-value">${hotelContactNumber}</td>
                </tr>
              </table>
  
              <a href="tel:${hotelContactNumber}" class="contact-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Contact Restaurant
              </a>
            </div>
  
            <!-- Refund Information -->
            <div class="refund-section">
              <div class="refund-icon">💰</div>
              <div class="refund-label">Expected Refund Amount</div>
              <div class="refund-amount">₹${totalAmount.toFixed(2)}</div>
              <div class="refund-note">
                *Refund will be processed within 5-7 business days after cancellation approval
              </div>
            </div>
  
            <!-- Next Steps -->
            <div class="next-steps">
              <div class="steps-title">What happens next?</div>
              <ul class="steps-list">
                <li>Restaurant will review your cancellation request</li>
                <li>You'll receive confirmation once cancellation is approved</li>
                <li>Refund will be processed to your original payment method</li>
                <li>You'll receive email confirmation when refund is initiated</li>
              </ul>
            </div>
 
            <!-- Support Notice -->
            <div class="support-section">
              <p class="support-text">
                If you have any questions about your cancellation, please contact the restaurant directly.
              </p>
            </div>
          </div>
  
          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">
              Thank you for choosing <span class="brand">DineQR</span>.<br>
              We hope to serve you better next time.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export default orderCanceledUI;