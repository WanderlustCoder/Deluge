'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Plus, UserPlus } from 'lucide-react';
import { EmployeeTable } from '@/components/corporate/employee-table';
import { InviteEmployeesModal } from '@/components/corporate/invite-employees-modal';

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

export default function EmployeesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, [slug]);

  const loadEmployees = async () => {
    try {
      const res = await fetch(`/api/corporate/${slug}/employees`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this employee from your corporate account?')) return;

    try {
      const res = await fetch(`/api/corporate/${slug}/employees?userId=${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setEmployees(employees.filter((e) => e.user.id !== userId));
      }
    } catch (error) {
      console.error('Failed to remove employee:', error);
    }
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      const res = await fetch(`/api/corporate/${slug}/employees`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin }),
      });

      if (res.ok) {
        setEmployees(
          employees.map((e) =>
            e.user.id === userId ? { ...e, isAdmin } : e
          )
        );
      }
    } catch (error) {
      console.error('Failed to update admin status:', error);
    }
  };

  const handleUpdateDepartment = async (userId: string, department: string) => {
    try {
      const res = await fetch(`/api/corporate/${slug}/employees`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, department }),
      });

      if (res.ok) {
        setEmployees(
          employees.map((e) =>
            e.user.id === userId ? { ...e, department } : e
          )
        );
      }
    } catch (error) {
      console.error('Failed to update department:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-border/50 rounded-xl p-8 animate-pulse">
        <div className="h-10 bg-gray-100 rounded w-1/4 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-ocean dark:text-sky">
            Employees
          </h1>
          <p className="text-storm-light dark:text-dark-text-secondary">
            {employees.length} employee{employees.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <UserPlus className="w-4 h-4" />
          Invite Employees
        </button>
      </motion.div>

      {/* Employee Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {employees.length === 0 ? (
          <div className="bg-white dark:bg-dark-border/50 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-ocean/10 dark:bg-sky/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-ocean dark:text-sky" />
            </div>
            <h3 className="text-lg font-medium text-ocean dark:text-sky mb-2">
              No Employees Yet
            </h3>
            <p className="text-storm-light dark:text-dark-text-secondary mb-6">
              Start by inviting your team members to join
            </p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Invite Employees
            </button>
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            onRemove={handleRemove}
            onToggleAdmin={handleToggleAdmin}
            onUpdateDepartment={handleUpdateDepartment}
          />
        )}
      </motion.div>

      <InviteEmployeesModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        slug={slug}
        onSuccess={loadEmployees}
      />
    </div>
  );
}
