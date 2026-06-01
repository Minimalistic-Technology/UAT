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

export const downloadExcel = async () => {
    try {
        const response = await api.get('/export/excel', { responseType: 'blob' });

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

