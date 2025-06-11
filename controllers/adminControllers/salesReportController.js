import logger from '../../utils/logger.js';
import PDFDocument from "pdfkit"
import moment from "moment"
import ExcelJS from "exceljs";
import { salesReportData } from "../../utils/getSalesReportData.js"

const salesReportController = {

    // @desc Get Sales Report
    // route GET /salesreport?page=1&limit=10
    getSalesReport: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const startDateRaw = req.query.startDate;
            const endDateRaw = req.query.endDate;

            // getting sales filtered data, funciton inside the untils forlder
            const report = await salesReportData(startDateRaw, endDateRaw, skip, limit);

            res.status(200).json({
                success: true,
                orders: report.orders,
                pagination: {
                    totalOrders: report.totalOrders,
                    totalPages: Math.ceil(report.totalOrders / limit),
                    currentPage: page,
                    hasNextPage: page * limit < report.totalOrders,
                    hasPrevPage: page > 1,
                },
                summary: report.summary,
            });
        } catch (error) {
            console.error('Sales Report Error:', error);
            res.status(500).json({ success: false, message: 'Something went wrong' });
        }
    },

    //@desc download salesreport in pdf
    //router GET /salesreport/pdf/download
    getSalesReportPdf: async (req, res) => {
        try {
            const { startDate: startDateRaw, endDate: endDateRaw } = req.query;

            const report = await salesReportData(startDateRaw, endDateRaw);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=sales-report-${moment().format("YYYY-MM-DD")}.pdf`);

            const doc = new PDFDocument({
                margin: 50,
                size: "A4",
                bufferPages: true,
                info: {
                    Title: "Sales Report",
                    Author: "SHOPPI PVT LTD",
                    Subject: "Sales Performance Report",
                    CreationDate: new Date()
                }
            });
            doc.pipe(res);

            const pageWidth = doc.page.width - 100;

            const drawLine = (x1, y1, x2, y2, width = 1) => {
                doc.strokeColor("black").lineWidth(width).moveTo(x1, y1).lineTo(x2, y2).stroke();
            };

            const drawBox = (x, y, width, height, strokeColor = "black") => {
                doc.rect(x, y, width, height);
                if (strokeColor) doc.strokeColor(strokeColor).stroke();
            };

            // ===== HEADER =====
            doc.fillColor("black").font("Helvetica-Bold").fontSize(20).text("SALES REPORT", 50, 50);
            doc.font("Helvetica").fontSize(12).text("SHOPPI PVT LTD", 50, 75);
            doc.font("Helvetica").fontSize(10).text(`Generated: ${moment().format("MMMM DD, YYYY")}`, 50, 95);

            drawLine(50, 115, pageWidth + 50, 115, 2);

            // ===== SUMMARY SECTION =====
            doc.y = 135;
            doc.font("Helvetica-Bold").fontSize(14).text("SUMMARY", 50, doc.y);
            doc.y += 25;

            const summaryData = [
                { label: "Total Orders:", value: report.totalOrders.toLocaleString() },
                { label: "Total MRP:", value: `₹${report.summary.totalMRP.toLocaleString()}` },
                { label: "Total Discount:", value: `₹${report.summary.totalDiscount.toLocaleString()}` },
                { label: "Final Amount:", value: `₹${report.summary.finalAmount.toLocaleString()}` },
                {
                    label: "Average Order Value:",
                    value: `₹${report.totalOrders ? (report.summary.finalAmount / report.totalOrders).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0"}`
                }
            ];

            summaryData.forEach((item, i) => {
                const itemY = doc.y + (i * 18);
                doc.fillColor("black").font("Helvetica").fontSize(10);
                doc.text(item.label, 50, itemY, { width: 150 });
                doc.font("Helvetica-Bold");
                doc.text(item.value, 220, itemY);
            });

            // ===== DATE RANGE =====
            doc.y += 120;
            const dateRange = report.dateRange !== "undefined - undefined"
                ? report.dateRange
                : `All time (as of ${moment().format("MMM DD, YYYY")})`;
            doc.font("Helvetica").fontSize(10).text(`Report Period: ${dateRange}`, 50, doc.y);

            // ===== TABLE =====
            doc.y += 35;
            doc.font("Helvetica-Bold").fontSize(12).text("ORDER DETAILS", 50, doc.y);
            doc.y += 20;

            const tableTop = doc.y;

            // FIXED: Adjusted column widths to fit within page boundaries (total width = 495)
            const columns = [
                { header: "Order ID", x: 50, width: 75 },      // Start at 50, width 75
                { header: "Date", x: 125, width: 65 },         // Start at 125, width 65  
                { header: "Payment", x: 190, width: 65 },      // Start at 190, width 65
                { header: "Items", x: 255, width: 40 },        // Start at 255, width 40
                { header: "MRP", x: 295, width: 65 },          // Start at 295, width 65
                { header: "Discount", x: 360, width: 65 },     // Start at 360, width 65
                { header: "Final", x: 425, width: 70 }         // Start at 425, width 70 (ends at 495)
            ];

            // Draw table header
            drawBox(50, tableTop, pageWidth, 25);
            doc.fillColor("black").font("Helvetica-Bold").fontSize(9);

            columns.forEach(col => {
                const align = ["MRP", "Discount", "Final", "Items"].includes(col.header) ? "center" : "left";
                doc.text(col.header, col.x + 5, tableTop + 8, {
                    width: col.width - 10,
                    align: align
                });
            });

            // ===== TABLE ROWS =====
            let currentY = tableTop + 30;
            const rowHeight = 25;

            report.orders.forEach((order) => {
                // Check if we need a new page
                if (currentY > doc.page.height - 100) {
                    doc.addPage();
                    currentY = 50;

                    // Redraw header on new page
                    drawBox(50, currentY, pageWidth, 25);
                    doc.fillColor("black").font("Helvetica-Bold").fontSize(9);
                    columns.forEach(col => {
                        const align = ["MRP", "Discount", "Final", "Items"].includes(col.header) ? "center" : "left";
                        doc.text(col.header, col.x + 5, currentY + 8, {
                            width: col.width - 10,
                            align: align
                        });
                    });
                    currentY += 30;
                }

                // Draw row border
                drawBox(50, currentY - 2, pageWidth, rowHeight);

                // Prepare data
                const paymentMethod = order.paymentMethod?.toUpperCase() || "N/A";
                const orderDate = moment(order.placedAt).format("DD/MM/YY");
                const discountAmount = order.coupon?.discountAmount || 0;

                // Draw row data
                doc.fillColor("black").font("Helvetica").fontSize(8);

                // Order ID - truncate if too long
                const orderId = order.orderId || "N/A";
                const truncatedOrderId = orderId.length > 11 ? orderId.substring(0, 11) + "..." : orderId;
                doc.text(truncatedOrderId, columns[0].x + 3, currentY + 6, {
                    width: columns[0].width - 6
                });

                // Date
                doc.text(orderDate, columns[1].x + 3, currentY + 6, {
                    width: columns[1].width - 6
                });

                // Payment Method - truncate if needed
                const truncatedPayment = paymentMethod.length > 7 ? paymentMethod.substring(0, 7) : paymentMethod;
                doc.text(truncatedPayment, columns[2].x + 3, currentY + 6, {
                    width: columns[2].width - 6
                });

                // Items Count
                doc.text(order.totalItems?.toString() || "0", columns[3].x + 3, currentY + 6, {
                    width: columns[3].width - 6,
                    align: "center"
                });

                // MRP
                doc.text(`₹${order.totalMRP?.toLocaleString() || order.totalAmount?.toLocaleString() || "0"}`, columns[4].x + 3, currentY + 6, {
                    width: columns[4].width - 6,
                    align: "right"
                });

                // Discount
                doc.text(`₹${discountAmount.toLocaleString()}`, columns[5].x + 3, currentY + 6, {
                    width: columns[5].width - 6,
                    align: "right"
                });

                // Final Amount - Now properly fits within boundaries
                doc.font("Helvetica-Bold");
                doc.text(`₹${order.grandTotal?.toLocaleString() || "0"}`, columns[6].x + 3, currentY + 6, {
                    width: columns[6].width - 6,
                    align: "right"
                });

                currentY += rowHeight;
            });

            // ===== FOOTER =====
            const footerY = doc.page.height - 50;
            drawLine(50, footerY - 15, pageWidth + 50, footerY - 15);
            doc.fontSize(8).fillColor("black").font("Helvetica")
                .text(`SHOPPI PVT LTD • Generated on ${moment().format("DD/MM/YYYY [at] HH:mm")}`, 50, footerY, {
                    width: pageWidth,
                    align: "center"
                });

            // ===== PAGE NUMBERS =====
            const totalPages = doc.bufferedPageRange().count;
            for (let i = 0; i < totalPages; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor("black").font("Helvetica")
                    .text(`Page ${i + 1} of ${totalPages}`, doc.page.width - 100, doc.page.height - 30, {
                        align: "right"
                    });
            }

            doc.end();

        } catch (err) {
            logger.error(err);
            res.status(500).json({
                error: "Failed to generate sales report",
                message: err.message
            });
        }
    },

    //@desc douwnload sales report in excel 
    //router GET /salesreport/excel/download
    downloadSalesReportExcel: async (req, res) => {
        try {
            const { startDate: startDateRaw, endDate: endDateRaw } = req.query;

            // Set default dates if not provided
            const defaultStartDate = startDateRaw || '2000-01-01';
            const defaultEndDate = endDateRaw || new Date().toISOString().split('T')[0];

            const report = await salesReportData(defaultStartDate, defaultEndDate);

            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Sales Report");

            // Title and summary section
            sheet.mergeCells("A1", "H1"); // Fixed: Changed from G1 to H1 for 8 columns
            sheet.getCell("A1").value = "SALES REPORT";
            sheet.getCell("A1").font = { size: 18, bold: true };
            sheet.getCell("A1").alignment = { horizontal: 'center' };

            // Add generated date
            sheet.mergeCells("A2", "H2"); // Fixed: Changed from G2 to H2 for 8 columns
            sheet.getCell("A2").value = `Generated on: ${new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}`;
            sheet.getCell("A2").alignment = { horizontal: 'center' };
            sheet.getCell("A2").font = { size: 10, italic: true };

            // Summary Cards
            sheet.getRow(4).values = [`Report Period: ${report.dateRange || `${defaultStartDate} - ${defaultEndDate}`}`];
            sheet.getCell("A4").font = { bold: true, size: 12 };

            sheet.getRow(5).values = [`Total Orders: ${report.totalOrders || 0}`];
            sheet.getCell("A5").font = { bold: true };

            sheet.getRow(6).values = [`Total Sales: ₹${(report.summary?.totalMRP || 0).toLocaleString('en-IN')}`];
            sheet.getCell("A6").font = { bold: true };

            // Fixed: Separate rows for different discount types
            sheet.getRow(7).values = [`Total Discount: ₹${((report.summary?.totalDiscount) || 0).toLocaleString('en-IN')}`];
            sheet.getCell("A7").font = { bold: true };

            sheet.getRow(8).values = [`Total Coupon Offer: ₹${(report.summary?.proportionalDiscount || 0).toLocaleString('en-IN')}`];
            sheet.getCell("A8").font = { bold: true };

            sheet.getRow(9).values = [`Final Revenue: ₹${(report.summary?.finalAmount || 0).toLocaleString('en-IN')}`];
            sheet.getCell("A9").font = { bold: true };

            const avgOrderValue = report.totalOrders ? (report.summary?.finalAmount || 0) / report.totalOrders : 0;
            sheet.getRow(10).values = [`Average Order Value: ₹${avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`];
            sheet.getCell("A10").font = { bold: true };

            // Table Header (starting from row 12)
            const headerRow = sheet.getRow(12); // Fixed: Changed from row 11 to 12
            headerRow.values = [
                "Order ID",
                "Customer Name",
                "Date",
                "Payment Method",
                "Total Amount",
                "Discount",
                "Coupon Offer", // Fixed: Proper formatting
                "Grand Total"
            ];

            // Style header row
            headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '2563eb' }
            };
            headerRow.height = 25;

            // Table Rows
            let rowIndex = 13; // Fixed: Start from row 13
            (report.orders || []).forEach((order) => {
                const row = sheet.addRow([
                    order.orderId || "N/A",
                    order.userName || "Unknown",
                    order.placedAt ? new Date(order.placedAt).toLocaleDateString('en-IN') : "N/A",
                    order.paymentMethod || "N/A",
                    order.totalMRP || 0,
                    (order.totalMRP - order.totalAmount) || 0, // Fixed: Added fallback
                    (order.coupon?.discountAmount || 0),
                    order.grandTotal || 0,
                ]);

                // Alternate row colors
                if (rowIndex % 2 === 0) {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'F8FAFC' }
                    };
                }

                // Format currency columns (Fixed: Updated column numbers)
                row.getCell(5).numFmt = '₹#,##0.00'; // Total Amount
                row.getCell(6).numFmt = '₹#,##0.00'; // Discount
                row.getCell(7).numFmt = '₹#,##0.00'; // Coupon Offer
                row.getCell(8).numFmt = '₹#,##0.00'; // Grand Total

                rowIndex++;
            });

            // Column formatting and widths (Fixed: Added width for 8th column)
            const columnWidths = [15, 25, 15, 18, 15, 15, 15, 15]; // Added width for Coupon Offer column
            sheet.columns.forEach((col, index) => {
                col.width = columnWidths[index] || 15;
            });

            // Add borders to all used cells (Fixed: Updated column count to 8)
            const lastRow = sheet.lastRow?.number || 12;
            for (let row = 1; row <= lastRow; row++) {
                for (let col = 1; col <= 8; col++) { // Fixed: Changed from 7 to 8 columns
                    const cell = sheet.getCell(row, col);
                    if (row >= 12) { // Fixed: Updated to row 12 for table start
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                    }
                }
            }

            // Summary totals at the bottom
            const summaryStartRow = lastRow + 2;
            sheet.getCell(summaryStartRow, 1).value = "SUMMARY";
            sheet.getCell(summaryStartRow, 1).font = { bold: true, size: 14 };

            // Fixed: Updated summary calculations and positions
            sheet.getCell(summaryStartRow + 1, 6).value = "Total Sales:";
            sheet.getCell(summaryStartRow + 1, 6).font = { bold: true };
            sheet.getCell(summaryStartRow + 1, 8).value = report.summary?.totalMRP || 0; // Fixed: Use totalMRP for total sales
            sheet.getCell(summaryStartRow + 1, 8).numFmt = '₹#,##0.00';
            sheet.getCell(summaryStartRow + 1, 8).font = { bold: true };

            sheet.getCell(summaryStartRow + 2, 6).value = "Total Discount:";
            sheet.getCell(summaryStartRow + 2, 6).font = { bold: true };
            sheet.getCell(summaryStartRow + 2, 8).value = ((report.summary?.totalDiscount) || 0) + (report.summary?.proportionalDiscount || 0); // Fixed: Combined all discounts
            sheet.getCell(summaryStartRow + 2, 8).numFmt = '₹#,##0.00';
            sheet.getCell(summaryStartRow + 2, 8).font = { bold: true };

            sheet.getCell(summaryStartRow + 3, 6).value = "Final Revenue:";
            sheet.getCell(summaryStartRow + 3, 6).font = { bold: true };
            sheet.getCell(summaryStartRow + 3, 8).value = report.summary?.finalAmount || 0;
            sheet.getCell(summaryStartRow + 3, 8).numFmt = '₹#,##0.00';
            sheet.getCell(summaryStartRow + 3, 8).font = { bold: true, color: { argb: '10b981' } };

            // Generate filename with date range (Fixed: Sanitize filename)
            const sanitizedStartDate = defaultStartDate.replace(/[:/\\?%*|"<>]/g, '-');
            const sanitizedEndDate = defaultEndDate.replace(/[:/\\?%*|"<>]/g, '-');
            const filename = `sales-report-${sanitizedStartDate}-to-${sanitizedEndDate}.xlsx`;

            // Send as download
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`); // Fixed: Added quotes around filename

            await workbook.xlsx.write(res);
            res.end();

        } catch (err) {
            console.error("Error generating Excel report:", err);
            res.status(500).json({
                error: "Failed to generate Excel report",
                message: err.message
            });
        }
    },
}

export default salesReportController;