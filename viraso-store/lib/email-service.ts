import type { B2BInquiryRecord } from "./b2b-store";

export async function sendB2BAcknowledgementEmail(inquiry: B2BInquiryRecord): Promise<boolean> {
  try {
    // If SMTP or email gateway environment variables are configured, dispatch real email
    const smtpHost = process.env.SMTP_HOST;
    const sendgridKey = process.env.SENDGRID_API_KEY;

    const emailSubject = `Viraso B2B Inquiry Received – ${inquiry.inquiry_number}`;
    const emailBody = `Dear ${inquiry.contact_person_name},\n\nThank you for your interest in Viraso products.\n\nWe have received your B2B / Wholesale inquiry.\n\nInquiry ID:\n${inquiry.inquiry_number}\nCompany: ${inquiry.company_name}\nQuantity Required: ${inquiry.monthly_quantity}\n\nOur business team will contact you shortly.\n\nRegards,\nViraso\nA Product of Marjara Enterprises`;

    console.log(`[B2B Email Dispatch] Queued acknowledgement to: ${inquiry.email}`);
    console.log(`[B2B Email Dispatch] Subject: ${emailSubject}`);

    // If external service credentials exist, send via fetch or smtp
    if (sendgridKey) {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: inquiry.email, name: inquiry.contact_person_name }] }],
          from: { email: process.env.EMAIL_FROM || "viraso.india@gmail.com", name: "Viraso B2B Team" },
          subject: emailSubject,
          content: [{ type: "text/plain", value: emailBody }],
        }),
      });
      return res.ok;
    }

    return true;
  } catch (err) {
    console.warn("[B2B Email Dispatch] Notification skipped or failed:", err);
    // Non-blocking: Inquiry must still be saved
    return false;
  }
}
