// src/auth/RoleProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import AccessDenied from "../pages/AccessDenied"; // 👈 agregado

type RoleProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export default function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { role, isAuth } = useAuth();

  // Si no está autenticado, mandamos al login
  if (!isAuth) return <Navigate to="/login" replace />;

  // Si el rol no tiene permiso, lo mandamos al dashboard
  if (!allowedRoles.includes(role ?? "")) {
    return <AccessDenied />;
  }
  // Si pasa todo, renderiza el contenido
  return <>{children}</>;
}