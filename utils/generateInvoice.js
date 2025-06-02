import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';

function generateInvoice(order, outputPath) {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(outputPath));

  // Company Info (top-left)
  doc
    .fontSize(14)
    .text('SHOPPI PVT LTD', 50, 50)
    .text('Muvatupuzha, Vazhakulam')
    .text('Ph. 9188557788');

  // Invoice title (top-right)
  doc
    .fontSize(24)
    .text('INVOICE', { align: 'right' });

  doc.moveDown(2);

  // Order Info
  doc.fontSize(12).text(`Order ID: ${order.orderId}`);
  doc.text(`Placed At: ${new Date(order.placedAt).toLocaleDateString("en-IN")}`);
  doc.moveDown();

  // User Info
  doc.fontSize(14).text('Shipping Address:', { underline: true });
  doc.fontSize(12).text(`${order.userName}`);
  const addr = order.shippingAddress;
  doc.text(`${addr.housename}, ${addr.street}`);
  doc.text(`${addr.city}, ${addr.state} - ${addr.postalCode}`);
  doc.text(`Phone: ${addr.phone}`);
  doc.moveDown();

  // Payment
  doc.fontSize(14).text('Payment Method:', { underline: true });
  doc.fontSize(12).text(order.paymentMethod);
  doc.moveDown();

  // Filter only delivered items
  const deliveredItems = order.items.filter(item => item.orderStatus === "delivered");

  // If no delivered items, show a message
  if (deliveredItems.length === 0) {
    doc.fontSize(12).fillColor('red').text('No items delivered yet. Invoice not applicable.', { align: 'center' });
  } else {
    // Items Section
    doc.fontSize(14).fillColor('black').text('Delivered Items:', { underline: true });

    deliveredItems.forEach((item, i) => {
      doc.fontSize(12).text(`${i + 1}. ${item.productId.product_name} - Qty: ${item.quantity} - ₹${item.priceAtPurchase} each`);
    });

    doc.moveDown();

    // Total (sum only delivered items)
    const deliveredTotal = deliveredItems.reduce((sum, item) => {
      return sum + (item.priceAtPurchase * item.quantity);
    }, 0);

    doc.fontSize(14).text(`Delivered Items Total: ₹${deliveredTotal}`, { align: 'right' });
  }

  doc.end();
}

export default generateInvoice;
