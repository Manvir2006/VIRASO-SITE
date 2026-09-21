import { NextRequest, NextResponse } from "next/server";
import { getEmployeeByIdOrUsername, updateEmployee } from "@/lib/employee-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const employeeId = body.employee_id || body.username;
    const newPassword = body.new_password;
    const confirmPassword = body.confirm_password;

    if (!employeeId || !newPassword) {
      return NextResponse.json({ error: "Employee ID and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const employee = await getEmployeeByIdOrUsername(employeeId);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    await updateEmployee(employee.id, {
      password: newPassword,
      must_change_password: false,
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully. You can now continue.",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Failed to change password." }, { status: 500 });
  }
}
