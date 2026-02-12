import { apiClient } from '../api';
import { Company } from '@/app/types';

export interface CreateCompanyData {
    name: string;
    description: string;
    industry: string;
    companySize: string;
    website?: string;
    location: {
        city: string;
        country: string;
    };
}

class CompanyService {
    async createCompany(data: CreateCompanyData) {
        return apiClient.post<{ success: boolean; data: Company }>('/companies', data);
    }

    async getMyCompany() {
        return apiClient.get<{ success: boolean; data: Company }>('/companies/me');
    }

    async updateCompany(id: string, data: Partial<CreateCompanyData>) {
        return apiClient.put<{ success: boolean; data: Company }>(`/companies/${id}`, data);
    }
}

export const companyService = new CompanyService();
