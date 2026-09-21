import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export * from "./employee-types";
import {
  RolePermissionKey,
  RoleDefinition,
  EmployeeRecord,
  ActivityLogRecord,
  PERMISSION_GROUPS,
  defaultRoles,
} from "./employee-types";

const dataDir = path.join(process.cwd(), "data", "employees");
const employeesFile = path.join(dataDir, "employees.json");
const rolesFile = path.join(dataDir, "roles.json");
const activityFile = path.join(dataDir, "activity.json");

// Password hashing helper
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, s, 1000, 64, "sha512").toString("hex");
  return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return check === hash;
}

export function generateRandomPassword(length = 10): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}



// Seed Employees
const seedAdminPass = hashPassword("Viraso2026@");
const seedSalesPass = hashPassword("VirasoSales@2026");
const seedSupportPass = hashPassword("VirasoSupport@2026");

const defaultEmployees: EmployeeRecord[] = [
  {
    id: "emp_1",
    employee_id: "EMP0001",
    full_name: "Viraso Master Admin",
    mobile: "9876543210",
    email: "admin@viraso.in",
    department: "Management",
    designation: "General Administrator",
    date_of_joining: "2024-01-01",
    salary: "₹85,000 / month",
    work_location: "Ludhiana Head Office",
    username: "admin",
    password_hash: seedAdminPass.hash,
    password_salt: seedAdminPass.salt,
    role_id: "role_super_admin",
    role_name: "Super Admin",
    status: "Active",
    must_change_password: false,
    created_at: "2024-01-01T09:00:00.000Z",
    updated_at: "2024-01-01T09:00:00.000Z",
    is_archived: false,
  },
  {
    id: "emp_2",
    employee_id: "EMP0002",
    full_name: "Kavita Sharma",
    mobile: "9811223344",
    email: "kavita.sales@viraso.in",
    department: "Sales & Marketing",
    designation: "Sales Manager",
    date_of_joining: "2025-03-15",
    salary: "₹45,000 / month",
    work_location: "Ludhiana Head Office",
    username: "kavita.sales",
    password_hash: seedSalesPass.hash,
    password_salt: seedSalesPass.salt,
    role_id: "role_sales_manager",
    role_name: "Sales Manager",
    status: "Active",
    must_change_password: false,
    created_at: "2025-03-15T09:00:00.000Z",
    updated_at: "2025-03-15T09:00:00.000Z",
    is_archived: false,
  },
  {
    id: "emp_3",
    employee_id: "EMP0003",
    full_name: "Vikram Malhotra",
    mobile: "9872112233",
    email: "vikram.support@viraso.in",
    department: "Customer Support",
    designation: "Support Executive",
    date_of_joining: "2025-06-01",
    salary: "₹35,000 / month",
    work_location: "Delhi Branch",
    username: "vikram.support",
    password_hash: seedSupportPass.hash,
    password_salt: seedSupportPass.salt,
    role_id: "role_customer_support",
    role_name: "Customer Support",
    status: "Active",
    must_change_password: false,
    created_at: "2025-06-01T09:00:00.000Z",
    updated_at: "2025-06-01T09:00:00.000Z",
    is_archived: false,
  },
];

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(rolesFile);
  } catch {
    await fs.writeFile(rolesFile, JSON.stringify(defaultRoles, null, 2), "utf8");
  }

  try {
    await fs.access(employeesFile);
  } catch {
    await fs.writeFile(employeesFile, JSON.stringify(defaultEmployees, null, 2), "utf8");
  }

  try {
    await fs.access(activityFile);
  } catch {
    await fs.writeFile(activityFile, JSON.stringify([], null, 2), "utf8");
  }
}

// ROLES STORE
export async function listRoles(): Promise<RoleDefinition[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(rolesFile, "utf8");
    if (!raw) return defaultRoles;
    return JSON.parse(raw) as RoleDefinition[];
  } catch {
    return defaultRoles;
  }
}

export async function getRoleById(id: string): Promise<RoleDefinition | null> {
  const roles = await listRoles();
  return roles.find((r) => r.id === id) ?? null;
}

export async function updateRolePermissions(
  roleId: string,
  permissions: Partial<Record<RolePermissionKey, boolean>>,
  updates?: { name?: string; description?: string; default_redirect?: string }
): Promise<RoleDefinition | null> {
  const roles = await listRoles();
  const index = roles.findIndex((r) => r.id === roleId);
  if (index === -1) return null;

  const current = roles[index];
  const mergedPermissions = {
    ...current.permissions,
    ...permissions,
  };

  const updated: RoleDefinition = {
    ...current,
    ...updates,
    permissions: mergedPermissions,
    updated_at: new Date().toISOString(),
  };

  roles[index] = updated;
  await fs.writeFile(rolesFile, JSON.stringify(roles, null, 2), "utf8");
  return updated;
}

