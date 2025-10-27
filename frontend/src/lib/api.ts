import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Company {
  id: number;
  company_name: string;
  industry?: string;
  job_type?: string;
  status: string;
  es_deadline?: string;
  es_submitted: boolean;
  interview_count: number;
  next_interview_date?: string;
  website_url?: string;
  recruit_url?: string;
  mypage_id?: string;
  mypage_password?: string;
  salary?: string;
  location?: string;
  notes?: string;
  interview_notes?: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyCreate {
  company_name: string;
  industry?: string;
  job_type?: string;
  status?: string;
  es_deadline?: string;
  es_submitted?: boolean;
  interview_count?: number;
  next_interview_date?: string;
  website_url?: string;
  recruit_url?: string;
  mypage_id?: string;
  mypage_password?: string;
  salary?: string;
  location?: string;
  notes?: string;
  interview_notes?: string;
  priority?: number;
}

export interface CompanyUpdate {
  company_name?: string;
  industry?: string;
  job_type?: string;
  status?: string;
  es_deadline?: string;
  es_submitted?: boolean;
  interview_count?: number;
  next_interview_date?: string;
  website_url?: string;
  recruit_url?: string;
  mypage_id?: string;
  mypage_password?: string;
  salary?: string;
  location?: string;
  notes?: string;
  interview_notes?: string;
  priority?: number;
}

export const api = {
  // 企業一覧を取得
  getCompanies: async (params?: {
    status?: string;
    industry?: string;
    priority?: number;
    sort_by?: string;
    order?: string;
  }): Promise<Company[]> => {
    const response = await axios.get(`${API_URL}/companies/`, { params });
    return response.data;
  },

  // 特定の企業を取得
  getCompany: async (id: number): Promise<Company> => {
    const response = await axios.get(`${API_URL}/companies/${id}`);
    return response.data;
  },

  // 企業を作成
  createCompany: async (data: CompanyCreate): Promise<Company> => {
    const response = await axios.post(`${API_URL}/companies/`, data);
    return response.data;
  },

  // 企業を更新
  updateCompany: async (id: number, data: CompanyUpdate): Promise<Company> => {
    const response = await axios.put(`${API_URL}/companies/${id}`, data);
    return response.data;
  },

  // 企業を削除
  deleteCompany: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/companies/${id}`);
  },

  // 検索
  searchCompanies: async (keyword: string): Promise<Company[]> => {
    const response = await axios.get(`${API_URL}/companies/search/`, {
      params: { keyword }
    });
    return response.data;
  },

  // 統計情報を取得
  getStatistics: async (): Promise<any> => {
    const response = await axios.get(`${API_URL}/statistics/`);
    return response.data;
  },
};
