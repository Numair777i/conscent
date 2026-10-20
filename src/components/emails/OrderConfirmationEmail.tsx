import * as React from "react";

interface OrderItemPayload {
  name: string;
  size?: string;
  qty: number;
  price: number;
}

interface ShippingAddressPayload {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  items: OrderItemPayload[];
  totalAmount: number;
  shippingAddress: ShippingAddressPayload;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderId,
  customerName,
  items,
  totalAmount,
  shippingAddress,
}) => {
  const trackUrl = `https://conscentfragrances.com/track?orderId=${encodeURIComponent(orderId)}`;

  return (
    <div
      style={{
        fontFamily: "Helvetica, Arial, sans-serif",
        backgroundColor: "#0a0a0a",
        color: "#f5f5f5",
        padding: "40px 16px",
        margin: "0",
      }}
    >
      <table
        align="center"
        border={0}
        cellPadding={0}
        cellSpacing={0}
        width="100%"
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#141414",
          borderRadius: "8px",
          border: "1px solid #262626",
          overflow: "hidden",
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: "32px" }}>
              {/* Brand Header */}
              <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        borderBottom: "1px solid #262626",
                        paddingBottom: "20px",
                      }}
                    >
                      <h1
                        style={{
                          fontSize: "26px",
                          fontWeight: 900,
                          letterSpacing: "0.15em",
                          margin: "0 0 6px 0",
                          color: "#ffffff",
                        }}
                      >
                        CONS<span style={{ color: "#e11d48" }}>CENT</span>
                      </h1>
                      <p
                        style={{
                          margin: "0",
                          color: "#a3a3a3",
                          fontSize: "13px",
                        }}
                      >
                        Scent you can&apos;t say no to.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Greeting */}
              <div style={{ padding: "24px 0 16px 0" }}>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: "0 0 10px 0",
                    color: "#ffffff",
                  }}
                >
                  Order Confirmed #{orderId}
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: "#d4d4d4",
                    margin: "0",
                  }}
                >
                  Hey {customerName}, we&apos;ve received your order. Your
                  bottle is being prepared and will be dispatched from our New
                  Delhi hub via surface express within 24 to 48 business hours.
                </p>
              </div>

              {/* Line Items Table */}
              <table
                width="100%"
                border={0}
                cellPadding={0}
                cellSpacing={0}
                style={{
                  borderTop: "1px solid #262626",
                  borderBottom: "1px solid #262626",
                  margin: "16px 0 24px 0",
                }}
              >
                <thead>
                  <tr
                    style={{
                      color: "#737373",
                      fontSize: "12px",
                      textTransform: "uppercase",
                    }}
                  >
                    <th align="left" style={{ padding: "12px 0 8px 0" }}>
                      Item
                    </th>
                    <th align="center" style={{ padding: "12px 0 8px 0" }}>
                      Qty
                    </th>
                    <th align="right" style={{ padding: "12px 0 8px 0" }}>
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderTop: "1px solid #1f1f1f",
                        fontSize: "14px",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 0",
                          color: "#ffffff",
                          fontWeight: 500,
                        }}
                      >
                        {item.name}
                        {item.size && (
                          <span
                            style={{
                              color: "#a3a3a3",
                              fontSize: "12px",
                              display: "block",
                            }}
                          >
                            Size: {item.size}
                          </span>
                        )}
                      </td>
                      <td
                        align="center"
                        style={{ padding: "12px 0", color: "#a3a3a3" }}
                      >
                        {item.qty}
                      </td>
                      <td
                        align="right"
                        style={{ padding: "12px 0", color: "#ffffff" }}
                      >
                        ₹{item.price.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 2-Column Summary: Address & Total (Email-Safe Table) */}
              <table
                width="100%"
                border={0}
                cellPadding={0}
                cellSpacing={0}
                style={{ marginBottom: "28px" }}
              >
                <tbody>
                  <tr>
                    <td valign="top" width="60%">
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "#737373",
                          fontWeight: 600,
                        }}
                      >
                        Shipping Address
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#d4d4d4",
                          lineHeight: "1.4",
                        }}
                      >
                        {shippingAddress.address}
                        <br />
                        {shippingAddress.city}, {shippingAddress.state} -{" "}
                        {shippingAddress.pincode}
                      </p>
                    </td>
                    <td valign="top" width="40%" align="right">
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "#737373",
                          fontWeight: 600,
                        }}
                      >
                        Total Paid
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "20px",
                          fontWeight: "bold",
                          color: "#ffffff",
                        }}
                      >
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Tracking Button CTA */}
              <table
                width="100%"
                border={0}
                cellPadding={0}
                cellSpacing={0}
                style={{ marginBottom: "32px" }}
              >
                <tbody>
                  <tr>
                    <td align="center">
                      <a
                        href={trackUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          backgroundColor: "#e11d48",
                          color: "#ffffff",
                          fontSize: "13px",
                          fontWeight: 600,
                          textDecoration: "none",
                          padding: "12px 28px",
                          borderRadius: "4px",
                          display: "inline-block",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Track Order Status →
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Footer */}
              <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td
                      align="center"
                      style={{
                        borderTop: "1px solid #262626",
                        paddingTop: "20px",
                        fontSize: "12px",
                        color: "#737373",
                        lineHeight: "1.5",
                      }}
                    >
                      <p style={{ margin: "0 0 6px 0" }}>
                        Questions? Reply directly to this email or reach us at{" "}
                        <a
                          href="mailto:support@conscentfragrances.com"
                          style={{ color: "#e11d48", textDecoration: "none" }}
                        >
                          support@conscentfragrances.com
                        </a>
                      </p>
                      <p style={{ margin: 0 }}>
                        © 2026 CONSCENT Fragrances. Zakir Nagar, Okhla, New
                        Delhi - 110025.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
