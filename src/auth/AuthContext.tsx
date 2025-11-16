// src/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import type { LoginRequest } from "../types/dto";

type Ctx = {
  isAuth: boolean;
  userId?: number;
  role?: string;
  organizationId?: number;
  providerId?: number;
  signIn: (body: LoginRequest) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<Ctx>({} as Ctx);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isAuth, setAuth] = useState(!!localStorage.getItem("jwtToken"));
  const [userId, setUserId] = useState<number | undefined>(
    localStorage.getItem("userId") ? Number(localStorage.getItem("userId")) : undefined
  );
  const [role, setRole] = useState<string | undefined>(localStorage.getItem("role") || undefined);
  const [organizationId, setOrganizationId] = useState<number | undefined>(
    localStorage.getItem("organizationId")
      ? Number(localStorage.getItem("organizationId"))
      : undefined
  );
  const [providerId, setProviderId] = useState<number | undefined>(
    localStorage.getItem("providerId")
      ? Number(localStorage.getItem("providerId"))
      : undefined
  );

  /**
   * Inicia sesión y guarda el contexto de autenticación
   */
  const signIn = async (body: LoginRequest) => {
    const res = await login(body);

    if (res?.token) {
      // 🧩 Guardar en localStorage (string siempre)
      localStorage.setItem("jwtToken", res.token);
      if (res.userId) localStorage.setItem("userId", String(res.userId));
      if (res.role) localStorage.setItem("role", res.role);
      if (res.organizationId)
        localStorage.setItem("organizationId", String(res.organizationId));
      if (res.providerId) localStorage.setItem("providerId", String(res.providerId));

      // 🧠 Actualizar estados locales
      setAuth(true);
      setUserId(res.userId);
      setRole(res.role);
      setOrganizationId(res.organizationId);
      setProviderId(res.providerId);

      // 🚀 Redirigir según el rol
      redirectAfterLogin(res.role, res.organizationId, res.providerId);
    } else {
      throw new Error("No se recibió token válido del backend");
    }
  };

  /**
   * Determina la redirección según el rol y datos disponibles
   */
  const redirectAfterLogin = (
  role?: string,
  orgId?: number | null,
  provId?: number | null
    ) => {
      if (role === "ADMIN") {
        // 🔹 Los administradores siempre comienzan en la selección de organizaciones
        navigate("/dashboard-orgs", { replace: true });
        return;
      }

      if (role === "MANAGER") {
        // Si el manager no tiene proveedor, va a seleccionar uno
        if (!provId) {
          navigate("/dashboard-providers", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
        return;
      }

      if (role === "PROVIDER") {
        // Provider directo al dashboard principal
        navigate("/", { replace: true });
        return;
      }

      // Fallback genérico
      navigate("/", { replace: true });
    };

  /**
   * Limpia sesión y vuelve al login
   */
  const signOut = () => {
    localStorage.clear();
    setAuth(false);
    setUserId(undefined);
    setRole(undefined);
    setOrganizationId(undefined);
    setProviderId(undefined);
    navigate("/login", { replace: true });
  };

  // Escuchar eventos globales de logout (disparados por axios/http wrappers)
  useEffect(() => {
    const handler = () => {
      signOut();
    };
    window.addEventListener("auth:logout", handler as EventListener);
    return () => window.removeEventListener("auth:logout", handler as EventListener);
  }, []);

  const value = useMemo(
    () => ({
      isAuth,
      userId,
      role,
      organizationId,
      providerId,
      signIn,
      signOut,
    }),
    [isAuth, userId, role, organizationId, providerId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}