"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDeleteModal } from "@/components/admin-delete-modal";
import type {
  EmployeeRecord,
  RoleDefinition,
  RolePermissionKey,
  ActivityLogRecord,
} from "@/lib/employee-types";
import { PERMISSION_GROUPS } from "@/lib/employee-types";

const DEPARTMENTS = [
  "Management",
  "Sales & Marketing",
  "Customer Support",
  "Logistics & Warehouse",
  "Quality & Warranty",
  "Accounts & Finance",
  "Human Resources",
  "IT & Systems",
];

const LOCATIONS = [
  "Ludhiana Head Office",
  "Delhi Branch",
  "Warehouse & Factory",
  "Surat Office",
  "Remote",
];

export default function AdminEmployeesPage() {
  const [activeTab, setActiveTab] = useState<"employees" | "roles">("employees");

  // Data state
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    departmentsCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Add Employee Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [newForm, setNewForm] = useState({
    full_name: "",
    photo_url: "",
    mobile: "",
    email: "",
    department: "Sales & Marketing",
    designation: "",
    date_of_joining: new Date().toISOString().slice(0, 10),
    salary: "",
    work_location: "Ludhiana Head Office",
    username: "",
    password: "",
    confirm_password: "",
    role_id: "",
    status: "Active" as "Active" | "Inactive",
  });

  // View / Open Profile Modal
  const [viewEmployee, setViewEmployee] = useState<EmployeeRecord | null>(null);
  const [employeeLogs, setEmployeeLogs] = useState<ActivityLogRecord[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Edit Employee Modal
  const [editEmployee, setEditEmployee] = useState<EmployeeRecord | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EmployeeRecord>>({});

  // Reset Password Modal
  const [resetModalEmp, setResetModalEmp] = useState<EmployeeRecord | null>(null);
  const [customResetPass, setCustomResetPass] = useState("");
  const [generatedPassResult, setGeneratedPassResult] = useState("");
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Roles Tab State
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [rolePermissionsState, setRolePermissionsState] = useState<
    Record<RolePermissionKey, boolean>
  >({} as any);
  const [isSavingRole, setIsSavingRole] = useState(false);

  const key = () => window.sessionStorage.getItem("viraso-admin-key") || "";

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (roleFilter !== "All") params.set("role", roleFilter);
      if (departmentFilter !== "All") params.set("department", departmentFilter);
      if (statusFilter !== "All") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/employees?${params.toString()}`, {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load employees.");

      setEmployees(data.employees || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      setError(err.message || "Failed to load employees.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles", {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      if (res.ok && data.roles) {
        setRoles(data.roles);
        if (!selectedRole && data.roles.length > 0) {
          setSelectedRole(data.roles[0]);
          setRolePermissionsState(data.roles[0].permissions);
        }
        if (!newForm.role_id && data.roles.length > 0) {
          setNewForm((prev) => ({ ...prev, role_id: data.roles[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to load roles:", err);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadRoles();
  }, [roleFilter, departmentFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEmployees();
  };

  const openViewProfile = async (emp: EmployeeRecord) => {
    setViewEmployee(emp);
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`/api/admin/employees?id=${encodeURIComponent(emp.id)}`, {
        headers: { "x-admin-key": key() },
      });
      const data = await res.json();
      if (res.ok && data.logs) {
        setEmployeeLogs(data.logs);
      }
    } catch {
      setEmployeeLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const openEditModal = (emp: EmployeeRecord) => {
    setEditEmployee(emp);
    setEditForm({ ...emp });
  };

  const openResetPasswordModal = (emp: EmployeeRecord) => {
    setResetModalEmp(emp);
    setCustomResetPass("");
    setGeneratedPassResult("");
    setCopiedPass(false);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newForm.password !== newForm.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (newForm.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSavingNew(true);
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify(newForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create employee.");

      setAddModalOpen(false);
      setToast(`Employee ${data.employee.employee_id} (${data.employee.full_name}) created successfully.`);
      setTimeout(() => setToast(""), 4000);
      loadEmployees();

      // Reset form
      setNewForm({
        full_name: "",
        photo_url: "",
        mobile: "",
        email: "",
        department: "Sales & Marketing",
        designation: "",
        date_of_joining: new Date().toISOString().slice(0, 10),
        salary: "",
        work_location: "Ludhiana Head Office",
        username: "",
        password: "",
        confirm_password: "",
        role_id: roles[0]?.id || "",
        status: "Active",
      });
    } catch (err: any) {
      setError(err.message || "Failed to create employee.");
    } finally {
      setIsSavingNew(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployee) return;

    setIsSavingEdit(true);
    setError("");
    try {
      const res = await fetch("/api/admin/employees", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({ id: editEmployee.id, ...editForm }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update employee.");

      setEditEmployee(null);
      setToast(`Employee ${data.employee.employee_id} updated successfully.`);
      setTimeout(() => setToast(""), 4000);
      loadEmployees();

      if (viewEmployee && viewEmployee.id === editEmployee.id) {
        setViewEmployee(data.employee);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update employee.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleExecuteResetPassword = async () => {
    if (!resetModalEmp) return;
    setIsResettingPass(true);

    try {
      const res = await fetch("/api/admin/employees/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          employee_id: resetModalEmp.employee_id,
          password: customResetPass.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password.");

      setGeneratedPassResult(data.new_password);
      setToast("Password reset successfully.");
      setTimeout(() => setToast(""), 4000);
      loadEmployees();
    } catch (err: any) {
      alert(err.message || "Failed to reset password.");
    } finally {
      setIsResettingPass(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/admin/employees?id=${encodeURIComponent(deleteTarget.id)}&reason=Archived by admin`,
        {
          method: "DELETE",
          headers: { "x-admin-key": key() },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete employee.");

      setDeleteTarget(null);
      if (viewEmployee && viewEmployee.id === deleteTarget.id) {
        setViewEmployee(null);
      }
      setToast("Employee deleted successfully.");
      setTimeout(() => setToast(""), 4000);
      loadEmployees();
    } catch (err: any) {
      alert(err.message || "Failed to delete employee.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectRoleToEdit = (role: RoleDefinition) => {
    setSelectedRole(role);
    setRolePermissionsState(role.permissions);
  };

  const handleTogglePermission = (key: RolePermissionKey) => {
    setRolePermissionsState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return;
    setIsSavingRole(true);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key(),
        },
        body: JSON.stringify({
          id: selectedRole.id,
          permissions: rolePermissionsState,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save permissions.");

      setSelectedRole(data.role);
      setToast(`Permissions for role "${data.role.name}" updated successfully.`);
      setTimeout(() => setToast(""), 4000);
      loadRoles();
    } catch (err: any) {
      alert(err.message || "Failed to update role permissions.");
    } finally {
      setIsSavingRole(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Employees & Roles</h1>
          <p className="mt-1 text-xs text-slate-500">
            Enterprise human resources, granular permission matrix, authentication credentials, and employee workspaces.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/employee/login"
            target="_blank"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#0d2946] shadow-sm hover:bg-slate-50 transition"
          >
            Employee Login Portal ↗
          </Link>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="rounded-full bg-[#0d2946] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:bg-[#071d31] transition"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition border-b-2 ${
            activeTab === "employees"
              ? "border-[#0d2946] text-[#0d2946]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          1. All Employees ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition border-b-2 ${
            activeTab === "roles"
              ? "border-[#0d2946] text-[#0d2946]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          2. Roles & Permissions ({roles.length})
        </button>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 animate-in fade-in">
          ✓ {toast}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          ✕ {error}
        </div>
      )}

      {activeTab === "employees" && (
        <div className="space-y-6">
          {/* Summary Dashboard Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Employees</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{stats.total}</p>
              <p className="mt-1 text-[11px] text-slate-400">Registered on system</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Active Employees</p>
              <p className="mt-2 text-3xl font-black text-emerald-900">{stats.active}</p>
              <p className="mt-1 text-[11px] text-emerald-700">Authorized to sign in</p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-red-700">Inactive Employees</p>
              <p className="mt-2 text-3xl font-black text-red-900">{stats.inactive}</p>
              <p className="mt-1 text-[11px] text-red-600">Login deactivated</p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0d2946]">Departments</p>
              <p className="mt-2 text-3xl font-black text-[#0d2946]">{stats.departmentsCount}</p>
              <p className="mt-1 text-[11px] text-slate-500">Across company</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Search Employees
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID, name, phone, email, designation..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0d2946] px-4 py-2 text-xs font-bold text-white hover:bg-[#071d31]"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                >
                  <option value="All">All Roles</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-[#0d2946] focus:bg-white focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 font-black uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Employee</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Designation</th>
                    <th className="px-5 py-3.5">Mobile</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Joining Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 font-bold">
                        Loading employee records...
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No employees found matching your search.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {emp.photo_url ? (
                              <img
                                src={emp.photo_url}
                                alt={emp.full_name}
                                className="h-9 w-9 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d2946] text-[11px] font-bold text-white shadow-sm">
                                {getInitials(emp.full_name)}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{emp.full_name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] font-bold text-[#0d2946]">
                                  {emp.employee_id}
                                </span>
                                <span className="text-[10px] text-slate-400">@{emp.username}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {emp.department}
                        </td>

                        <td className="px-5 py-4 text-slate-700 font-medium">
                          {emp.designation}
                        </td>

                        <td className="px-5 py-4 font-mono text-slate-800 font-semibold">
                          {emp.mobile}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0d2946] border border-blue-100">
                            {emp.role_name}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              emp.status === "Active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-500 font-medium">
                          {emp.date_of_joining}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openViewProfile(emp)}
                              className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#0d2946] hover:bg-blue-100 transition"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => openEditModal(emp)}
                              className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openResetPasswordModal(emp)}
                              className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition"
                            >
                              Reset Pass
                            </button>
                            <button
                              onClick={() => setDeleteTarget(emp)}
                              className="rounded-lg border border-red-200 bg-white px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ROLES & PERMISSIONS TAB */}
      {activeTab === "roles" && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Roles list */}
          <div className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 px-1">
              Roles Directory ({roles.length})
            </h2>
            <div className="space-y-2">
              {roles.map((r) => {
                const isSelected = selectedRole?.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRoleToEdit(r)}
                    className={`w-full text-left rounded-2xl border p-4 transition shadow-sm ${
                      isSelected
                        ? "border-[#0d2946] bg-blue-50/60 ring-2 ring-[#0d2946]/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 text-sm">{r.name}</p>
                      {r.is_system && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                          Predefined
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{r.description}</p>
                    <p className="mt-2 text-[10px] font-mono text-slate-400">
                      Redirects to: <strong className="text-slate-700">{r.default_redirect}</strong>
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Permissions Matrix for selected role */}
          <div className="lg:col-span-2 space-y-6">
            {selectedRole ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900">{selectedRole.name}</h2>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-[#0d2946]">
                        Permissions Matrix
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{selectedRole.description}</p>
                  </div>

                  <button
                    type="button"
                    disabled={isSavingRole}
                    onClick={handleSaveRolePermissions}
                    className="rounded-full bg-[#0d2946] px-6 py-2 text-xs font-bold text-white hover:bg-[#071d31] disabled:opacity-60 shadow-sm"
                  >
                    {isSavingRole ? "Saving..." : "Save Role Permissions"}
                  </button>
                </div>

                {/* Granular Permission Groups */}
                <div className="space-y-6">
                  {PERMISSION_GROUPS.map((grp) => (
                    <div key={grp.group} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                        <h3 className="font-black text-xs uppercase tracking-wider text-[#0d2946]">
                          {grp.group} Module
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400">
                          {grp.permissions.filter((p) => rolePermissionsState[p.key]).length} /{" "}
                          {grp.permissions.length} Enabled
                        </span>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {grp.permissions.map((p) => {
                          const isEnabled = Boolean(rolePermissionsState[p.key]);
                          return (
                            <label
                              key={p.key}
                              className={`flex items-center justify-between gap-2 rounded-xl border p-3 cursor-pointer transition ${
                                isEnabled
                                  ? "border-emerald-200 bg-white shadow-xs"
                                  : "border-slate-200 bg-white/60 opacity-70"
                              }`}
                            >
                              <span className="text-xs font-semibold text-slate-800">{p.label}</span>
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={() => handleTogglePermission(p.key)}
                                className="h-4 w-4 rounded border-slate-300 text-[#0d2946] focus:ring-[#0d2946]"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isSavingRole}
                    onClick={handleSaveRolePermissions}
                    className="rounded-full bg-[#0d2946] px-7 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-[#071d31] disabled:opacity-60 shadow-md"
                  >
                    {isSavingRole ? "Saving Changes..." : "Save Role Permissions"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                Select a role on the left to configure permissions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">+ Add New Employee</h2>
                <p className="text-xs text-slate-500">
                  Employee ID will be auto-generated sequentially (e.g. EMP0004)
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="mt-6 space-y-6 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.full_name}
                    onChange={(e) => setNewForm({ ...newForm, full_name: e.target.value })}
                    placeholder="e.g. Rahul Mehta"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newForm.mobile}
                    onChange={(e) => setNewForm({ ...newForm, mobile: e.target.value })}
                    placeholder="10-digit mobile"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    placeholder="e.g. rahul@viraso.in"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newForm.department}
                    onChange={(e) => setNewForm({ ...newForm, department: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.designation}
                    onChange={(e) => setNewForm({ ...newForm, designation: e.target.value })}
                    placeholder="e.g. Executive, Lead, Specialist"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">
                    Date of Joining <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newForm.date_of_joining}
                    onChange={(e) => setNewForm({ ...newForm, date_of_joining: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Salary (Optional)</label>
                  <input
                    type="text"
                    value={newForm.salary}
                    onChange={(e) => setNewForm({ ...newForm, salary: e.target.value })}
                    placeholder="e.g. ₹40,000 / month"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Work Location</label>
                  <select
                    value={newForm.work_location}
                    onChange={(e) => setNewForm({ ...newForm, work_location: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Profile Photo URL (Optional)</label>
                  <input
                    type="url"
                    value={newForm.photo_url}
                    onChange={(e) => setNewForm({ ...newForm, photo_url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                {/* LOGIN CREDENTIALS SECTION */}
                <div className="sm:col-span-2 border-t border-slate-200 pt-3">
                  <h3 className="font-black text-xs uppercase tracking-wider text-[#0d2946] mb-3">
                    Login & Security Credentials
                  </h3>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">
                    Username / Login ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.username}
                    onChange={(e) => setNewForm({ ...newForm, username: e.target.value.toLowerCase() })}
                    placeholder="e.g. rahul.sales"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newForm.role_id}
                    onChange={(e) => setNewForm({ ...newForm, role_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newForm.password}
                    onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
                    placeholder="At least 6 chars"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newForm.confirm_password}
                    onChange={(e) => setNewForm({ ...newForm, confirm_password: e.target.value })}
                    placeholder="Repeat password"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Status</label>
                  <select
                    value={newForm.status}
                    onChange={(e) => setNewForm({ ...newForm, status: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="Active">Active (Can Login)</option>
                    <option value="Inactive">Inactive (Cannot Login)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingNew}
                  className="rounded-full bg-[#0d2946] px-6 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-[#071d31] disabled:opacity-60 shadow-sm"
                >
                  {isSavingNew ? "Saving..." : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPEN PROFILE MODAL */}
      {viewEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-4">
                {viewEmployee.photo_url ? (
                  <img
                    src={viewEmployee.photo_url}
                    alt={viewEmployee.full_name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0d2946] text-xl font-black text-white shadow-sm">
                    {getInitials(viewEmployee.full_name)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-[#0d2946]">
                      {viewEmployee.employee_id}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        viewEmployee.status === "Active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {viewEmployee.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">{viewEmployee.full_name}</h2>
                  <p className="text-xs text-slate-500">
                    {viewEmployee.designation} • {viewEmployee.department}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewEmployee(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Content Sections */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2 text-xs">
              {/* Personal Information */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5">
                <h3 className="font-black uppercase tracking-wider text-[#0d2946] border-b border-slate-100 pb-2">
                  Personal Information
                </h3>
                <div>
                  <span className="text-slate-400 block">Mobile:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{viewEmployee.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email:</span>
                  <span className="font-semibold text-slate-800">{viewEmployee.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Work Location:</span>
                  <span className="text-slate-700">{viewEmployee.work_location || "Not specified"}</span>
                </div>
              </div>

              {/* Employment Details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5">
                <h3 className="font-black uppercase tracking-wider text-[#0d2946] border-b border-slate-100 pb-2">
                  Employment Details
                </h3>
                <div>
                  <span className="text-slate-400 block">Department:</span>
                  <span className="font-bold text-slate-900">{viewEmployee.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Designation:</span>
                  <span className="text-slate-800 font-semibold">{viewEmployee.designation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date of Joining:</span>
                  <span className="text-slate-800">{viewEmployee.date_of_joining}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Salary / Compensation:</span>
                  <span className="font-bold text-slate-900">{viewEmployee.salary || "Confidential"}</span>
                </div>
              </div>

              {/* Role & Permissions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 sm:col-span-2">
                <h3 className="font-black uppercase tracking-wider text-[#0d2946] border-b border-slate-100 pb-2">
                  Role & Workspace Access
                </h3>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-400 block">Assigned Role:</span>
                    <span className="font-black text-sm text-[#0d2946]">{viewEmployee.role_name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("roles");
                      const matched = roles.find((r) => r.id === viewEmployee.role_id);
                      if (matched) handleSelectRoleToEdit(matched);
                      setViewEmployee(null);
                    }}
                    className="text-xs font-bold text-[#0d2946] hover:underline"
                  >
                    View Role Permissions Matrix →
                  </button>
                </div>
              </div>

              {/* Login Details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5">
                <h3 className="font-black uppercase tracking-wider text-[#0d2946] border-b border-slate-100 pb-2">
                  Login Credentials
                </h3>
                <div>
                  <span className="text-slate-400 block">Username / Login ID:</span>
                  <span className="font-mono font-bold text-slate-900">{viewEmployee.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Password Security:</span>
                  <span className="text-emerald-700 font-semibold">PBKDF2 SHA-512 Encrypted</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Last Active Login:</span>
                  <span className="text-slate-600">
                    {viewEmployee.last_login
                      ? new Date(viewEmployee.last_login).toLocaleString("en-IN")
                      : "Never logged in"}
                  </span>
                </div>
              </div>

              {/* Recent Activity Logs */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5">
                <h3 className="font-black uppercase tracking-wider text-[#0d2946] border-b border-slate-100 pb-2">
                  Recent Activity Log
                </h3>
                {isLoadingLogs ? (
                  <p className="text-slate-400">Loading activity history...</p>
                ) : employeeLogs.length === 0 ? (
                  <p className="text-slate-400 italic">No recent login sessions recorded.</p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {employeeLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="rounded-xl bg-slate-50 p-2 text-[11px] border border-slate-100">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{new Date(log.login_time).toLocaleString("en-IN")}</span>
                          <span className="font-mono text-slate-500">{log.ip_address}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{log.device}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${viewEmployee.mobile}`}
                  className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200"
                >
                  📞 Call
                </a>
                <a
                  href={`mailto:${viewEmployee.email}`}
                  className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200"
                >
                  ✉ Email
                </a>
                <button
                  type="button"
                  onClick={() => openResetPasswordModal(viewEmployee)}
                  className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100"
                >
                  Reset Password
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(viewEmployee)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={() => setViewEmployee(null)}
                  className="rounded-full bg-[#0d2946] px-6 py-2 text-xs font-bold text-white hover:bg-[#071d31]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {editEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Edit Employee ({editEmployee.employee_id})
                </h2>
                <p className="text-xs text-slate-500">Employee ID cannot be modified</p>
              </div>
              <button
                onClick={() => setEditEmployee(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-6 space-y-6 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.full_name || ""}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={editForm.mobile || ""}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Department</label>
                  <select
                    value={editForm.department || ""}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Designation</label>
                  <input
                    type="text"
                    required
                    value={editForm.designation || ""}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Date of Joining</label>
                  <input
                    type="date"
                    required
                    value={editForm.date_of_joining || ""}
                    onChange={(e) => setEditForm({ ...editForm, date_of_joining: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Salary</label>
                  <input
                    type="text"
                    value={editForm.salary || ""}
                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    placeholder="e.g. ₹45,000 / month"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Work Location</label>
                  <select
                    value={editForm.work_location || ""}
                    onChange={(e) => setEditForm({ ...editForm, work_location: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Role</label>
                  <select
                    value={editForm.role_id || ""}
                    onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Status</label>
                  <select
                    value={editForm.status || "Active"}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="Active">Active (Can Login)</option>
                    <option value="Inactive">Inactive (Cannot Login)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Profile Photo URL</label>
                  <input
                    type="url"
                    value={editForm.photo_url || ""}
                    onChange={(e) => setEditForm({ ...editForm, photo_url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setEditEmployee(null)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="rounded-full bg-[#0d2946] px-6 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-[#071d31] disabled:opacity-60 shadow-sm"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetModalEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-xl font-black text-slate-900">Reset Employee Password</h2>
              <button
                onClick={() => setResetModalEmp(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-600">
                Reset password for{" "}
                <strong className="text-slate-900">
                  {resetModalEmp.full_name} ({resetModalEmp.employee_id})
                </strong>
                .
              </p>

              {!generatedPassResult ? (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 uppercase block">
                      Custom Password (Leave blank to auto-generate):
                    </label>
                    <input
                      type="text"
                      value={customResetPass}
                      onChange={(e) => setCustomResetPass(e.target.value)}
                      placeholder="Optional custom password"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono focus:bg-white focus:outline-none"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    The employee will be required to change this password upon their first login.
                  </p>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetModalEmp(null)}
                      className="rounded-full border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isResettingPass}
                      onClick={handleExecuteResetPassword}
                      className="rounded-full bg-[#0d2946] px-5 py-2 font-bold text-white hover:bg-[#071d31] disabled:opacity-60"
                    >
                      {isResettingPass ? "Resetting..." : "Confirm Reset Password"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 animate-in fade-in">
                  <div className="text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      New Generated Password
                    </span>
                    <p className="mt-2 font-mono text-xl font-black text-slate-900 tracking-wider select-all">
                      {generatedPassResult}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassResult);
                      setCopiedPass(true);
                      setTimeout(() => setCopiedPass(false), 3000);
                    }}
                    className="w-full rounded-full bg-[#0d2946] py-2.5 text-xs font-bold text-white hover:bg-[#071d31]"
                  >
                    {copiedPass ? "✓ Copied Password!" : "Copy New Password"}
                  </button>

                  <p className="text-[11px] text-slate-500 text-center">
                    Share this temporary password securely with {resetModalEmp.full_name}.
                  </p>

                  <button
                    type="button"
                    onClick={() => setResetModalEmp(null)}
                    className="w-full rounded-full border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <AdminDeleteModal
          isOpen={true}
          title="Delete Employee?"
          itemType="Employee"
          itemName={`${deleteTarget.employee_id} - ${deleteTarget.full_name}`}
          itemId={deleteTarget.employee_id}
          consequences="This will archive the employee record and immediately revoke their login permissions."
          confirmLabel="Delete Employee"
          isLoading={isDeleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
