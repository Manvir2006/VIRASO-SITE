export type RolePermissionKey =
  // Dashboard
  | "view_dashboard"
  // Orders
  | "view_orders"
  | "create_orders"
  | "edit_orders"
  | "delete_orders"
  // Products
  | "view_products"
  | "add_products"
  | "edit_products"
  | "delete_products"
  // Inventory
  | "view_inventory"
  | "update_stock"
  // Customers
  | "view_customers"
  | "edit_customers"
  // B2B Inquiry
  | "view_b2b"
  | "edit_b2b"
  | "delete_b2b"
  // Complaints
  | "view_complaints"
  | "reply_complaints"
  | "close_complaints"
  // Warranty
  | "view_warranty"
  | "approve_warranty"
  | "reject_warranty"
  // Employees
  | "view_employees"
  | "add_employees"
  | "edit_employees"
  | "delete_employees"
  // Reports
  | "view_reports"
  | "export_reports"
  // Settings
  | "view_settings"
  | "edit_settings";

export type RoleDefinition = {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  default_redirect: string;
  permissions: Record<RolePermissionKey, boolean>;
  created_at: string;
  updated_at: string;
};

export type EmployeeRecord = {
  id: string;
  employee_id: string;
  full_name: string;
  photo_url?: string;
  mobile: string;
  email: string;
  department: string;
  designation: string;
  date_of_joining: string;
  salary?: string | number;
  work_location?: string;
  username: string;
  password_hash: string;
  password_salt: string;
  role_id: string;
  role_name: string;
  status: "Active" | "Inactive";
  must_change_password: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
  deleted_at?: string;
};

export type ActivityLogRecord = {
  id: string;
  employee_id: string;
  employee_name: string;
  login_time: string;
  logout_time?: string;
  ip_address: string;
  device: string;
  last_active: string;
};

// All permission keys list with labels & groups
export const PERMISSION_GROUPS: {
  group: string;
  permissions: { key: RolePermissionKey; label: string }[];
}[] = [
  {
    group: "Dashboard",
    permissions: [{ key: "view_dashboard", label: "View Dashboard" }],
  },
  {
    group: "Orders",
    permissions: [
      { key: "view_orders", label: "View Orders" },
      { key: "create_orders", label: "Create Orders" },
      { key: "edit_orders", label: "Edit Orders" },
      { key: "delete_orders", label: "Delete Orders" },
    ],
  },
  {
    group: "Products",
    permissions: [
      { key: "view_products", label: "View Products" },
      { key: "add_products", label: "Add Products" },
      { key: "edit_products", label: "Edit Products" },
      { key: "delete_products", label: "Delete Products" },
    ],
  },
  {
    group: "Inventory",
    permissions: [
      { key: "view_inventory", label: "View Inventory" },
      { key: "update_stock", label: "Update Stock" },
    ],
  },
  {
    group: "Customers",
    permissions: [
      { key: "view_customers", label: "View Customers" },
      { key: "edit_customers", label: "Edit Customers" },
    ],
  },
  {
    group: "B2B Inquiry",
    permissions: [
      { key: "view_b2b", label: "View B2B Inquiries" },
      { key: "edit_b2b", label: "Edit B2B Inquiries" },
      { key: "delete_b2b", label: "Delete B2B Inquiries" },
    ],
  },
  {
    group: "Complaints",
    permissions: [
      { key: "view_complaints", label: "View Complaints" },
      { key: "reply_complaints", label: "Reply Complaints" },
      { key: "close_complaints", label: "Close Complaints" },
    ],
  },
  {
    group: "Warranty",
    permissions: [
      { key: "view_warranty", label: "View Warranty" },
      { key: "approve_warranty", label: "Approve Warranty" },
      { key: "reject_warranty", label: "Reject Warranty" },
    ],
  },
  {
    group: "Employees",
    permissions: [
      { key: "view_employees", label: "View Employees" },
      { key: "add_employees", label: "Add Employee" },
      { key: "edit_employees", label: "Edit Employee" },
      { key: "delete_employees", label: "Delete Employee" },
    ],
  },
  {
    group: "Reports",
    permissions: [
      { key: "view_reports", label: "View Reports" },
      { key: "export_reports", label: "Export Reports" },
    ],
  },
  {
    group: "Settings",
    permissions: [
      { key: "view_settings", label: "View Settings" },
      { key: "edit_settings", label: "Edit Settings" },
    ],
  },
];

