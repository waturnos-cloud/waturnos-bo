// src/api/auth.ts
import api from "./axios";
import type { LoginRequest } from "../types/dto";

export type LoginResponse = {
  token: string;
  userId: number;
  role: string;
  organizationId?: number;
  providerId?: number;
  organizationName?: string;
  organizationLogo?: string;
};

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const resp = await api.post("/auth/login", body).catch((e: any) => {
    // rethrow a clean error
    const msg = e?.response?.data?.message ?? e.message ?? "Login fallido";
    throw new Error(msg);
  });

  const json = resp.data ?? {};

  // Leer todos los posibles campos que el backend pueda devolver
  const token = json?.token ?? json?.data?.token;
  const userId = json?.userId ?? json?.data?.userId;
  const role = json?.role ?? json?.data?.role;
  const organizationId = json?.organizationId ?? json?.data?.organizationId;
  const providerId = json?.providerId ?? json?.data?.providerId;
  const organizationName = json?.organizationName ?? json?.data?.organizationName;
  const organizationLogo = json?.organizationLogo ?? json?.data?.organizationLogo;

  if (!token || !userId) {
    console.error("⚠️ Respuesta inesperada del backend:", json);
    throw new Error("No recibí los datos esperados del backend (token o userId faltantes)");
  }

  return { token, userId, role, organizationId, providerId, organizationName, organizationLogo };
}