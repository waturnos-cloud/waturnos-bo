/**
 * Construye la URL completa de una imagen basándose en la ruta almacenada
 * @param logoUrl - URL relativa o completa del logo
 * @returns URL completa del logo o null si no hay logo
 */
export function getImageUrl(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null;
  
  // Si ya es una URL completa (http/https), retornarla tal cual
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    return logoUrl;
  }
  
  // Si es una ruta relativa sin el prefijo /images/, agregarlo
  if (!logoUrl.startsWith('/images/') && !logoUrl.startsWith('images/')) {
    return `/images/${logoUrl}`;
  }
  
  // Si ya tiene el prefijo, retornarla tal cual
  return logoUrl;
}
