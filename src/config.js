// API base URL - uses environment variable in production, falls back to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8345';

export default API_BASE_URL;
