import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== TYPES ==========

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Client {
  id: number;
  name: string;
  inn?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  source?: string;
  status: string;
  manager_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  last_contact: string;
}

export interface Pipeline {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DealStage {
  id: number;
  pipeline_id: number;
  name: string;
  description?: string;
  color: string;
  sort_order: number;
  win_probability: number;
  is_final: boolean;
  is_won: boolean;
  created_at: string;
}

export interface Deal {
  id: number;
  title: string;
  description?: string;
  client_id: number;
  pipeline_id: number;
  stage_id: number;
  manager_id?: number;
  amount: number;
  currency: string;
  status: string;
  expected_close_date?: string;
  closed_at?: string;
  lost_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface KanbanStage {
  stage_id: number;
  stage_name: string;
  color: string;
  deals_count: number;
  total_amount: number;
  deals: Deal[];
}

export interface DashboardStats {
  deals: {
    total: number;
    open: number;
    won: number;
    lost: number;
  };
  revenue: {
    total: number;
    month: number;
  };
  clients: {
    total: number;
    leads: number;
    clients: number;
  };
  tasks: {
    total: number;
    pending: number;
    completed: number;
  };
  conversion_rate: number;
}

export interface Activity {
  id: number;
  type: string;
  subject: string;
  content: string;
  created_at: string;
  user_id: number;
  deal_id?: number;
  client_id?: number;
}

// ========== AUTH API ==========

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  getMe: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// ========== DASHBOARD API ==========

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },
  
  getRecentActivities: async (limit: number = 10): Promise<Activity[]> => {
    const response = await api.get('/api/dashboard/recent-activities', {
      params: { limit },
    });
    return response.data;
  },
  
  getSalesChart: async (days: number = 30) => {
    const response = await api.get('/api/dashboard/sales-chart', {
      params: { days },
    });
    return response.data;
  },
  
  getPipelineStats: async () => {
    const response = await api.get('/api/dashboard/pipeline-stats');
    return response.data;
  },
};

// ========== CLIENTS API ==========

export const clientsApi = {
  list: async (filters?: {
    status?: string;
    search?: string;
    manager_id?: number;
  }): Promise<Client[]> => {
    const response = await api.get('/api/clients', { params: filters });
    return response.data;
  },
  
  create: async (client: Partial<Client>): Promise<Client> => {
    const response = await api.post('/api/clients', client);
    return response.data;
  },
  
  update: async (id: number, client: Partial<Client>): Promise<Client> => {
    const response = await api.put(`/api/clients/${id}`, client);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/clients/${id}`);
  },
  
  getStats: async (): Promise<{
    total: number;
    leads: number;
    clients: number;
    archived: number;
  }> => {
    const response = await api.get('/api/clients/stats/summary');
    return response.data;
  },
};

// ========== PIPELINES API ==========

export const pipelinesApi = {
  list: async (): Promise<Pipeline[]> => {
    const response = await api.get('/api/pipelines');
    return response.data;
  },
  
  getStages: async (pipelineId: number): Promise<DealStage[]> => {
    const response = await api.get(`/api/pipelines/${pipelineId}/stages`);
    return response.data;
  },
};

// ========== DEALS API ==========

export const dealsApi = {
  list: async (filters?: {
    pipeline_id?: number;
    stage_id?: number;
    status?: string;
    manager_id?: number;
  }): Promise<Deal[]> => {
    const response = await api.get('/api/deals', { params: filters });
    return response.data;
  },
  
  create: async (deal: Partial<Deal>): Promise<Deal> => {
    const response = await api.post('/api/deals', deal);
    return response.data;
  },
  
  update: async (id: number, deal: Partial<Deal>): Promise<Deal> => {
    const response = await api.put(`/api/deals/${id}`, deal);
    return response.data;
  },
  
  move: async (id: number, stageId: number, reason?: string): Promise<Deal> => {
    const response = await api.post(`/api/deals/${id}/move`, {
      stage_id: stageId,
      reason,
    });
    return response.data;
  },
  
  getKanbanStats: async (pipelineId: number): Promise<KanbanStage[]> => {
    const response = await api.get('/api/deals/stats/pipeline', {
      params: { pipeline_id: pipelineId },
    });
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/deals/${id}`);
  },
};

export default api;
