import axios from 'axios';

const MAIN_API_URL = 'https://be-mazady.vercel.app/api/';

let CURRENT_API_URL = MAIN_API_URL;

const api = axios.create({
    baseURL: CURRENT_API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000
});

// Attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


