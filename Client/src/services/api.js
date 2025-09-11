import axios from "axios";

// Base API URL from environment variable or fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Base URL for static files (images, uploads)
export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});


// Public endpoints that don’t require a token
const publicEndpoints = ["/auth/register", "/auth/login"];

// Request Interceptor for Authorization token
api.interceptors.request.use((config) => {
    if (!config.url) return config;

    const isPublic = publicEndpoints.some(
        (endpoint) => config.url.endsWith(endpoint) || config.url.includes(endpoint)
    );

    if (!isPublic) {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

// ===================== Poster APIs =====================

export const posterAPI = {
    uploadPoster: (formData) =>
        api.post("/posters/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    getByCategory: (category, customerId) =>
        api.post("/posters/generate", { category, customerId }),
};

// ===================== Auth APIs =====================
export const authAPI = {
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
    getProfile: () => api.get("/auth/profile"),
    logout: () => api.post("/auth/logout"),
};

// ===================== 👤 Customer APIs =====================
export const customerAPI = {
    add: (formData) =>
        api.post("/customers/add", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    getCustomers: () => api.get("/customers/"),

    getCustomer: (id) => api.get(`/customers/${id}`),

    update: (id, formData) =>
        api.put(`/customers/edit/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    delete: (id) => api.delete(`/customers/${id}`),
};

// ===================== 🗓 Schedule APIs =====================
// export const scheduleAPI = {
//   create: (data) => api.post('/schedules/create', data),
//   getByCustomer: (customerId) => api.get(`/schedules/customer/${customerId}`),
// };
export const scheduleAPI = {
    create: (data) => api.post("/schedules/create", data),
    getByCustomer: (customerId) => api.get(`/schedules/customer/${customerId}`),
    getAllSchedules: (url = "/schedules/") => api.get(url),
    updateSchedule: (id, data) => api.put(`/schedules/${id}`, data),
    deleteSchedule: (id) => api.delete(`/schedules/${id}`),
};

// ===================== 📊 Dashboard APIs =====================
export const dashboardAPI = {
    getMetrics: () => api.get("/dashboard/"),
};

// ===================== 🖼️ Image URL Helper =====================
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Clean the path - remove leading slashes and backslashes
    const cleanPath = imagePath.replace(/^[\\\/]+/, '').replace(/\\/g, '/');

    // Use the current location's protocol and host for local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `${window.location.protocol}//${window.location.hostname}:5000/${cleanPath}`;
    }

    // For production, use HTTP instead of HTTPS to avoid certificate issues
    return `http://marketing.gs3solution.us/${cleanPath}`;
};

export default api;
