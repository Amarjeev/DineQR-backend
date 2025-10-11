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

  // ✅ Calculate total item count
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
          margin: 0;
          padding: 0;
          background: #f3f4f6;
          font-family: 'Inter', sans-serif;
          color: #1f2937;
        }
        .
        .
        .
        
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .header {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          text-align: center;
          padding: 35px 20px;
        }

        .logo {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .subtitle {
          font-size: 15px;
          opacity: 0.9;
        }

        .content {
          padding: 30px 25px;
        }

        .greeting {
          text-align: center;
          margin-bottom: 25px;
        }

        .greeting h2 {
          font-size: 18px;
          margin-bottom: 6px;
        }

        .delivery-success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin-bottom: 25px;
        }

        .delivery-icon {
          font-size: 36px;
          margin-bottom: 10px;
        }

        .delivery-text {
          font-size: 16px;
          color: #059669;
          font-weight: 600;
        }

        .bill-section {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 25px;
          margin-bottom: 25px;
        }

        .bill-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 15px;
        }

        .hotel-name {
          font-size: 20px;
          font-weight: 700;
        }

        .bill-title {
          font-size: 15px;
          color: #6b7280;
        }

        .order-info {
          display: grid;
          gap: 12px;
          margin-bottom: 20px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 6px;
        }

        .info-label {
          color: #6b7280;
          font-weight: 500;
        }

        .items-container {
          overflow-x: auto;
          margin-bottom: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .items-table th {
          background: #f3f4f6;
          text-align: left;
          padding: 10px;
          color: #6b7280;
          text-transform: uppercase;
          font-size: 12px;
        }

        .items-table td {
          padding: 10px;
          border-bottom: 1px solid #f3f4f6;
        }

        .item-name { font-weight: 600; color: #1f2937; }

        .total-section {
          border-top: 2px solid #e5e7eb;
          padding-top: 10px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }

        .grand-total {
          font-weight: 700;
          color: #059669;
          font-size: 16px;
        }

        .payment-cta {
          text-align: center;
          background: #1f2937;
          color: white;
          border-radius: 10px;
          padding: 25px 20px;
          margin-bottom: 25px;
        }

        .payment-amount {
          font-size: 28px;
          color: #10b981;
          font-weight: 700;
          margin: 8px 0;
        }

        .pay-button {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 14px 30px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: background 0.3s;
        }

        .pay-button:hover {
          background: #059669;
        }

        .contact-section {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          font-size: 14px;
        }

        .footer {
          text-align: center;
          padding: 20px;
          font-size: 13px;
          color: #6b7280;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }

        /* ✅ Responsive */
        @media (max-width: 600px) {
          .content { padding: 20px; }
          .header { padding: 25px 15px; }
          .title { font-size: 20px; }
          .items-table th, .items-table td { padding: 8px; font-size: 12px; }
          .payment-amount { font-size: 24px; }
          .pay-button { width: 100%; padding: 14px 0; }
        }

        @media (max-width: 400px) {
          .title { font-size: 18px; }
          .payment-amount { font-size: 20px; }
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="header">
          <div class="logo">DineQR</div>
          <div class="title">Order Delivered Successfully 🎉</div>
          <p class="subtitle">Your meal has been served. Here’s your detailed bill.</p>
        </div>

        <div class="content">
          <div class="greeting">
            <h2>Hello ${email},</h2>
            <p>Your order has been delivered to your table. Enjoy your meal!</p>
          </div>

          <div class="delivery-success">
            <div class="delivery-icon">✅</div>
            <div class="delivery-text">Order Delivered Successfully</div>
          </div>

          <div class="bill-section">
            <div class="bill-header">
              <div class="hotel-name">${hotelName}</div>
              <div class="bill-title">TAX INVOICE</div>
            </div>

            <div class="order-info">
              <div class="info-row"><span class="info-label">Order ID</span> <span> ${orderId}</span></div>
              <div class="info-row"><span class="info-label">Table</span> <span> ${tableNumber}</span></div>
              <div class="info-row"><span class="info-label">Order Date</span> <span> ${orderTimestamp}</span></div>
              <div class="info-row"><span class="info-label">Delivered</span> <span> ${deliveredTimestamp}</span></div>
            </div>

            <div class="items-container">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item </th>
                    <th>Portion </th>
                    <th>Qty </th>
                    <th>Price </th>
                    <th>Subtotal </th>
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
                            ? `<td rowspan="${item.portions.length}" class="item-name">${item.name}</td>`
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
              <div class="total-row"><span>Total Items</span><span> ${totalItems}</span></div>
              <div class="total-row grand-total"><span>Grand Total</span><span> ₹${totalAmount.toFixed(
                2
              )}</span></div>
              ${
                gstNumber
                  ? `<p style="text-align:center;margin-top:10px;color:#6b7280;font-size:12px;">GSTIN: ${gstNumber}</p>`
                  : ""
              }
            </div>
          </div>

          <div class="payment-cta">
            <div>Ready to Pay?</div>
            <div class="payment-amount"> ₹${totalAmount.toFixed(2)}</div>
            <a href="https://yourpaymentlink.com/pay/${orderId}" class="pay-button">💳 Pay Now</a>
            <p style="font-size:12px;opacity:0.8;margin-top:8px;">Secure SSL Payment</p>
          </div>

          <div class="contact-section">
            <strong>${hotelName}</strong><br/>
            ${hotelAddress}<br/>
            📞 ${hotelContactNumber}
          </div>
        </div>

        <div class="footer">
          Thank you for dining with <strong>${hotelName}</strong>! We hope to see you again soon.
        </div>
      </div>
    </body>
    </html>
    `,
  };
}

export default orderDeliveredUI;