// EMPLOYEES STORE
export function generateNextEmployeeId(existing: EmployeeRecord[]): string {
  let maxNum = 0;
  for (const emp of existing) {
    if (emp.employee_id && emp.employee_id.startsWith("EMP")) {
      const parsed = parseInt(emp.employee_id.replace("EMP", ""), 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
  }
  const next = maxNum + 1;
  return `EMP${String(next).padStart(4, "0")}`;
}

export async function listEmployees(includeArchived = false): Promise<EmployeeRecord[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(employeesFile, "utf8");
    if (!raw) return defaultEmployees;
    const all = JSON.parse(raw) as EmployeeRecord[];
    const filtered = includeArchived ? all : all.filter((e) => !e.is_archived);
    return filtered.sort((a, b) => a.employee_id.localeCompare(b.employee_id));
  } catch {
    return defaultEmployees;
  }
}

export async function getEmployeeByIdOrUsername(idOrUsername: string): Promise<EmployeeRecord | null> {
  const employees = await listEmployees(true);
  const normalized = idOrUsername.trim().toLowerCase();
  return (
    employees.find(
      (e) =>
        e.id === idOrUsername ||
        e.employee_id.toLowerCase() === normalized ||
        e.username.toLowerCase() === normalized ||
        e.email.toLowerCase() === normalized
    ) ?? null
  );
}

export async function createEmployee(input: {
  full_name: string;
  photo_url?: string;
  mobile: string;
  email: string;
  department: string;
  designation: string;
  date_of_joining: string;
  salary?: string;
  work_location?: string;
  username: string;
  password: string;
  role_id: string;
  status?: "Active" | "Inactive";
}): Promise<EmployeeRecord> {
  const employees = await listEmployees(true);
  const roles = await listRoles();

  const cleanUsername = input.username.trim().toLowerCase();
  const cleanEmail = input.email.trim().toLowerCase();

  const duplicate = employees.find(
    (e) =>
      !e.is_archived &&
      (e.username.toLowerCase() === cleanUsername || e.email.toLowerCase() === cleanEmail)
  );
  if (duplicate) {
    throw new Error(
      duplicate.username.toLowerCase() === cleanUsername
        ? `Username "${input.username}" is already taken.`
        : `Email "${input.email}" is already registered with another employee.`
    );
  }

  const role = roles.find((r) => r.id === input.role_id) || roles[0];
  const { hash, salt } = hashPassword(input.password);
  const now = new Date().toISOString();
  const employeeId = generateNextEmployeeId(employees);

  const newEmp: EmployeeRecord = {
    id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    employee_id: employeeId,
    full_name: input.full_name.trim(),
    photo_url: input.photo_url?.trim() || undefined,
    mobile: input.mobile.trim(),
    email: cleanEmail,
    department: input.department.trim(),
    designation: input.designation.trim(),
    date_of_joining: input.date_of_joining.trim(),
    salary: input.salary?.trim() || undefined,
    work_location: input.work_location?.trim() || undefined,
    username: cleanUsername,
    password_hash: hash,
    password_salt: salt,
    role_id: role.id,
    role_name: role.name,
    status: input.status || "Active",
    must_change_password: false,
    created_at: now,
    updated_at: now,
    is_archived: false,
  };

  employees.push(newEmp);
  await fs.writeFile(employeesFile, JSON.stringify(employees, null, 2), "utf8");
  return newEmp;
}

export async function updateEmployee(
  id: string,
  updates: Partial<EmployeeRecord> & { password?: string }
): Promise<EmployeeRecord | null> {
  const employees = await listEmployees(true);
  const index = employees.findIndex(
    (e) => e.id === id || e.employee_id.toLowerCase() === id.trim().toLowerCase()
  );
  if (index === -1) return null;

  const current = employees[index];

  // If changing username or email, verify uniqueness
  if (updates.username && updates.username.toLowerCase() !== current.username.toLowerCase()) {
    const dup = employees.find(
      (e) => e.id !== current.id && !e.is_archived && e.username.toLowerCase() === updates.username!.toLowerCase()
    );
    if (dup) throw new Error(`Username "${updates.username}" is already in use.`);
  }

  if (updates.email && updates.email.toLowerCase() !== current.email.toLowerCase()) {
    const dup = employees.find(
      (e) => e.id !== current.id && !e.is_archived && e.email.toLowerCase() === updates.email!.toLowerCase()
    );
    if (dup) throw new Error(`Email "${updates.email}" is already in use.`);
  }

  // Update password if provided
  let newHash = current.password_hash;
  let newSalt = current.password_salt;
  if (updates.password && updates.password.trim()) {
    const hashed = hashPassword(updates.password.trim());
    newHash = hashed.hash;
    newSalt = hashed.salt;
  }

  // Sync role name if role_id changed
  let roleName = current.role_name;
  if (updates.role_id && updates.role_id !== current.role_id) {
    const roles = await listRoles();
    const r = roles.find((role) => role.id === updates.role_id);
    if (r) roleName = r.name;
  }

  const { password: _pw, ...cleanUpdates } = updates;

  const updated: EmployeeRecord = {
    ...current,
    ...cleanUpdates,
    employee_id: current.employee_id, // Employee ID cannot be changed
    password_hash: newHash,
    password_salt: newSalt,
    role_name: roleName,
    updated_at: new Date().toISOString(),
  };

  employees[index] = updated;
  await fs.writeFile(employeesFile, JSON.stringify(employees, null, 2), "utf8");
  return updated;
}

export async function resetEmployeePassword(
  employeeId: string,
  explicitPassword?: string
): Promise<{ employee: EmployeeRecord; newPasswordPlain: string }> {
  const employees = await listEmployees(true);
  const index = employees.findIndex(
    (e) => e.id === employeeId || e.employee_id.toLowerCase() === employeeId.trim().toLowerCase()
  );
  if (index === -1) throw new Error("Employee not found.");

  const newPasswordPlain = explicitPassword?.trim() || generateRandomPassword(10);
  const { hash, salt } = hashPassword(newPasswordPlain);
  const now = new Date().toISOString();

  employees[index] = {
    ...employees[index],
    password_hash: hash,
    password_salt: salt,
    must_change_password: true,
    updated_at: now,
  };

  await fs.writeFile(employeesFile, JSON.stringify(employees, null, 2), "utf8");
  return { employee: employees[index], newPasswordPlain };
}

export async function deleteEmployee(id: string, reason?: string): Promise<boolean> {
  const employees = await listEmployees(true);
  const index = employees.findIndex(
    (e) => e.id === id || e.employee_id.toLowerCase() === id.trim().toLowerCase()
  );
  if (index === -1) return false;

  const now = new Date().toISOString();
  employees[index] = {
    ...employees[index],
    is_archived: true,
    status: "Inactive",
    deleted_at: now,
    updated_at: now,
  };

  await fs.writeFile(employeesFile, JSON.stringify(employees, null, 2), "utf8");
  return true;
}

// ACTIVITY LOG STORE
export async function listActivityLogs(employeeId?: string): Promise<ActivityLogRecord[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(activityFile, "utf8");
    if (!raw) return [];
    const list = JSON.parse(raw) as ActivityLogRecord[];
    return employeeId
      ? list.filter((a) => a.employee_id.toLowerCase() === employeeId.toLowerCase())
      : list;
  } catch {
    return [];
  }
}

