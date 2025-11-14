// src/App.tsx
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { esES as coreEsES } from "@mui/material/locale";
import { esES as gridEsES } from "@mui/x-data-grid/locales";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleProtectedRoute from "./auth/RoleProtectedRoute";
import MainLayout from "./layout/MainLayout";

// Páginas
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import BookingsPage from "./pages/BookingsPage";
import DashOrganizations from "./pages/DashOrganizations";
import DashProviders from "./pages/DashProviders";

// 🎨 Tema global (Material UI + español)
const theme = createTheme(
  {
    palette: {
      mode: "light",
      primary: { main: "#007BFF" },
      secondary: { main: "#28A745" },
      error: { main: "#DC3545" },
      background: { default: "#f4f6f8" },
    },
    typography: {
      fontFamily: "Inter, Roboto, sans-serif",
    },
  },
  coreEsES,
  gridEsES
);

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Página pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* 🔒 Todo lo autenticado va dentro de MainLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboards iniciales */}
              <Route
                path="/dashboard-orgs"
                element={
                  <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                    <DashOrganizations />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/dashboard-providers"
                element={
                  <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                    <DashProviders />
                  </RoleProtectedRoute>
                }
              />

              {/* Dashboard principal */}
              <Route index element={<DashboardPage />} />

              {/* CRUDs */}
              <Route
                path="/clients"
                element={
                  <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER", "PROVIDER"]}>
                    <ClientsPage />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/bookings"
                element={
                  <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER", "PROVIDER"]}>
                    <BookingsPage />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/organization"
                element={
                  <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                    <div>Organización (CRUD)</div>
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                    <div>Usuarios (CRUD)</div>
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/services"
                element={
                  <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                    <div>Servicios (CRUD)</div>
                  </RoleProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}