// src/api/auth.ts
const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8085/msvc-waturnos/v1.0";

import type { LoginRequest } from "../types/dto";

export type LoginResponse = {
  token: string;
  userId: number;
  role: string;
  organizationId?: number;
  providerId?: number;
};

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = json?.message ?? "Login fallido";
    throw new Error(msg);
  }

  // ✅ Leer todos los posibles campos que el backend pueda devolver
  const token = json?.token ?? json?.data?.token;
  const userId = json?.userId ?? json?.data?.userId;
  const role = json?.role ?? json?.data?.role;
  const organizationId = json?.organizationId ?? json?.data?.organizationId;
  const providerId = json?.providerId ?? json?.data?.providerId;

  if (!token || !userId) {
    console.error("⚠️ Respuesta inesperada del backend:", json);
    throw new Error("No recibí los datos esperados del backend (token o userId faltantes)");
  }

  console.log("✅ Login exitoso:", { token, userId, role, organizationId, providerId });

  return { token, userId, role, organizationId, providerId };
}