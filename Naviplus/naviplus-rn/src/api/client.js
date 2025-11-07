import axios from 'axios';
import { BACKEND_BASE_URL, DEFAULT_TIMEOUT_MS } from '../config/apiConfig';

export const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: DEFAULT_TIMEOUT_MS,
});

export async function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export async function login(username, password) {
  const res = await api.post('/login/', { username, password });
  return res.data;
}

export async function fetchBuildings() {
  const res = await api.get('/buildings/');
  return res.data;
}

export async function fetchBuildingDetails(buildingId) {
  const res = await api.get(`/buildings/${buildingId}/`);
  return res.data;
}

export async function fetchPLDs(buildingId) {
  const res = await api.get(`/plds/`, { params: { building: buildingId } });
  return res.data;
}

export async function fetchNavigationSteps({ buildingId, start, end }) {
  const res = await api.get('/navigate/', { params: { building: buildingId, start, end } });
  return res.data?.steps || [];
}
export { getResolvedBaseUrl } from '../config/apiConfig';