const allPermKeys = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key));

export function buildPermissionsMap(activeKeys: RolePermissionKey[]): Record<RolePermissionKey, boolean> {
  const map = {} as Record<RolePermissionKey, boolean>;
  for (const k of allPermKeys) {
    map[k] = activeKeys.includes(k);
  }
  return map;
}

// 10 Predefined Roles
export const defaultRoles: RoleDefinition[] = [
  {
    id: "role_super_admin",
    name: "Super Admin",
    description: "Unrestricted master administrative access to all modules and configurations.",
    is_system: true,
    default_redirect: "/admin/dashboard",
    permissions: buildPermissionsMap(allPermKeys),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "role_admin",
    name: "Admin",
    description: "General administration access with full operational privileges.",
    is_system: true,
    default_redirect: "/admin/dashboard",
    permissions: buildPermissionsMap(allPermKeys),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "role_sales_manager",
    name: "Sales Manager",
    description: "Dedicated sales, order booking, and wholesale B2B management.",
    is_system: true,
    default_redirect: "/admin/orders",
    permissions: buildPermissionsMap([
      "view_dashboard",
      "view_orders",
      "create_orders",
      "edit_orders",
      "view_products",
      "view_inventory",
      "view_customers",
      "edit_customers",
      "view_b2b",
      "edit_b2b",
      "view_reports",
    ]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "role_order_manager",
    name: "Order Manager",
    description: "Order processing, packaging, dispatch, and courier shipment tracking.",
    is_system: true,
    default_redirect: "/admin/orders",
    permissions: buildPermissionsMap([
      "view_dashboard",
      "view_orders",
      "create_orders",
      "edit_orders",
      "view_products",
      "view_inventory",
      "view_customers",
    ]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "role_customer_support",
    name: "Customer Support",
    description: "Support desk, product inquiries, complaints resolution, and CRM records.",
    is_system: true,
    default_redirect: "/admin/complaints",
    permissions: buildPermissionsMap([
      "view_customers",
      "view_complaints",
      "reply_complaints",
      "close_complaints",
      "view_warranty",
    ]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "role_inventory_manager",
    name: "Inventory Manager",
    description: "Warehouse stock management, incoming units, reservations, and product catalog.",
    is_system: true,
    default_redirect: "/admin/inventory",
    permissions: buildPermissionsMap([
      "view_products",
      "view_inventory",
      "update_stock",
    ]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "role_warranty_executive",
    name: "Warranty Executive",
    description: "Product registrations, serial verification, claim approvals, and warranty policies.",
    is_system: true,
    default_redirect: "/admin/warranty",
    permissions: buildPermissionsMap([
      "view_warranty",
      "approve_warranty",
      "reject_warranty",
      "view_complaints",
    ]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "role_accounts",
    name: "Accounts",
    description: "Financial overview, revenue tracking, payment verification, and reports.",
    is_system: true,
    default_redirect: "/admin/dashboard",
    permissions: buildPermissionsMap([
      "view_dashboard",
      "view_orders",
      "view_reports",
      "export_reports",
    ]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "role_hr",
    name: "HR",
    description: "Employee records, roles assignment, credentials management, and activity logs.",
    is_system: true,
    default_redirect: "/admin/employees",
    permissions: buildPermissionsMap([
      "view_employees",
      "add_employees",
      "edit_employees",
      "delete_employees",
    ]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "role_custom",
    name: "Custom Role",
    description: "Fully customizable permission set for specialized personnel.",
    is_system: false,
    default_redirect: "/admin/dashboard",
    permissions: buildPermissionsMap(["view_dashboard"]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
