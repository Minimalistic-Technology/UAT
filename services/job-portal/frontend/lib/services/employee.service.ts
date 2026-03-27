import { apiClient } from "../api";

class EmployeeService {
  async getAll() {
    const response = await apiClient.get<{ data: any }>(`/company-members/all`);
    return response.data.members;
  }

  async delete(id: string) {
    const response = await apiClient.delete<{ success: boolean, message: string }>(`/company-members/${id}`);
    console.log("employee delete response", response);
  }

  async create() {
    //
  }
}

export const employeeService = new EmployeeService();
