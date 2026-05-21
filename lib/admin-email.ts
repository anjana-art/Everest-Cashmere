// lib/admin-email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface AdminOrderNotification {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemsCount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }>;
  status: string;
  createdAt: Date;
}

export async function sendAdminOrderNotification(order: AdminOrderNotification) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'himkash.info@gmail.com';
  
  const itemsHtml = order.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 8px;">${item.name}${item.color ? `<br><small>${item.color}${item.size ? ` / ${item.size.toUpperCase()}` : ''}</small>` : ''}</td>
      <td style="padding: 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; text-align: right;">€${item.price.toFixed(2)}</td>
      <td style="padding: 8px; text-align: right;">€${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; }
      .container { max-width: 600px; margin: 0 auto; }
      .header { background: #8B1E1E; color: white; padding: 20px; text-align: center; }
      .content { padding: 20px; background: #f9f9f9; }
      .order-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #f0f0f0; padding: 10px; text-align: left; }
      .total { font-size: 20px; font-weight: bold; text-align: right; color: #8B1E1E; }
      .button { background: #8B1E1E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>🛍️ NEW ORDER!</h1><p>Order #${order.orderNumber}</p></div>
        <div class="content">
          <div class="order-box"><strong>Customer:</strong> ${order.customerName}<br><strong>Email:</strong> ${order.customerEmail}<br><strong>Total:</strong> €${order.total.toFixed(2)}</div>
          <div class="order-box"><strong>Items (${order.itemsCount})</strong>
            <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot><tr><td colspan="3" style="text-align: right;"><strong>Total:</strong></td><td style="text-align: right;"><strong>€${order.total.toFixed(2)}</strong></td></tr></tfoot>
           </table>
          </div>
          <div style="text-align: center;"><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/orders/${order.orderId}" class="button">View Order →</a></div>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Himkash <orders@himkash.com>',
    to: adminEmail,
    subject: `🛍️ NEW ORDER #${order.orderNumber} - €${order.total.toFixed(2)}`,
    html,
  });
}