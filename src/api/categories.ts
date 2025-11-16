import api from './axios';

export async function getCategories() {
  const { data } = await api.get('/categories');
  return data;
}

export async function getCategoryChildren(parentId: string | number) {
  const { data } = await api.get(`/categories/${parentId}/children`);
  return data;
}
