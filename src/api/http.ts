// src/api/http.ts
const BASE_URL =
  import.meta.env.VITE_API_BASE ?? "http://localhost:8085/msvc-waturnos/v1.0";

export const getToken = () => localStorage.getItem("jwtToken");

/**
 * Fetch autenticado con manejo de token y CORS.
 */
export async function authFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers || {});

  // Añadimos headers por defecto
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");

  // Si hay token, agregamos Bearer
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 🔧 Normaliza la URL (evita // en concatenación)
  const url = `${BASE_URL}${input.startsWith("/") ? "" : "/"}${input}`;

  // 🧠 Configuración final
  const config: RequestInit = {
    ...init,
    headers,
    mode: "cors", // importante
    credentials: "omit", // no enviar cookies
  };

  const res = await fetch(url, config);

  // Si el token expiró, redirigimos al login automáticamente
  if (res.status === 401 || res.status === 403) {
    console.warn("⚠️ Sesión expirada o no autorizada, redirigiendo al login...");
    localStorage.clear();
    window.location.href = "/login";
  }

  return res;
}