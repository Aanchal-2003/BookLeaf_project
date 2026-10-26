import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.error?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      details: error.response?.data?.error?.details || null,
      code: error.response?.data?.error?.code || 'ERROR',
    };
    return Promise.reject(customError);
  }
);
