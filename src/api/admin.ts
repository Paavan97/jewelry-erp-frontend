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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  orgId: string | null;
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

export const adminApi = {
  getAllOrganizations: async (): Promise<Organization[]> => {
    const response = await client.get<{ success: boolean; data: Organization[] }>('/admin/organizations');
    return response.data.data;
  },

  createOrganization: async (data: CreateOrganizationData): Promise<any> => {
    const response = await client.post<{ success: boolean; data: any }>('/admin/organizations', data);
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
};

