import { NextRequest, NextResponse } from "next/server";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  listActivityLogs,
} from "@/lib/employee-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

function sanitizeEmployee(emp: any) {
  const { password_hash, password_salt, ...safe } = emp;
  return safe;
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const roleFilter = searchParams.get("role");
    const departmentFilter = searchParams.get("department");
    const statusFilter = searchParams.get("status");
    const id = searchParams.get("id");

    let items = await listEmployees(false);

    if (id) {
      const match = items.find((e) => e.id === id || e.employee_id.toLowerCase() === id.toLowerCase());
      if (!match) return NextResponse.json({ error: "Employee not found." }, { status: 404 });
      const logs = await listActivityLogs(match.employee_id);
      return NextResponse.json({ employee: sanitizeEmployee(match), logs });
    }

    if (statusFilter && statusFilter !== "All") {
      items = items.filter((e) => e.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (roleFilter && roleFilter !== "All") {
      items = items.filter(
        (e) => e.role_id === roleFilter || e.role_name.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    if (departmentFilter && departmentFilter !== "All") {
      items = items.filter(
        (e) => e.department.toLowerCase() === departmentFilter.toLowerCase()
      );
    }

    if (search) {
      items = items.filter(
        (e) =>
          e.employee_id.toLowerCase().includes(search) ||
          e.full_name.toLowerCase().includes(search) ||
          e.mobile.includes(search) ||
          e.department.toLowerCase().includes(search) ||
          e.designation.toLowerCase().includes(search) ||
          e.username.toLowerCase().includes(search) ||
          e.email.toLowerCase().includes(search)
      );
    }

    const stats = await getEmployeeStats();

    return NextResponse.json({
      employees: items.map(sanitizeEmployee),
      stats,
    });
  } catch (error: any) {
    console.error("Admin list employees error:", error);
    return NextResponse.json({ error: "Failed to fetch employees." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  try {
    const body = await request.json();

    if (!body.full_name || !body.mobile || !body.email || !body.department || !body.designation || !body.date_of_joining || !body.username || !body.password || !body.role_id) {
      return NextResponse.json(
        { error: "Please fill all required employee fields." },
        { status: 400 }
      );
    }

    const newEmp = await createEmployee({
      full_name: body.full_name,
      photo_url: body.photo_url,
      mobile: body.mobile,
      email: body.email,
      department: body.department,
      designation: body.designation,
      date_of_joining: body.date_of_joining,
      salary: body.salary,
      work_location: body.work_location,
      username: body.username,
      password: body.password,
      role_id: body.role_id,
      status: body.status || "Active",
    });

    return NextResponse.json({ employee: sanitizeEmployee(newEmp) }, { status: 201 });
  } catch (error: any) {
    console.error("Admin create employee error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create employee." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  try {
    const body = await request.json();
    const id = body.id || body.employee_id;

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }

    const updated = await updateEmployee(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    return NextResponse.json({ employee: sanitizeEmployee(updated) });
  } catch (error: any) {
    console.error("Admin update employee error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update employee." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || searchParams.get("employee_id");
    const reason = searchParams.get("reason") || "Deleted by admin";

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }

    const ok = await deleteEmployee(id, reason);
    if (!ok) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Employee deleted successfully." });
  } catch (error: any) {
    console.error("Admin delete employee error:", error);
    return NextResponse.json({ error: "Failed to delete employee." }, { status: 500 });
  }
}
