import { NextRequest, NextResponse } from "next/server";
import { resetEmployeePassword } from "@/lib/employee-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  try {
    const body = await request.json();
    const id = body.employee_id || body.id;
    const explicitPassword = body.password;

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }

    const { employee, newPasswordPlain } = await resetEmployeePassword(id, explicitPassword);

    return NextResponse.json({
      success: true,
      employee_id: employee.employee_id,
      full_name: employee.full_name,
      new_password: newPasswordPlain,
      message: "Password reset successfully. Employee must change password on next login.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: error?.message || "Failed to reset password." }, { status: 500 });
  }
}
