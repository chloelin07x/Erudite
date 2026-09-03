import axios from 'axios';

const api = axios.create({baseURL: import.meta.env.VITE_API_URL});

// This interceptor will silently get the token from local storage
// And attach it to every call as a header
api.interceptors.request.use((config) =>{
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
});

export default api
