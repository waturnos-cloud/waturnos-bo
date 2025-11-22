
import api from './axios';
import { ClientDTO } from '../types/dto';

export async function getClients() {
  const { data } = await api.get('/clients');
  return data;
}

export async function getClientsByOrganization(organizationId: number) {
  const { data } = await api.get(`/clients/listByOrganization/${organizationId}`);
  return data;
}

export async function getClientById(id: number) {
  const { data } = await api.get(`/clients/${id}`);
  return data;
}

export async function searchClients(params: { email?: string; phone?: string; name?: string; dni?: string; organizationId?: number }) {
  const { data } = await api.get('/clients/search', { params });
  return data;
}

export async function createClient(body: ClientDTO) {
  const { data } = await api.post('/clients', body);
  return data;
}

export async function updateClient(id: number, body: ClientDTO) {
  const { data } = await api.put(`/clients/${id}`, body);
  return data;
}

export async function deleteClient(id: number) {
  const { data } = await api.delete(`/clients/${id}`);
  return data;
}
