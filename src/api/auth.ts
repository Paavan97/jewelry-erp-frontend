import client from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId: string;
  organization: {
    id: string;
    name: string;
    businessType: string;
  };
  createdAt: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await client.post<{ success: boolean; data: LoginResponse }>('/auth/login', credentials);
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await client.get<{ success: boolean; data: User }>('/auth/me');
    return response.data.data;
  },
};

