import crypto from "crypto";

export interface CashfreeOrderInput {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  returnUrl?: string;
  orderNote?: string;
}

export interface CashfreeOrderResponse {
  cfOrderId: string;
  orderId: string;
  paymentSessionId: string;
  orderStatus: string;
}

export function isCashfreeConfigured(): boolean {
  const appId = (process.env.CASHFREE_APP_ID || "").trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || "").trim();

  const isPlaceholder =
    appId.includes("YOUR_") ||
    appId.includes("replace") ||
    secretKey.includes("YOUR_") ||
    secretKey.includes("replace");

  return appId.length > 0 && secretKey.length > 0 && !isPlaceholder;
}

export function getCashfreeEnv(): "sandbox" | "production" {
  const env = (process.env.CASHFREE_ENV || process.env.NEXT_PUBLIC_CASHFREE_ENV || "sandbox").toLowerCase().trim();
  return env === "production" ? "production" : "sandbox";
}

export function getCashfreeBaseUrl(): string {
  return getCashfreeEnv() === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

export function getCashfreeHeaders(): Record<string, string> {
  const appId = process.env.CASHFREE_APP_ID || "";
  const secretKey = process.env.CASHFREE_SECRET_KEY || "";
  const apiVersion = process.env.CASHFREE_API_VERSION || "2023-08-01";

  return {
    "Content-Type": "application/json",
    "x-api-version": apiVersion,
    "x-client-id": appId,
    "x-client-secret": secretKey,
  };
}

/**
 * Creates an order on Cashfree and generates a payment_session_id.
 */
export async function createCashfreeOrder(input: CashfreeOrderInput): Promise<CashfreeOrderResponse> {
  if (!isCashfreeConfigured()) {
    throw new Error(
      "Cashfree API keys are not configured. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env.local"
    );
  }

  // Format and sanitize phone: Cashfree expects 10 digits
  const rawDigits = input.customerPhone.replace(/[^0-9]/g, "");
  const phone10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits.padStart(10, "9");

  // Format customer ID: alphanumeric, underscores, hyphens, up to 50 chars
  const customerId = `CUST_${phone10}_${Date.now().toString(36)}`.slice(0, 50);

  // Format order ID: letters, digits, _, -, max 50 chars
  const cleanOrderId = input.orderId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 45);

  const payload: any = {
    order_id: cleanOrderId,
    order_amount: Number(Math.max(1, input.orderAmount).toFixed(2)),
    order_currency: input.orderCurrency || "INR",
    customer_details: {
      customer_id: customerId,
      customer_name: (input.customerName || "Customer").trim().slice(0, 100),
      customer_email: (input.customerEmail || "sales@viraso.in").trim(),
      customer_phone: phone10,
    },
    order_note: (input.orderNote || "Viraso Sewing Machine Store").slice(0, 150),
  };

  if (input.returnUrl) {
    payload.order_meta = {
      return_url: input.returnUrl,
    };
  }

  const baseUrl = getCashfreeBaseUrl();
  const response = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: getCashfreeHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Cashfree Error (${response.status}): ${JSON.stringify(data)}`;
    console.error("Cashfree Order Creation Failed:", {
      status: response.status,
      data,
    });
    throw new Error(errorMsg);
  }

  return {
    cfOrderId: String(data.cf_order_id || ""),
    orderId: String(data.order_id || cleanOrderId),
    paymentSessionId: String(data.payment_session_id || ""),
    orderStatus: String(data.order_status || "ACTIVE"),
  };
}

/**
 * Fetches order details from Cashfree.
 */
export async function getCashfreeOrder(orderId: string) {
  if (!isCashfreeConfigured()) return null;

  const baseUrl = getCashfreeBaseUrl();
  const cleanId = encodeURIComponent(orderId.trim());

  const response = await fetch(`${baseUrl}/orders/${cleanId}`, {
    method: "GET",
    headers: getCashfreeHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    console.warn(`Cashfree getCashfreeOrder(${orderId}) returned ${response.status}:`, data);
    return null;
  }

  return response.json();
}

/**
 * Fetches payments made for an order from Cashfree.
 */
export async function getCashfreeOrderPayments(orderId: string) {
  if (!isCashfreeConfigured()) return [];

  const baseUrl = getCashfreeBaseUrl();
  const cleanId = encodeURIComponent(orderId.trim());

  const response = await fetch(`${baseUrl}/orders/${cleanId}/payments`, {
    method: "GET",
    headers: getCashfreeHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    console.warn(`Cashfree getCashfreeOrderPayments(${orderId}) returned ${response.status}:`, data);
    return [];
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Verifies if an order has been successfully paid on Cashfree.
 */
export async function verifyCashfreePaymentStatus(orderId: string): Promise<{
  isPaid: boolean;
  orderStatus?: string;
  cfPaymentId?: string;
  paymentDetails?: any;
  message?: string;
}> {
  if (!isCashfreeConfigured()) {
    return {
      isPaid: false,
      message: "Cashfree is not configured in environment.",
    };
  }

  const payments = await getCashfreeOrderPayments(orderId);

  // Look for any successful transaction in payments list
  const successfulPayment = payments.find(
    (p: any) => String(p.payment_status || "").toUpperCase() === "SUCCESS"
  );

  if (successfulPayment) {
    return {
      isPaid: true,
      orderStatus: "PAID",
      cfPaymentId: String(successfulPayment.cf_payment_id || ""),
      paymentDetails: successfulPayment,
    };
  }

  // Fallback: check order status directly
  const orderDetails = await getCashfreeOrder(orderId);
  if (orderDetails && String(orderDetails.order_status || "").toUpperCase() === "PAID") {
    return {
      isPaid: true,
      orderStatus: "PAID",
      cfPaymentId: String(orderDetails.cf_order_id || ""),
      paymentDetails: orderDetails,
    };
  }

  const lastPayment = payments.length > 0 ? payments[payments.length - 1] : null;
  return {
    isPaid: false,
    orderStatus: orderDetails?.order_status || lastPayment?.payment_status || "PENDING",
    cfPaymentId: lastPayment ? String(lastPayment.cf_payment_id || "") : undefined,
    paymentDetails: lastPayment,
    message: lastPayment?.payment_message || "Payment has not been completed yet.",
  };
}

/**
 * Verifies Cashfree webhook signature.
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string
): boolean {
  const secretKey =
    process.env.CASHFREE_WEBHOOK_SECRET || process.env.CASHFREE_SECRET_KEY || "";

  if (!secretKey || !signature || !timestamp) {
    return false;
  }

  try {
    const signatureData = timestamp + rawBody;
    const computedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(signatureData)
      .digest("base64");

    const computedBuffer = Buffer.from(computedSignature);
    const signatureBuffer = Buffer.from(signature);

    if (computedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuffer, signatureBuffer);
  } catch (err) {
    console.error("Cashfree webhook signature verification error:", err);
    return false;
  }
}
