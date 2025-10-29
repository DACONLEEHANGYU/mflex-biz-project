import axios from 'axios';
import { setInterceptors } from './config/interceptors';

// instance & interceptor
const create = (url, options) => {
  const instance = axios.create(Object.assign({ baseURL: url }, options));
  return instance;
};

const createWithAuth = (url, options) => {
  const instance = axios.create(Object.assign({ baseURL: url }, options));
  setInterceptors(instance);
  return instance;
};

export const $vxHttp = create(import.meta.env.VITE_APP_API_URL);
export const $vxAuth = createWithAuth(import.meta.env.VITE_APP_API_URL);
