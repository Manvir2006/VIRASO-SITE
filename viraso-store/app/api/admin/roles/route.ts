import { NextRequest, NextResponse } from "next/server";
import { listRoles, updateRolePermissions, PERMISSION_GROUPS, type RolePermissionKey } from "@/lib/employee-store";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-access";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  try {
    const roles = await listRoles();
    return NextResponse.json({ roles, permissionGroups: PERMISSION_GROUPS });
  } catch (error: any) {
    console.error("List roles error:", error);
    return NextResponse.json({ error: "Failed to fetch roles." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  try {
    const body = await request.json();
    const roleId = body.id || body.role_id;
    const permissions = body.permissions as Partial<Record<RolePermissionKey, boolean>>;

    if (!roleId) {
      return NextResponse.json({ error: "Role ID is required." }, { status: 400 });
    }

    const updated = await updateRolePermissions(roleId, permissions || {}, {
      name: body.name,
      description: body.description,
      default_redirect: body.default_redirect,
    });

    if (!updated) {
      return NextResponse.json({ error: "Role not found." }, { status: 404 });
    }

    return NextResponse.json({ role: updated });
  } catch (error: any) {
    console.error("Update role permissions error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update role." }, { status: 500 });
  }
}
