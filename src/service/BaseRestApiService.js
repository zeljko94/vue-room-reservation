import axios from 'axios';

export class BaseRestApiService {
    constructor(apiUrl) {
        this.apiUrl = apiUrl || 'https://localhost:5000/api'; // Default API URL
    }

    get(endpoint) {
        return axios.get(`${this.apiUrl}/${endpoint}`, this.getAuthHeaders()).then(response => response.data);
    }

    post(endpoint, data) {
        return axios.post(`${this.apiUrl}/${endpoint}`, data, this.getAuthHeaders()).then(response => response.data);
    }

    put(endpoint, data) {
        return axios.put(`${this.apiUrl}/${endpoint}`, data, this.getAuthHeaders()).then(response => response.data);
    }

    delete(endpoint) {
        return axios.delete(`${this.apiUrl}/${endpoint}`, this.getAuthHeaders()).then(response => response.data);
    }

    getAuthHeaders() {
        const token = localStorage.getItem('userToken');
        return {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        };
    }
}
