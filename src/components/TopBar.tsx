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
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

export default function TopBar() {
  const { role, signOut } = useAuth();
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
        {/* LOGO / NOMBRE */}
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
              sx={{
                bgcolor: "rgba(255,255,255,0.3)",
                color: "white",
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              }}
            >
              <AccountCircleIcon />
            </Avatar>
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
            <MenuItem disabled>Mi perfil</MenuItem>
            <MenuItem disabled>Configuración</MenuItem>
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