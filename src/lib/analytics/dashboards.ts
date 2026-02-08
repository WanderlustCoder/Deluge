import { prisma } from '@/lib/prisma';

export type WidgetType = 'chart' | 'metric' | 'table' | 'map';
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'funnel';

export interface WidgetConfig {
  chartType?: ChartType;
  metricName?: string;
  query?: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CreateDashboardInput {
  name: string;
  description?: string;
  ownerId: string;
  ownerType?: 'user' | 'organization' | 'admin';
  isPublic?: boolean;
}

export interface CreateWidgetInput {
  dashboardId: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  dataSource: string;
  position: WidgetPosition;
  refreshRate?: number;
}

// Create dashboard
export async function createDashboard(input: CreateDashboardInput) {
  return prisma.dashboard.create({
    data: {
      name: input.name,
      description: input.description,
      ownerId: input.ownerId,
      ownerType: input.ownerType || 'user',
      isPublic: input.isPublic || false,
    },
    include: { widgets: true },
  });
}

// Get dashboard by ID
export async function getDashboard(id: string) {
  const dashboard = await prisma.dashboard.findUnique({
    where: { id },
    include: {
      widgets: {
        orderBy: { createdAt: 'asc' },
      },
      shares: true,
    },
  });

  if (!dashboard) return null;

  return {
    ...dashboard,
    layout: dashboard.layout ? JSON.parse(dashboard.layout) : null,
    filters: dashboard.filters ? JSON.parse(dashboard.filters) : null,
    widgets: dashboard.widgets.map((w) => ({
      ...w,
      config: w.config ? JSON.parse(w.config) : {},
      position: w.position ? JSON.parse(w.position) : { x: 0, y: 0, width: 4, height: 3 },
    })),
  };
}

// List user dashboards
export async function getUserDashboards(userId: string) {
  const [owned, shared] = await Promise.all([
    prisma.dashboard.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { widgets: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.dashboardShare.findMany({
      where: { sharedWith: userId },
      include: {
        dashboard: {
          include: { _count: { select: { widgets: true } } },
        },
      },
    }),
  ]);

  return {
    owned,
    shared: shared.map((s) => ({
      ...s.dashboard,
      permission: s.permission,
    })),
  };
}

// Update dashboard
export async function updateDashboard(
  id: string,
  data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
    layout?: Record<string, unknown>;
    filters?: Record<string, unknown>;
  }
) {
  return prisma.dashboard.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      isPublic: data.isPublic,
      layout: data.layout ? JSON.stringify(data.layout) : undefined,
      filters: data.filters ? JSON.stringify(data.filters) : undefined,
    },
  });
}

// Delete dashboard
export async function deleteDashboard(id: string) {
  return prisma.dashboard.delete({
    where: { id },
  });
}

// Add widget to dashboard
export async function addWidget(input: CreateWidgetInput) {
  return prisma.dashboardWidget.create({
    data: {
      dashboardId: input.dashboardId,
      type: input.type,
      title: input.title,
      config: JSON.stringify(input.config),
      dataSource: input.dataSource,
      position: JSON.stringify(input.position),
      refreshRate: input.refreshRate,
    },
  });
}

// Update widget
export async function updateWidget(
  id: string,
  data: {
    title?: string;
    type?: WidgetType;
    config?: WidgetConfig;
    dataSource?: string;
    position?: WidgetPosition;
    refreshRate?: number;
  }
) {
  return prisma.dashboardWidget.update({
    where: { id },
    data: {
      title: data.title,
      type: data.type,
      config: data.config ? JSON.stringify(data.config) : undefined,
      dataSource: data.dataSource,
      position: data.position ? JSON.stringify(data.position) : undefined,
      refreshRate: data.refreshRate,
    },
  });
}

// Delete widget
export async function deleteWidget(id: string) {
  return prisma.dashboardWidget.delete({
    where: { id },
  });
}

// Share dashboard
export async function shareDashboard(
  dashboardId: string,
  sharedWith: string,
  permission: 'view' | 'edit' = 'view'
) {
  return prisma.dashboardShare.upsert({
    where: {
      dashboardId_sharedWith: { dashboardId, sharedWith },
    },
    create: {
      dashboardId,
      sharedWith,
      permission,
    },
    update: {
      permission,
    },
  });
}

// Remove share
export async function unshareDashboard(dashboardId: string, sharedWith: string) {
  return prisma.dashboardShare.delete({
    where: {
      dashboardId_sharedWith: { dashboardId, sharedWith },
    },
  });
}

// Check dashboard access
export async function canAccessDashboard(
  dashboardId: string,
  userId: string
): Promise<{ hasAccess: boolean; canEdit: boolean }> {
  const dashboard = await prisma.dashboard.findUnique({
    where: { id: dashboardId },
    include: {
      shares: {
        where: { sharedWith: userId },
      },
    },
  });

  if (!dashboard) {
    return { hasAccess: false, canEdit: false };
  }

  if (dashboard.ownerId === userId) {
    return { hasAccess: true, canEdit: true };
  }

  if (dashboard.isPublic) {
    return { hasAccess: true, canEdit: false };
  }

  const share = dashboard.shares[0];
  if (share) {
    return { hasAccess: true, canEdit: share.permission === 'edit' };
  }

  return { hasAccess: false, canEdit: false };
}

// Clone dashboard
export async function cloneDashboard(dashboardId: string, newOwnerId: string, newName?: string) {
  const original = await getDashboard(dashboardId);
  if (!original) throw new Error('Dashboard not found');

  const newDashboard = await prisma.dashboard.create({
    data: {
      name: newName || `Copy of ${original.name}`,
      description: original.description,
      ownerId: newOwnerId,
      ownerType: 'user',
      isPublic: false,
      layout: original.layout ? JSON.stringify(original.layout) : null,
      filters: original.filters ? JSON.stringify(original.filters) : null,
    },
  });

  // Clone widgets
  for (const widget of original.widgets) {
    await prisma.dashboardWidget.create({
      data: {
        dashboardId: newDashboard.id,
        type: widget.type,
        title: widget.title,
        config: JSON.stringify(widget.config),
        dataSource: widget.dataSource,
        position: JSON.stringify(widget.position),
        refreshRate: widget.refreshRate,
      },
    });
  }

  return getDashboard(newDashboard.id);
}
