import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();
  const formData = await request.formData();
  const files = formData.getAll("images").filter((value): value is File => value instanceof File);
  if (!files.length) return NextResponse.json({ error: "Select at least one image." }, { status: 400 });

  const uploadDir = path.join(process.cwd(), "public", "products", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const urls: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    await fs.writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    urls.push(`/products/uploads/${filename}`);
  }
  return NextResponse.json({ urls });
}
