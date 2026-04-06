import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

// Verify PayPal webhook signature
async function verifyWebhookSignature(
  requestBody: string,
  headers: Headers
): Promise<boolean> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID!;

  const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(requestBody),
    }),
  });

  return response.ok;
}

export async function POST(request: NextRequest) {
  try {
    const headers = request.headers;
    const rawBody = await request.text();

    // In sandbox mode, skip signature verification if no webhook ID is set
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (webhookId) {
      const isValid = await verifyWebhookSignature(rawBody, headers);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    console.log("PayPal webhook event:", event.event_type);

    switch (event.event_type) {
      case "CHECKOUT.ORDER.APPROVED":
        console.log("Order approved:", event.resource.id);
        break;

      case "PAYMENT.CAPTURE.COMPLETED":
        console.log("Payment completed:", event.resource.id);
        // TODO: Grant credits to user based on event.resource.custom_id
        break;

      case "PAYMENT.CAPTURE.DENIED":
        console.log("Payment denied:", event.resource.id);
        break;

      default:
        console.log("Unhandled event type:", event.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
