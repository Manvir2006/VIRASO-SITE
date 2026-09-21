import { NextRequest, NextResponse } from "next/server";
import { createRegistration, type RegistrationInput } from "@/lib/product-registration-store";

const requiredFields: (keyof RegistrationInput)[] = [
  "serialNumber",
  "customerName",
  "mobile",
  "pinCode",
  "city",
  "state",
  "locality",
  "purchaseDate",
  "categoryId",
  "productId",
  "dealerName",
  "dealerCity",
];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<RegistrationInput>;
    for (const field of requiredFields) {
      if (!String(body[field] || "").trim()) {
        return NextResponse.json({ error: `${field} is required.` }, { status: 400 });
      }
    }

    if (!/^\d{10}$/.test(String(body.mobile))) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }
    if (body.email && !/^\S+@\S+\.\S+$/.test(body.email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!/^\d{6}$/.test(String(body.pinCode))) {
      return NextResponse.json({ error: "Enter a valid 6-digit PIN code." }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.purchaseDate))) {
      return NextResponse.json({ error: "Enter a valid purchase date." }, { status: 400 });
    }

    const registration = await createRegistration({
      serialNumber: String(body.serialNumber),
      customerName: String(body.customerName),
      mobile: String(body.mobile),
      email: String(body.email || ""),
      pinCode: String(body.pinCode),
      city: String(body.city),
      state: String(body.state),
      locality: String(body.locality),
      purchaseDate: String(body.purchaseDate),
      categoryId: String(body.categoryId),
      productId: String(body.productId),
      dealerName: String(body.dealerName),
      dealerCity: String(body.dealerCity),
    });

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register product.";
    return NextResponse.json({ error: message }, { status: message.includes("already registered") ? 409 : 500 });
  }
}
