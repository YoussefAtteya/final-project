import http from './http';

export const login = (data) => http.post('/auth/login', data);
export const register = (data) => http.post('/auth/register', data);
export const logout = () => http.post('/auth/logout');
export const me = () => http.get('/auth/me');

// Google OAuth (redirect)
export const googleLoginUrl = `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/google`;