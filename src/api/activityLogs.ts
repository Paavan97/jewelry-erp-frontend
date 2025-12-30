import client from './client';

export interface ActivityLog {
  id: string;
  organizationId: string | null;
  userId: string | null;
  userName: string;
  userRole: string;
  module: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  description: string | null;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ActivityLogFilters {
  userId?: string;
  module?: string;
  action?: string;
  role?: string;
  entityType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ActivityLogsResponse {
  success: boolean;
  data: ActivityLog[];
  count: number;
}

export const fetchActivityLogs = async (
  params?: ActivityLogFilters
): Promise<ActivityLogsResponse> => {
  const response = await client.get<ActivityLogsResponse>('/activity-logs', {
    params,
  });
  return response.data;
};

