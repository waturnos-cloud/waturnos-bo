// src/components/TopBar.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

export default function TopBar({ organizationName = "" }: { organizationName?: string }) {
  const { role, signOut } = useAuth();
  // Usar organizationType desde localStorage (el contexto no expone este campo en el tipo)
  const organizationType = localStorage.getItem("organizationType") || "simple";
  const hasOrganization = !!localStorage.getItem('organizationId');
  // TODO: organizationType debe venir del contexto o prop
  // TODO: user info (avatar) debe venir del contexto o prop
  const avatarUrl = "/avatars/x.png";
  // Handlers para abrir modales (deben implementarse en el padre o con context)
  const handleEditOrg = () => {
    handleClose();
    window.dispatchEvent(new CustomEvent('openEditOrg'));
  };
  const handleEditAccount = () => {
    handleClose();
    window.dispatchEvent(new CustomEvent('openEditAccount'));
  };
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        background: "linear-gradient(135deg, #007BFF 0%, #28A745 100%) !important",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.20)",
        borderBottom: "1px solid rgba(255,255,255,0.25)",
        transition: "all 0.25s ease",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* LOGO / NOMBRE / ORGANIZACIÓN */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.4,
              color: "white",
              textShadow: "0 1px 3px rgba(0,0,0,0.25)",
            }}
          >
            WATurnos
          </Typography>
          {organizationName && (
            <Typography
              variant="subtitle2"
              sx={{ color: "white", opacity: 0.85, fontWeight: 400 }}
            >
              {organizationName}
            </Typography>
          )}
        </Box>

        {/* DERECHA */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {role && (
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                color: "white",
                opacity: 0.9,
              }}
            >
              Rol: {role}
            </Typography>
          )}

          {/* AVATAR + MENU */}
          <IconButton onClick={handleMenu}>
            <Avatar
              src={avatarUrl}
              sx={{
                bgcolor: "rgba(255,255,255,0.3)",
                color: "white",
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                width: 40,
                height: 40,
              }}
            />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 180,
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              },
            }}
          >
            {/* Opción 1: Editar organización (solo si ADMIN/MANAGER/PROVIDER y simple org) */}
            {(role === 'ADMIN' || role === 'MANAGER' || role === 'PROVIDER') && organizationType === 'simple' && (
              <MenuItem onClick={hasOrganization ? handleEditOrg : undefined} disabled={!hasOrganization}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Editar organización
              </MenuItem>
            )}
            {/* Opción 2: Administrar cuenta (siempre) */}
            <MenuItem onClick={handleEditAccount}>
              <ManageAccountsIcon fontSize="small" sx={{ mr: 1 }} />
              Administrar mi cuenta
            </MenuItem>
            {/* Opción 3: Cerrar sesión */}
            <MenuItem
              onClick={() => {
                handleClose();
                signOut();
              }}
              sx={{ color: "red" }}
            >
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Salir
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}