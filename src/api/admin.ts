import client from './client';

export interface Organization {
  id: string;
  name: string;
  industry: string;
  isActive: boolean;
  businessType: string;
  createdAt: string;
  userCount?: number;
}

export interface CreateOrganizationData {
  name: string;
  industry?: string;
  isActive?: boolean;
  businessType: string;
  adminEmail: string;
  adminName: string;
  adminPassword: string;
}

export interface UpdateOrganizationData {
  name?: string;
  industry?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  orgId: string | null;
  isActive?: boolean;
  organization: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  orgId: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  orgId?: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

export const adminApi = {
  getAllOrganizations: async (): Promise<Organization[]> => {
    const response = await client.get<{ success: boolean; data: Organization[] }>('/admin/organizations');
    return response.data.data;
  },

  createOrganization: async (data: CreateOrganizationData): Promise<any> => {
    const response = await client.post<{ success: boolean; data: any }>('/admin/organizations', data);
    return response.data.data;
  },

  updateOrganization: async (id: string, data: UpdateOrganizationData): Promise<Organization> => {
    const response = await client.put<{ success: boolean; data: Organization }>(`/admin/organizations/${id}`, data);
    return response.data.data;
  },

  toggleOrganizationStatus: async (id: string, isActive: boolean): Promise<Organization> => {
    const response = await client.patch<{ success: boolean; data: Organization }>(`/admin/organizations/${id}/status`, { isActive });
    return response.data.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await client.get<{ success: boolean; data: User[] }>('/admin/users');
    return response.data.data;
  },

  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await client.post<{ success: boolean; data: User }>('/admin/users', data);
    return response.data.data;
  },

  updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await client.put<{ success: boolean; data: User }>(`/admin/users/${id}`, data);
    return response.data.data;
  },

  resetUserPassword: async (id: string, password: string): Promise<any> => {
    const response = await client.patch<{ success: boolean; data: any }>(`/admin/users/${id}/password`, { password });
    return response.data.data;
  },

  toggleUserStatus: async (id: string, isActive: boolean): Promise<User> => {
    const response = await client.patch<{ success: boolean; data: User }>(`/admin/users/${id}/status`, { isActive });
    return response.data.data;
  },
};

