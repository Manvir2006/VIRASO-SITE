export type CourierIdentifierType = "viraso_order_id" | "courier_awb" | "page_only";

export type CourierPartner = {
  id: string;
  name: string;
  tracking_url: string;
  url_type: CourierIdentifierType;
  identifier_type: CourierIdentifierType;
  logo_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export function validateCourierUrl(url: string): { valid: boolean; error?: string } {
  const trimmed = url.trim();
  if (!trimmed) {
    return { valid: false, error: "Tracking URL is required." };
  }
  if (!trimmed.startsWith("https://")) {
    return { valid: false, error: "Tracking URL must start with https:// for security." };
  }
  const disallowedSchemes = ["javascript:", "data:", "file:", "vbscript:", "blob:"];
  for (const scheme of disallowedSchemes) {
    if (trimmed.toLowerCase().includes(scheme)) {
      return { valid: false, error: `Invalid URL scheme: ${scheme}` };
    }
  }
  try {
    const parsed = new URL(trimmed.replace("{TRACKING_ID}", "TEST12345"));
    if (parsed.protocol !== "https:") {
      return { valid: false, error: "Only https:// protocol is allowed." };
    }
  } catch {
    return { valid: false, error: "Please provide a valid URL format." };
  }
  return { valid: true };
}

export function resolveTrackingUrl(
  courier: CourierPartner,
  orderInfo: { orderNumber: string; trackingNumber?: string } | string
): string {
  const orderNumber = typeof orderInfo === "string" ? orderInfo : orderInfo.orderNumber;
  const trackingNumber = typeof orderInfo === "string" ? orderInfo : (orderInfo.trackingNumber || "");

  const idType = courier.identifier_type || (courier.url_type === "page_only" ? "page_only" : "courier_awb");

  if (idType === "page_only" || !courier.tracking_url) {
    return courier.tracking_url;
  }

  let valueToInsert = "";
  if (idType === "viraso_order_id") {
    valueToInsert = orderNumber.trim();
  } else {
    // "courier_awb"
    valueToInsert = trackingNumber.trim();
  }

  if (!valueToInsert) {
    // Fallback if no specific ID is yet stored
    return courier.tracking_url.replace(/\{TRACKING_ID\}/g, "");
  }

  const encoded = encodeURIComponent(valueToInsert);
  if (courier.tracking_url.includes("{TRACKING_ID}")) {
    return courier.tracking_url.replace(/\{TRACKING_ID\}/g, encoded);
  }

  if (courier.tracking_url.endsWith("/")) {
    return `${courier.tracking_url}${encoded}`;
  }
  return `${courier.tracking_url}/${encoded}`;
}
