import { NextRequest, NextResponse } from "next/server";
import { recordLogout } from "@/lib/employee-store";

export async function POST(request: NextRequest) {
  try {
    const rawSession = request.cookies.get("viraso-employee-session")?.value;
    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession);
        if (parsed.employee_id) {
          await recordLogout(parsed.employee_id);
        }
      } catch {}
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    response.cookies.delete("viraso-employee-session");
    response.cookies.delete("viraso-admin-access");
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: true });
  }
}
