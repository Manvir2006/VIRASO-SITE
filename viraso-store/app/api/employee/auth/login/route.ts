import { NextRequest, NextResponse } from "next/server";
import {
  getEmployeeByIdOrUsername,
  verifyPassword,
  recordLogin,
  getRoleById,
  type EmployeeRecord,
} from "@/lib/employee-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const loginId = (body.loginId || body.username || "").trim();
    const password = (body.password || "").trim();

    if (!loginId || !password) {
      return NextResponse.json({ error: "Please enter your Login ID and Password." }, { status: 400 });
    }

    const employee = await getEmployeeByIdOrUsername(loginId);
    if (!employee) {
      return NextResponse.json({ error: "Invalid Login ID or password." }, { status: 401 });
    }

    // Verify password hash
    const isValid = verifyPassword(password, employee.password_hash, employee.password_salt);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid Login ID or password." }, { status: 401 });
    }

    // Check status
    if (employee.status !== "Active" || employee.is_archived) {
      return NextResponse.json(
        { error: "Your employee account is currently inactive. Please contact HR or System Administrator." },
        { status: 403 }
      );
    }

    // Capture device and IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Web Browser";

    await recordLogin({
      employee_id: employee.employee_id,
      employee_name: employee.full_name,
      ip_address: ip,
      device: userAgent.slice(0, 100),
    });

    // Determine redirect
    let redirectUrl = "/admin/dashboard";
    const role = await getRoleById(employee.role_id);
    if (role?.default_redirect) {
      redirectUrl = role.default_redirect;
    } else {
      const lowerRole = employee.role_name.toLowerCase();
      if (lowerRole.includes("sales") || lowerRole.includes("order")) {
        redirectUrl = "/admin/orders";
      } else if (lowerRole.includes("support")) {
        redirectUrl = "/admin/complaints";
      } else if (lowerRole.includes("inventory")) {
        redirectUrl = "/admin/inventory";
      } else if (lowerRole.includes("hr")) {
        redirectUrl = "/admin/employees";
      } else if (lowerRole.includes("warranty")) {
        redirectUrl = "/admin/warranty";
      }
    }

    const response = NextResponse.json({
      success: true,
      message: `Welcome, ${employee.full_name}`,
      redirectUrl,
      mustChangePassword: employee.must_change_password,
      employee: {
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        role_name: employee.role_name,
        department: employee.department,
        email: employee.email,
      },
    });

    // Set secure employee session cookie
    const sessionData = JSON.stringify({
      employee_id: employee.employee_id,
      username: employee.username,
      role_id: employee.role_id,
      role_name: employee.role_name,
      full_name: employee.full_name,
    });

    response.cookies.set("viraso-employee-session", sessionData, {
      path: "/",
      httpOnly: false, // Accessible to client-side auth state
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Also grant admin access cookie so middleware allows entry to authorized admin modules
    response.cookies.set("viraso-admin-access", "granted", {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Employee login error:", error);
    return NextResponse.json({ error: "Authentication service error." }, { status: 500 });
  }
}
