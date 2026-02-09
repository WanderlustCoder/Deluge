'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/i18n/formatting';

interface Automation {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  runCount: number;
  lastRunAt?: string;
  lastStatus?: string;
}

interface ScheduledTask {
  id: string;
  name: string;
  taskType: string;
  schedule: string;
  isActive: boolean;
  nextRunAt?: string;
  lastStatus?: string;
  failureCount: number;
}

interface PendingApproval {
  instance: {
    id: string;
    entityType: string;
    entityId: string;
    startedAt: string;
  };
  step: {
    name: string;
    type: string;
  };
}

export default function OperationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [autoRes, taskRes, approvalRes] = await Promise.all([
        fetch('/api/admin/automation?active=true'),
        fetch('/api/admin/tasks?active=true'),
        fetch('/api/admin/workflows?type=approvals'),
      ]);

      if (autoRes.ok) setAutomations(await autoRes.json());
      if (taskRes.ok) setTasks(await taskRes.json());
      if (approvalRes.ok) setApprovals(await approvalRes.json());
    } catch (error) {
      console.error('Error fetching operations data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunAutomation(id: string) {
    try {
      await fetch('/api/admin/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', automationId: id }),
      });
      fetchData();
    } catch (error) {
      console.error('Error running automation:', error);
    }
  }

  async function handleRunTask(id: string) {
    try {
      await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', taskId: id }),
      });
      fetchData();
    } catch (error) {
      console.error('Error running task:', error);
    }
  }

  async function handleApproval(instanceId: string, decision: string) {
    try {
      await fetch('/api/admin/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', instanceId, decision }),
      });
      fetchData();
    } catch (error) {
      console.error('Error submitting approval:', error);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const failedTasks = tasks.filter((t) => t.failureCount > 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Operations Dashboard
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Monitor and manage automations, workflows, and scheduled tasks
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Automations"
          value={automations.length}
          color="blue"
        />
        <StatCard
          label="Scheduled Tasks"
          value={tasks.length}
          color="green"
        />
        <StatCard
          label="Pending Approvals"
          value={approvals.length}
          color="yellow"
        />
        <StatCard
          label="Failed Tasks"
          value={failedTasks.length}
          color="red"
        />
      </div>

      {/* Pending Approvals */}
      {approvals.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pending Approvals
          </h2>
          <div className="space-y-3">
            {approvals.map((approval) => (
              <motion.div
                key={approval.instance.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {approval.step.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      {approval.instance.entityType}: {approval.instance.entityId}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproval(approval.instance.id, 'approved')}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(approval.instance.id, 'rejected')}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Failed Tasks Alert */}
      {failedTasks.length > 0 && (
        <section className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
            Tasks Requiring Attention
          </h2>
          <div className="space-y-2">
            {failedTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between">
                <span className="text-red-700 dark:text-red-400">
                  {task.name} - {task.failureCount} failure(s)
                </span>
                <button
                  onClick={() => handleRunTask(task.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Automations */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Automations
          </h2>
          <a
            href="/admin/automation"
            className="text-sm text-ocean hover:underline"
          >
            Manage All
          </a>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.slice(0, 6).map((auto) => (
            <div
              key={auto.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {auto.name}
                </h3>
                <StatusBadge status={auto.lastStatus} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {auto.runCount} runs
                {auto.lastRunAt && (
                  <> &middot; Last: {formatTime(auto.lastRunAt)}</>
                )}
              </p>
              <button
                onClick={() => handleRunAutomation(auto.id)}
                className="text-sm text-ocean hover:underline"
              >
                Run Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Scheduled Tasks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Scheduled Tasks
          </h2>
          <a
            href="/admin/tasks"
            className="text-sm text-ocean hover:underline"
          >
            Manage All
          </a>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Task
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Schedule
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Next Run
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {tasks.slice(0, 10).map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {task.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {task.taskType}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {task.schedule}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {task.nextRunAt ? formatTime(task.nextRunAt) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.lastStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRunTask(task.id)}
                      className="text-sm text-ocean hover:underline"
                    >
                      Run
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  return (
    <div className={`rounded-lg p-4 ${colors[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const colors: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full ${
        colors[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 0) {
    // Future
    const mins = Math.floor(-diff / 60000);
    if (mins < 60) return `in ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `in ${hours}h`;
    return formatDate(dateStr);
  }

  // Past
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatDate(dateStr);
}
