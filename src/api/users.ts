import api from './axios';

export async function getManagersByOrg(organizationId: number | string) {
  const { data } = await api.get(`/users/managers/${organizationId}`);
  return data;
}

export async function createManager(organizationId: number | string, body: any) {
  const { data } = await api.post(`/users/managers/${organizationId}`, body);
  return data;
}

export async function getUser(userId: number | string) {
  const { data } = await api.get(`/users/${userId}`);
  return data;
}

export async function deleteUser(userId: number | string) {
  const { data } = await api.delete(`/users/${userId}`);
  return data;
}
