// src/api/http.ts
import api from "./axios";

export const getToken = () => localStorage.getItem("jwtToken");

/**
 * Compat wrapper para mantener la firma de `authFetch` usada en páginas.
 * Internamente usa axios instance (`src/api/axios.ts`) para un comportamiento unificado.
 * Devuelve un objeto con `json()` y `status` para que el código existente (que usa `res.json()`) siga funcionando.
 */
export async function authFetch(
  input: string,
  init: RequestInit = {}
): Promise<{ status: number; json: () => Promise<any> }> {
  const url = `${input.startsWith("/") ? "" : "/"}${input}`;

  const method = (init.method || "GET") as any;

  // intentar parsear body si viene como string JSON
  let data: any = undefined;
  if (init.body) {
    try {
      data = typeof init.body === "string" ? JSON.parse(init.body as string) : init.body;
    } catch (e) {
      data = init.body;
    }
  }

  // Headers desde init (si los hubiera)
  const headers = init.headers as Record<string, string> | undefined;

  try {
    const resp = await api.request({ url, method, data, headers });
    const ok = resp.status >= 200 && resp.status < 300;
    return {
      ok,
      status: resp.status,
      statusText: resp.statusText ?? String(resp.status),
      json: async () => resp.data,
    } as unknown as { ok: boolean; status: number; statusText: string; json: () => Promise<any> };
  } catch (err: any) {
    if (err?.response) {
      // Axios ya maneja 401 en el interceptor; dispatchamos evento para compatibilidad
      if (err.response.status === 401 || err.response.status === 403) {
        window.dispatchEvent(new CustomEvent('auth:logout', { detail: { status: err.response.status } }));
      }
      return {
        ok: err.response.status >= 200 && err.response.status < 300,
        status: err.response.status,
        statusText: err.response.statusText ?? String(err.response.status),
        json: async () => err.response.data,
      } as unknown as { ok: boolean; status: number; statusText: string; json: () => Promise<any> };
    }
    throw err;
  }
}