export async function recordLogin(input: {
  employee_id: string;
  employee_name: string;
  ip_address: string;
  device: string;
}): Promise<ActivityLogRecord> {
  await ensureStore();
  let list: ActivityLogRecord[] = [];
  try {
    const raw = await fs.readFile(activityFile, "utf8");
    if (raw) list = JSON.parse(raw);
  } catch {}

  const now = new Date().toISOString();
  const entry: ActivityLogRecord = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    employee_id: input.employee_id,
    employee_name: input.employee_name,
    login_time: now,
    ip_address: input.ip_address,
    device: input.device,
    last_active: now,
  };

  list.unshift(entry);
  if (list.length > 500) list = list.slice(0, 500); // keep recent 500 logs
  await fs.writeFile(activityFile, JSON.stringify(list, null, 2), "utf8");

  // Also update employee last_login
  const employees = await listEmployees(true);
  const empIdx = employees.findIndex((e) => e.employee_id === input.employee_id);
  if (empIdx !== -1) {
    employees[empIdx].last_login = now;
    await fs.writeFile(employeesFile, JSON.stringify(employees, null, 2), "utf8");
  }

  return entry;
}

export async function recordLogout(employeeId: string): Promise<void> {
  await ensureStore();
  try {
    const raw = await fs.readFile(activityFile, "utf8");
    if (!raw) return;
    const list = JSON.parse(raw) as ActivityLogRecord[];
    const now = new Date().toISOString();
    const active = list.find((a) => a.employee_id === employeeId && !a.logout_time);
    if (active) {
      active.logout_time = now;
      active.last_active = now;
      await fs.writeFile(activityFile, JSON.stringify(list, null, 2), "utf8");
    }
  } catch {}
}

export async function getEmployeeStats() {
  const employees = await listEmployees(false);
  const departments = new Set(employees.map((e) => e.department).filter(Boolean));
  return {
    total: employees.length,
    active: employees.filter((e) => e.status === "Active").length,
    inactive: employees.filter((e) => e.status === "Inactive").length,
    departmentsCount: departments.size,
  };
}
