'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Shield, User, UserMinus, Search } from 'lucide-react';

interface Employee {
  id: string;
  employeeId: string | null;
  department: string | null;
  isAdmin: boolean;
  status: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

interface EmployeeTableProps {
  employees: Employee[];
  onRemove: (userId: string) => void;
  onToggleAdmin: (userId: string, isAdmin: boolean) => void;
  onUpdateDepartment: (userId: string, department: string) => void;
}

export function EmployeeTable({
  employees,
  onRemove,
  onToggleAdmin,
  onUpdateDepartment,
}: EmployeeTableProps) {
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptValue, setDeptValue] = useState('');

  const filteredEmployees = employees.filter((emp) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      emp.user.name.toLowerCase().includes(term) ||
      emp.user.email.toLowerCase().includes(term) ||
      (emp.department && emp.department.toLowerCase().includes(term))
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDeptEdit = (emp: Employee) => {
    setEditingDeptId(emp.id);
    setDeptValue(emp.department || '');
  };

  const handleDeptSave = (userId: string) => {
    onUpdateDepartment(userId, deptValue);
    setEditingDeptId(null);
  };

  return (
    <div className="bg-white dark:bg-storm/20 rounded-xl shadow-sm border border-storm/10 overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-storm/10 dark:border-foam/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-storm/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/20 focus:ring-2 focus:ring-ocean dark:focus:ring-sky"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-storm/5 dark:bg-foam/5">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-storm/70 dark:text-foam/70">
                Employee
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-storm/70 dark:text-foam/70">
                Department
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-storm/70 dark:text-foam/70">
                Role
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-storm/70 dark:text-foam/70">
                Joined
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-storm/70 dark:text-foam/70">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-storm/10 dark:divide-foam/10">
            {filteredEmployees.map((emp) => (
              <motion.tr
                key={emp.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-storm/5 dark:hover:bg-foam/5"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-ocean/20 dark:bg-sky/20 flex items-center justify-center">
                      {emp.user.avatarUrl ? (
                        <img
                          src={emp.user.avatarUrl}
                          alt={emp.user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-ocean dark:text-sky">
                          {emp.user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-ocean dark:text-sky">
                        {emp.user.name}
                      </p>
                      <p className="text-xs text-storm/60 dark:text-foam/60">
                        {emp.user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {editingDeptId === emp.id ? (
                    <input
                      type="text"
                      value={deptValue}
                      onChange={(e) => setDeptValue(e.target.value)}
                      onBlur={() => handleDeptSave(emp.user.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDeptSave(emp.user.id)}
                      className="px-2 py-1 border border-storm/20 rounded text-sm w-32"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => handleDeptEdit(emp)}
                      className="text-sm text-storm/70 dark:text-foam/70 hover:text-ocean dark:hover:text-sky"
                    >
                      {emp.department || 'Set department'}
                    </button>
                  )}
                </td>
                <td className="py-3 px-4">
                  {emp.isAdmin ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-ocean/10 dark:bg-sky/10 text-ocean dark:text-sky px-2 py-1 rounded-full">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-storm/10 text-storm/70 dark:text-foam/70 px-2 py-1 rounded-full">
                      <User className="w-3 h-3" />
                      Member
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-storm/60 dark:text-foam/60">
                  {formatDate(emp.joinedAt)}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === emp.id ? null : emp.id)}
                      className="p-1 hover:bg-storm/10 dark:hover:bg-foam/10 rounded"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === emp.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-storm/90 rounded-lg shadow-lg border border-storm/10 z-10">
                        <button
                          onClick={() => {
                            onToggleAdmin(emp.user.id, !emp.isAdmin);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-storm/5 dark:hover:bg-foam/5 flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4" />
                          {emp.isAdmin ? 'Remove admin' : 'Make admin'}
                        </button>
                        <button
                          onClick={() => {
                            onRemove(emp.user.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 flex items-center gap-2"
                        >
                          <UserMinus className="w-4 h-4" />
                          Remove employee
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 text-storm/50 dark:text-foam/50">
            {search ? 'No employees match your search' : 'No employees yet'}
          </div>
        )}
      </div>
    </div>
  );
}
