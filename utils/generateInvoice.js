import path from 'path';
import fs from 'fs'
import PDFDocument from 'pdfkit'

function generateInvoice(order, outputPath) {
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(fs.createWriteStream(outputPath));

  // Header
  doc.fontSize(20).text('INVOICE', { align: 'center' });
  doc.moveDown();

  // Order Info
  doc.fontSize(12).text(`Order ID: ${order.orderId}`);
  doc.text(`Placed At: ${new Date(order.placedAt).toLocaleDateString("en-IN")}`);
  doc.text(`Order Status: ${order.orderStatus}`);
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

  // Items Table
  doc.fontSize(14).text('Items:', { underline: true });
  order.items.forEach((item, i) => {
    doc.fontSize(12).text(`${i + 1}. ${item.productId.product_name} - Qty: ${item.quantity} - ₹${item.priceAtPurchase} each`);
  });
  doc.moveDown();

  // Total
  doc.fontSize(14).text(`Total Amount: ₹${order.totalAmount}`, { align: 'right' });

  doc.end();
}

export default generateInvoice;
