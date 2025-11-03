"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Shield, X } from "lucide-react";
import AdminDashboardLayout from "@/app/dashboard/admin/page";

type Role = "Customer" | "Sales Rep" | "Estimator" | "Crew";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: Role;
}

const initialUsers: UserData[] = [
  { id: 1, name: "Ali Khan", email: "ali@example.com", role: "Customer" },
  { id: 2, name: "Sara Ahmed", email: "sara@example.com", role: "Sales Rep" },
  { id: 3, name: "Ahmed Raza", email: "ahmed@example.com", role: "Estimator" },
  { id: 4, name: "Ashan Ali", email: "ashan@example.com", role: "Crew" },
];

/**
 * Permissions mapped per role.
 * Edit these arrays to match your real permission model.
 */
const rolePermissions: Record<Role, string[]> = {
  Customer: [
    "View Proposals",
    "View Estimates",
    "View Invoices",
    "Make Payments",
    "View Job Status",
  ],
  "Sales Rep": [
    "Create Proposals",
    "Edit Proposals",
    "View Customers",
    "Assign Leads",
    "View Sales Reports",
  ],
  Estimator: [
    "Create Estimates",
    "Edit Estimates",
    "Approve Estimates",
    "View Material Costs",
    "Export Estimates",
  ],
  Crew: [
    "View Schedule",
    "Update Job Status",
    "Log Hours",
    "View Job Details",
    "Mark Job Complete",
  ],
};

export default function AssignRolesPage() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);

  // store per-user saved permissions (if any)
  const [userPermissions, setUserPermissions] = useState<Record<number, string[]>>(
    {}
  );

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<UserData | null>(null);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

  // update role in users list; also reset saved custom permissions for that user
  const handleRoleChange = (id: number, newRole: Role) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role: newRole } : user))
    );

    // If role changed, we remove previously saved custom permissions so modal shows default for new role.
    setUserPermissions((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      return next;
    });
  };

  // When user clicks "Assign Role" open the modal (permissions shown inside modal)
  const assignRole = (user: UserData) => {
    // 👇 Yahan API call lagani hai
    openPermissionsModal(user);
  };

  const openPermissionsModal = (user: UserData) => {
    // prefer any saved custom permissions, otherwise take defaults for the user's current role
    const saved = userPermissions[user.id];
    const base = saved && saved.length > 0 ? saved : rolePermissions[user.role] ?? [];
    setActiveUser(user);
    setTempPermissions([...base]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveUser(null);
    setTempPermissions([]);
  };

  // toggle a permission in the temp list
  const togglePermission = (perm: string) => {
    setTempPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  // save permissions for the user (simulate API call here)
  const savePermissions = () => {
    if (!activeUser) return;
    setUserPermissions((prev) => ({ ...prev, [activeUser.id]: tempPermissions }));
    // example console + alert; replace with real API call
    console.log(
      `Saved permissions for ${activeUser.name} (${activeUser.email}):`,
      tempPermissions
    );
    alert(`Permissions updated for ${activeUser.name}`);
    closeModal();
  };

  // reset temp permissions to role defaults
  const resetToRoleDefaults = () => {
    if (!activeUser) return;
    setTempPermissions([...rolePermissions[activeUser.role]]);
  };

  // close modal on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeUser]);

  return (
    <AdminDashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <header className="flex items-center gap-2">
          <Shield className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Assign User Roles</h1>
        </header>

        {/* Users Table */}
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="w-full bg-white rounded-lg overflow-hidden min-w-[1000px]">
            <thead className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-bold">User</th>
                <th className="px-4 py-3 text-left font-bold">Email</th>
                <th className="px-4 py-3 text-left font-bold">Role</th>
                <th className="px-4 py-3 text-left font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-none border-gray-300 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 flex items-center gap-2">
                    <User className="text-gray-500" size={18} />
                    {user.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      className="border border-gray-300 outline-none cursor-pointer rounded-md px-3 py-1 text-sm focus:border focus:border-teal-500"
                    >
                      <option value="Customer">Customer</option>
                      <option value="Sales Rep">Sales Rep</option>
                      <option value="Estimator">Estimator</option>
                      <option value="Crew">Crew</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => assignRole(user)}
                      className="px-4 py-1 cursor-pointer text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Assign Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal: Permissions */}
        {isModalOpen && activeUser && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
          >
            {/* overlay */}
            <div
              className="fixed inset-0 bg-black/40"
              onClick={closeModal}
              aria-hidden="true"
            />

            {/* modal content */}
            <motion.div
              className="relative z-50 w-full max-w-2xl mx-4"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.20 }}
            >
              <div
                className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Permissions for {activeUser.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Role: <span className="font-medium">{activeUser.role}</span>
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    aria-label="Close permissions modal"
                    className="p-2 cursor-pointer rounded-md hover:bg-gray-100 focus:outline-none"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  <p className="text-sm text-gray-600 mb-4">
                    Toggle permissions related to the role. These changes are local
                    until you save.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(rolePermissions[activeUser.role] ?? []).map((perm) => {
                      const checked = tempPermissions.includes(perm);
                      return (
                        <label
                          key={perm}
                          className={`flex items-center gap-3 p-3 rounded-lg border border-gray-300 ${
                            checked ? "border-teal-500 bg-teal-50" : "border-gray-200"
                          } cursor-pointer`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(perm)}
                            className=" h-4 w-4 cursor-pointer"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {perm}
                            </div>
                            <div className="text-xs text-gray-500">
                              {/* small helper text can go here if needed */}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-300">
                  <button
                    onClick={resetToRoleDefaults}
                    className="px-3 cursor-pointer py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Reset to Role Defaults
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 cursor-pointer text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePermissions}
                    className="px-4 py-2 cursor-pointer text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save Permissions
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AdminDashboardLayout>
  );
}
