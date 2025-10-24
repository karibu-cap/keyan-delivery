import { verifySession } from "@/lib/auth-server"
import { formatOrderId } from "@/lib/orders-utils"
import { prisma } from "@/lib/prisma"
import jsPDF from 'jspdf'
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ orderId: string }> }
) {
  try {
    const params = await props.params
    // Authenticate user
    const token = await verifySession()

    if (!token?.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: token.user.id },
      select: { id: true, name: true, email: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Fetch order
    const order = await prisma.order.findFirst({
      where: {
        id: params.orderId,
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                price: true,
              },
            },
          },
        },
        merchant: {
          select: {
            businessName: true,
            address: true,
            phone: true,
          },
        },
        payment: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Generate HTML receipt
    const receiptHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Order Receipt - ${order.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #0aad0a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #0aad0a;
          margin: 0;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 10px;
          color: #0aad0a;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .label {
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .total-row {
          font-weight: bold;
          font-size: 18px;
          color: #0aad0a;
        }
        .footer {
          text-align: center;
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #0aad0a;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Order Receipt</h1>
        <p>Order #${formatOrderId(order.id)}</p>
        <p>${new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      <div class="section">
        <div class="section-title">Customer Information</div>
        <div class="info-row">
          <span class="label">Name:</span>
          <span>${user.name || "N/A"}</span>
        </div>
        <div class="info-row">
          <span class="label">Email:</span>
          <span>${user.email || "N/A"}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Merchant Information</div>
        <div class="info-row">
          <span class="label">Name:</span>
          <span>${order.merchant.businessName}</span>
        </div>
        ${order.merchant.address ? `
          <div class="info-row">
            <span class="label">Address:</span>
            <span>${order.merchant.address}</span>
          </div>
        ` : ""}
        ${order.merchant.phone ? `
          <div class="info-row">
            <span class="label">Phone:</span>
            <span>${order.merchant.phone}</span>
          </div>
        ` : ""}
      </div>

      <div class="section">
        <div class="section-title">Delivery Information</div>
        <div class="info-row">
          <span class="label">Notes:</span>
          <span>${order.deliveryInfo.additionalNotes}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Order Items</div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item) => `
              <tr>
                <td>${item.product.title}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Order Summary</div>
        <div class="info-row">
          <span class="label">Subtotal:</span>
          <span>$${order.orderPrices.subtotal.toFixed(2)}</span>
        </div>
        <div class="info-row">
          <span class="label">Delivery Fee:</span>
          <span>$${order.orderPrices.deliveryFee.toFixed(2)}</span>
        </div>
        ${order.orderPrices.discount > 0 ? `
          <div class="info-row">
            <span class="label">Discount:</span>
            <span>-$${order.orderPrices.discount.toFixed(2)}</span>
          </div>
        ` : ""}
        <div class="info-row total-row">
          <span class="label">Total:</span>
          <span>$${order.orderPrices.total.toFixed(2)}</span>
        </div>
      </div>

      ${order.payment ? `
        <div class="section">
          <div class="section-title">Payment Information</div>
          <div class="info-row">
            <span class="label">Method:</span>
            <span class="capitalize">${order.payment.gateway}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="capitalize">${order.payment.status}</span>
          </div>
        </div>
      ` : ""}

      <div class="footer">
        <p>Thank you for your order!</p>
        <p>For any questions, please contact the merchant directly.</p>
      </div>
    </body>
  </html>
`

    // Generate PDF from HTML using jsPDF
    const pdf = new jsPDF()

    // For server-side, we'll create a simple text-based PDF
    // since jsPDF doesn't handle complex HTML well in Node.js environment
    let yPosition = 20
    const lineHeight = 7
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20

    pdf.setFontSize(20)
    pdf.setTextColor(10, 173, 10) // #0aad0a color
    pdf.text('Order Receipt', margin, yPosition)
    yPosition += lineHeight * 2

    pdf.setFontSize(12)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Order #${formatOrderId(order.id)}`, margin, yPosition)
    yPosition += lineHeight
    pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, margin, yPosition)
    yPosition += lineHeight * 2

    // Customer Information
    pdf.setFontSize(14)
    pdf.setTextColor(10, 173, 10)
    pdf.text('Customer Information', margin, yPosition)
    yPosition += lineHeight * 1.5

    pdf.setFontSize(11)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Name: ${user.name || "N/A"}`, margin, yPosition)
    yPosition += lineHeight
    pdf.text(`Email: ${user.email || "N/A"}`, margin, yPosition)
    yPosition += lineHeight * 2

    // Merchant Information
    pdf.setFontSize(14)
    pdf.setTextColor(10, 173, 10)
    pdf.text('Merchant Information', margin, yPosition)
    yPosition += lineHeight * 1.5

    pdf.setFontSize(11)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Name: ${order.merchant.businessName}`, margin, yPosition)
    yPosition += lineHeight
    if (order.merchant.address) {
      pdf.text(`Address: ${order.merchant.address}`, margin, yPosition)
      yPosition += lineHeight
    }
    if (order.merchant.phone) {
      pdf.text(`Phone: ${order.merchant.phone}`, margin, yPosition)
      yPosition += lineHeight
    }
    yPosition += lineHeight

    // Order Items Table
    pdf.setFontSize(14)
    pdf.setTextColor(10, 173, 10)
    pdf.text('Order Items', margin, yPosition)
    yPosition += lineHeight * 1.5

    // Table headers
    pdf.setFontSize(11)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Item', margin, yPosition)
    pdf.text('Qty', 120, yPosition)
    pdf.text('Price', 150, yPosition)
    pdf.text('Total', 180, yPosition)
    yPosition += lineHeight

    // Table rows
    order.items.forEach((item) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage()
        yPosition = 20
      }
      pdf.text(item.product.title.substring(0, 25), margin, yPosition)
      pdf.text(item.quantity.toString(), 120, yPosition)
      pdf.text(`$${item.price.toFixed(2)}`, 150, yPosition)
      pdf.text(`$${(item.price * item.quantity).toFixed(2)}`, 180, yPosition)
      yPosition += lineHeight
    })

    yPosition += lineHeight

    // Order Summary
    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.setFontSize(14)
    pdf.setTextColor(10, 173, 10)
    pdf.text('Order Summary', margin, yPosition)
    yPosition += lineHeight * 1.5

    pdf.setFontSize(11)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Subtotal: $${order.orderPrices.subtotal.toFixed(2)}`, margin, yPosition)
    yPosition += lineHeight
    pdf.text(`Delivery Fee: $${order.orderPrices.deliveryFee.toFixed(2)}`, margin, yPosition)
    yPosition += lineHeight
    if (order.orderPrices.discount > 0) {
      pdf.text(`Discount: -$${order.orderPrices.discount.toFixed(2)}`, margin, yPosition)
      yPosition += lineHeight
    }

    // Total (highlighted)
    pdf.setFontSize(16)
    pdf.setTextColor(10, 173, 10)
    pdf.text(`Total: $${order.orderPrices.total.toFixed(2)}`, margin, yPosition)
    yPosition += lineHeight * 2

    // Payment Information (if available)
    if (order.payment && yPosition < pageHeight - 40) {
      pdf.setFontSize(14)
      pdf.setTextColor(10, 173, 10)
      pdf.text('Payment Information', margin, yPosition)
      yPosition += lineHeight * 1.5

      pdf.setFontSize(11)
      pdf.setTextColor(0, 0, 0)
      pdf.text(`Method: ${order.payment.gateway}`, margin, yPosition)
      yPosition += lineHeight
      pdf.text(`Status: ${order.payment.status}`, margin, yPosition)
      yPosition += lineHeight
    }

    // Footer
    if (yPosition > pageHeight - 30) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text('Thank you for your order!', margin, yPosition)
    yPosition += lineHeight
    pdf.text('For any questions, please contact the merchant directly.', margin, yPosition)

    // Convert PDF to buffer
    const pdfBuffer = pdf.output('arraybuffer')

    // Return PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="order-${formatOrderId(order.id)}-receipt.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating receipt:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export const runtime = "nodejs"