import api from './axios';

export async function updateLocations(body: { id: number; locations: any[] }) {
  const { data } = await api.put('/organizations/updatelocations', body);
  return data;
}
