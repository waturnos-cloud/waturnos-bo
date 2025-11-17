import api from './axios';

export async function getOrganizations() {
  const { data } = await api.get('/organizations');
  return data;
}

export async function createOrganization(body: any) {
  const { data } = await api.post('/organizations', body);
  return data;
}

export async function getProvidersByOrg(orgId: number | string) {
  const { data } = await api.get(`/users/providers/${orgId}`);
  return data;
}

export async function createProvider(orgId: number | string, body: any) {
  const { data } = await api.post(`/users/providers/${orgId}`, body);
  return data;
}

export async function getOrganization(orgId: number | string) {
  const { data } = await api.get(`/organizations/${orgId}`);
  return data;
}

export async function updateOrganization(body: any) {
  const { data } = await api.put('/organizations/update', body);
  return data;
}

export async function toggleOrganizationStatus(orgId: number | string, status: 'ACTIVE' | 'DEACTIVE') {
  const { data } = await api.put(`/organizations/activate/${orgId}/${status}`);
  return data;
}
