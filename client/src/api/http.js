import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

export default http;


