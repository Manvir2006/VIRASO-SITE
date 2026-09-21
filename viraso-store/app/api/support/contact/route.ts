import { NextRequest, NextResponse } from "next/server";
import { createEnquiry } from "@/lib/support-store";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, mobile, email, subject, message } = data || {};

    if (!name || !mobile || !email || !subject || !message) {
      return NextResponse.json({ error: "All enquiry fields are required." }, { status: 400 });
    }

    const enquiry = await createEnquiry({
      name: String(name),
      mobile: String(mobile),
      email: String(email),
      subject: String(subject),
      message: String(message),
    });

    return NextResponse.json({ enquiry }, { status: 200 });
  } catch (error) {
    console.error("Contact enquiry error:", error);
    return NextResponse.json({ error: "Failed to send enquiry." }, { status: 500 });
  }
}
