import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const fetchFiles = async (page = 1, limit = 50) => {
    const { data } = await api.get(`/files?page=${page}&limit=${limit}`);
    return data;
};

export const syncFiles = async () => {
    const { data } = await api.post('/files/sync');
    return data;
};

export const updateDesignation = async (id: number, designation: string) => {
    const { data } = await api.patch(`/files/${id}/designation`, { designation });
    return data;
};

export const exportFilesUrl = () => {
    return `${api.defaults.baseURL}/export/excel`;
};

export const downloadExcel = async (folderPath: string = '/') => {
    try {
        const response = await api.get(`/export/excel?folder=${encodeURIComponent(folderPath)}`, { responseType: 'blob' });

        // Check if backend returned an error JSON (e.g., token expired → not a real file)
        const contentType = String(response.headers['content-type'] || '');
        if (contentType.includes('application/json')) {
            const errorText = await (response.data as Blob).text();
            const parsed = JSON.parse(errorText);
            alert('Export Failed: ' + (parsed.error || 'Unknown error'));
            return;
        }

        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = `OneDrive_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    } catch (e: any) {
        if (e.response && e.response.data instanceof Blob) {
            const errorText = await e.response.data.text();
            try {
                const parsed = JSON.parse(errorText);
                alert('Export Failed: ' + (parsed.error || errorText));
            } catch {
                alert('Export Failed: ' + errorText);
            }
        } else {
            alert('Export Failed! Please re-login to refresh your session.');
        }
    }
};

// Employee Management APIs
export const loginEmployee = async (credentials: any) => {
    const { data } = await api.post('/employee/login', credentials);
    return data;
};

export const createEmployee = async (employeeData: any) => {
    const { data } = await api.post('/employee/create', employeeData);
    return data;
};

export const getEmployees = async () => {
    const { data } = await api.get('/employee/list');
    return data.employees;
};

export const deleteEmployee = async (id: string) => {
    const { data } = await api.delete(`/employee/${id}`);
    return data;
};

// Device Authority APIs
export const startDeviceLoginAPI = async () => {
    const { data } = await api.post('/device-auth/start');
    return data;
};

export const pollDeviceLoginAPI = async (deviceCode: string) => {
    const { data } = await api.post('/device-auth/poll', { deviceCode });
    return data;
};

// ==========================================
// Notifications API
// ==========================================

export const fetchNotifications = async () => {
    const { data } = await api.get('/notifications');
    return data;
};

export const markNotificationRead = async (id: string) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
};

export const markAllNotificationsRead = async () => {
    const { data } = await api.put(`/notifications/read-all`);
    return data;
};
