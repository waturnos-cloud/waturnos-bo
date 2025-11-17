import api from './axios';

export async function getServicesByUser(userId: number | string) {
  const { data } = await api.get(`/services/user/${userId}`);
  return data;
}

export async function getService(serviceId: number | string) {
  const { data } = await api.get(`/services/${serviceId}`);
  return data;
}

export async function createService(body: any) {
  const { data } = await api.post(`/services`, body);
  return data;
}

export async function updateService(body: any) {
  const { data } = await api.put(`/services`, body);
  return data;
}

export async function deleteService(serviceId: number | string) {
  const { data } = await api.delete(`/services/${serviceId}`);
  return data;
}
