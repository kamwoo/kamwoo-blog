import axios from 'axios';

export const httpClient = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
  headers: { 'content-type': 'application/json' },
});
