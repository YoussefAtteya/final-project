import http from './http';
export const getSettings = () => http.get('/settings');
