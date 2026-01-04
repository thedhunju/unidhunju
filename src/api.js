import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy will divert this to http://localhost:3000
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Ensure Bearer scheme
        }
        return config;
    },
    (error) => console.error(error)
);

export default api;
