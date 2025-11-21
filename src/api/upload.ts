import api from './axios';

/**
 * Sube un archivo al backend y retorna la URL del archivo subido
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // El backend retorna la URL completa o el path relativo del archivo
  const data = response.data?.data || response.data;
  return data.url || data.path || data;
}

/**
 * Convierte un archivo a Base64 para preview
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
