export type EmailTemplate = {
  html: string;
};

function orderDeliveredUI(
  email: string,
  hotelName: string,
  hotelAddress: string,
  hotelContactNumber: string,
  gstNumber: string,
  orderId: string,
  tableNumber: string,
  items: any[],
  totalAmount: number,
  orderDate?: Date,
  deliveredDate?: Date
): EmailTemplate {
  const orderTimestamp = orderDate
    ? orderDate.toLocaleString()
    : new Date().toLocaleString();
  const deliveredTimestamp = deliveredDate
    ? deliveredDate.toLocaleString()
    : new Date().toLocaleString();

  // Total item count
  const totalItems = items.reduce((total, item) => {
    return (
      total +
      item.portions.reduce(
        (sum: number, portion: any) => sum + portion.quantity,
        0
      )
    );
  }, 0);

  return {
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Order Delivered - ${hotelName}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #f5f5f5;
          font-family: Arial, sans-serif;
          color: #333;
          line-height: 1.4;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .header {
          background: #2d5be3;
          color: white;
          padding: 20px;
          text-align: center;
        }

        .header h1 {
          margin: 0 0 6px 0;
          font-size: 20px;
        }

        .header p {
          margin: 0;
          opacity: 0.9;
          font-size: 13px;
        }

        .content {
          padding: 20px;
        }

        .section {
          margin-bottom: 15px;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
        }

        /* Order Details Section */
        .order-info h3 {
          margin-top: 0;
          font-size: 14px;
          color: #2d5be3;
          font-weight: bold;
          border-bottom: 2px solid #2d5be3;
          display: inline-block;
          padding-bottom: 3px;
          margin-bottom: 10px;
        }

        .info-row {
          margin-bottom: 8px;
          font-size: 12px;
        }

        .info-label {
          font-weight: 600;
          color: #555;
          display: block;
          margin-bottom: 2px;
        }

        .info-value {
          font-weight: 500;
          color: #111;
        }

        /* Scrollable table wrapper */
        .table-wrapper {
          overflow-x: auto;
          max-height: 220px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          -webkit-overflow-scrolling: touch; /* Smooth scroll mobile */
          scroll-behavior: smooth;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 520px;
          font-size: 12px;
        }

        .items-table th {
          background: #f1f3f7;
          text-align: left;
          padding: 8px;
          border-bottom: 1px solid #e0e0e0;
          color: #555;
          text-transform: uppercase;
          font-size: 11px;
        }

        .items-table td {
          padding: 8px;
          border-bottom: 1px solid #f0f0f0;
        }

        .items-table tr:nth-child(even) {
          background: #fafafa;
        }

        .total-section {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 2px solid #e0e0e0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
        }

        .grand-total {
          font-weight: bold;
          font-size: 14px;
          color: #2d5be3;
        }

        .payment-section {
          background: #2d5be3;
          color: white;
          text-align: center;
          padding: 16px;
          border-radius: 6px;
        }

        .payment-amount {
          font-size: 20px;
          font-weight: bold;
          margin: 8px 0;
        }

        .pay-button {
          display: inline-block;
          background: #ffffff;
          color: #2d5be3;
          padding: 10px 24px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          margin: 8px 0;
          font-size: 12px;
        }

        .contact-info {
          text-align: center;
          font-size: 12px;
          color: #666;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
          margin-top: 12px;
        }

        .footer {
          text-align: center;
          padding: 14px;
          font-size: 11px;
          color: #999;
          background: #f5f5f5;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .content {
            padding: 12px;
          }
          .header {
            padding: 16px;
          }
          .header h1 {
            font-size: 18px;
          }
          .items-table th,
          .items-table td {
            padding: 5px 3px;
            font-size: 10px;
          }
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="header">
          <h1>Order Delivered</h1>
          <p>Your meal has been served successfully</p>
        </div>

        <div class="content">
          <div class="section">
            <p><strong>Hello ${email},</strong></p>
            <p>Your order has been delivered to your table. Enjoy your meal!</p>
          </div>

          <!-- Order Details -->
          <div class="section order-info">
            <h3>Order Details</h3>
            <div class="info-row">
                <span class="info-label" style="border-bottom: 1px solid #2d5be3; padding-bottom: 2px; display: inline-block;">Order ID :</span>
              <span class="info-value">${orderId}</span>
            </div>
            <div class="info-row">
                <span class="info-label" style="border-bottom: 1px solid #2d5be3; padding-bottom: 2px; display: inline-block;">Table Number :</span>
              <span class="info-value">${tableNumber}</span>
            </div>
            <div class="info-row">
                <span class="info-label" style="border-bottom: 1px solid #2d5be3; padding-bottom: 2px; display: inline-block;">Order Date :</span>
              <span class="info-value">${orderTimestamp}</span>
            </div>
            <div class="info-row">
                <span class="info-label" style="border-bottom: 1px solid #2d5be3; padding-bottom: 2px; display: inline-block;">Delivered Date :</span>
              <span class="info-value">${deliveredTimestamp}</span>
            </div>
          </div>

          <!-- Scrollable Table -->
          <div class="section">
            <div class="table-wrapper">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Portion</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${items
                    .map((item) =>
                      item.portions
                        .map(
                          (portion: any, i: number) => `
                      <tr>
                        ${
                          i === 0
                            ? `<td rowspan="${item.portions.length}">${item.name}</td>`
                            : ""
                        }
                        <td>${portion.portion}</td>
                        <td>${portion.quantity}</td>
                        <td>₹${portion.price}</td>
                        <td>₹${portion.subtotal}</td>
                      </tr>
                    `
                        )
                        .join("")
                    )
                    .join("")}
                </tbody>
              </table>
            </div>

            <div class="total-section">
              <div class="total-row">
                <span>Total Items:</span>
                <span style="margin-left: 2px;">${totalItems}</span>
              </div>
              <div class="total-row grand-total">
                <span>Grand Total:</span>
                <span style="margin-left: 2px;">₹${totalAmount.toFixed(
                  2
                )}</span>
              </div>
              ${
                gstNumber
                  ? `<div style="text-align:center;margin-top:6px;font-size:12px;color:#666;">GSTIN: ${gstNumber}</div>`
                  : ""
              }
            </div>
          </div>

          <!-- Payment -->
          <div class="payment-section">
            <div>Ready to Pay?</div>
            <div class="payment-amount">₹${totalAmount.toFixed(2)}</div>
            <a href="https://yourpaymentlink.com/pay/${orderId}" class="pay-button">Pay Now</a>
            <div style="font-size:11px;opacity:0.85;">Secure SSL Payment</div>
          </div>

          <!-- Contact Info -->
          <div class="contact-info">
            <strong>${hotelName}</strong><br/>
            ${hotelAddress}<br/>
            📞 ${hotelContactNumber}
          </div>
        </div>

        <div class="footer">
          Thank you for dining with us! We hope to see you again soon.
        </div>
      </div>
    </body>
    </html>
  `,
  };
}

export default orderDeliveredUI;
