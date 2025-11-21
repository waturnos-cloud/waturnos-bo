// src/App.tsx
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { esES as coreEsES } from "@mui/material/locale";
import { esES as gridEsES } from "@mui/x-data-grid/locales";
import { theme as baseTheme } from "./theme/theme";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleProtectedRoute from "./auth/RoleProtectedRoute";
import MainLayout from "./layout/MainLayout";
import { NotificationProvider } from "./contexts/NotificationContext";

// Páginas
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import BookingsPage from "./pages/BookingsPage";
import DashOrganizations from "./pages/DashOrganizations";
import DashProviders from "./pages/DashProviders";
import React from 'react';
const ServicesPage = React.lazy(() => import('./pages/ServicesPage'));
import ResetPasswordPage from "./pages/ResetPasswordPage";

// 🎨 Tema global (Material UI + español)
const theme = createTheme(baseTheme, coreEsES, gridEsES);

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
          <Routes>
            {/* Página pública */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/user/resetpassword.html/resetpassword.html" element={<React.Suspense fallback={<div>Cargando...</div>}><ResetPasswordPage /></React.Suspense>} />
            <Route path="/user/resetpassword.html" element={<React.Suspense fallback={<div>Cargando...</div>}><ResetPasswordPage /></React.Suspense>} />

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
                  <RoleProtectedRoute allowedRoles={["ADMIN","SELLER"]}>
                    <DashOrganizations />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/dashboard-providers"
                element={
                  <RoleProtectedRoute allowedRoles={["ADMIN","SELLER","MANAGER"]}>
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
                  <RoleProtectedRoute allowedRoles={["ADMIN","SELLER", "MANAGER", "PROVIDER"]}>
                    <ClientsPage />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/bookings"
                element={
                  <RoleProtectedRoute allowedRoles={["ADMIN","SELLER", "MANAGER", "PROVIDER"]}>
                    <BookingsPage />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/organization"
                element={
                  <RoleProtectedRoute allowedRoles={["ADMIN","SELLER"]}>
                    <DashOrganizations />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <RoleProtectedRoute allowedRoles={["ADMIN","SELLER","MANAGER"]}>
                    <div>Usuarios (CRUD)</div>
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/services"
                element={
                  <RoleProtectedRoute allowedRoles={["ADMIN","SELLER","MANAGER"]}>
                    <React.Suspense fallback={<div>Cargando...</div>}>
                      <ServicesPage />
                    </React.Suspense>
                  </RoleProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}