import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Tooltip,
  Fab,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  Settings as SettingsIcon,
  Apartment as OrgIcon,
  Build as ServicesIcon,
  Person as UsersIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const drawerWidthOpen = 240;
const drawerWidthClosed = 72;

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);

  const menuItems = [
    { label: "Dashboard", path: "/", icon: <DashboardIcon />, roles: ["ADMIN", "MANAGER", "PROVIDER"] },
    { label: "Turnos", path: "/bookings", icon: <CalendarIcon />, roles: ["ADMIN", "MANAGER", "PROVIDER"] },
    { label: "Clientes", path: "/clients", icon: <PeopleIcon />, roles: ["ADMIN", "MANAGER", "PROVIDER"] },
    { label: "Servicios", path: "/services", icon: <ServicesIcon />, roles: ["ADMIN", "MANAGER"] },
    { label: "Usuarios", path: "/users", icon: <UsersIcon />, roles: ["ADMIN", "MANAGER"] },
    { label: "Organización", path: "/organization", icon: <OrgIcon />, roles: ["ADMIN"] },
    { label: "Configuración", path: "/settings", icon: <SettingsIcon />, roles: ["ADMIN", "MANAGER", "PROVIDER"] },
  ];

  const visibleItems = menuItems.filter((item) => item.roles.includes(role ?? ""));

  /** Contenido del menú (Drawer compartido entre desktop y mobile) */
  const drawerContent = (
    <>
      {/* 🔹 Logo superior */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: menuOpen ? "space-between" : "center",
          height: 64,
          px: 2,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        {menuOpen ? (
          <Typography variant="h6" fontWeight={600} sx={{ color: "primary.main" }}>
            WATurnos
          </Typography>
        ) : (
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "#fff",
              borderRadius: "8px",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            WA
          </Box>
        )}
      </Box>

      {/* 🔹 Lista de navegación */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {visibleItems.map((item) => (
          <Tooltip title={!menuOpen ? item.label : ""} placement="right" key={item.path}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  my: 0.2,
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "white",
                    "& .MuiListItemIcon-root": { color: "white" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "primary.main",
                    minWidth: menuOpen ? 40 : 56,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {menuOpen && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {/* 🔹 Info de rol */}
      {menuOpen && (
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Rol actual: <strong>{role || "N/A"}</strong>
          </Typography>
        </Box>
      )}
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
     {/* 🔝 Header superior */}
<AppBar
  position="fixed"
  sx={{
    zIndex: theme.zIndex.drawer + 2,
    background: "linear-gradient(135deg, #007BFF 0%, #28A745 100%)",
    boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
    backdropFilter: "blur(6px)",
    color: "white",
  }}
>
  <Toolbar
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      py: 1,
    }}
  >
    {/* 🔹 Logo + organización */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {!isDesktop && (
        <IconButton color="inherit" edge="start" onClick={toggleMobileMenu}>
          <MenuIcon />
        </IconButton>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, letterSpacing: "0.5px" }}
        >
          WATurnos
        </Typography>

        {/* 🏢 Mostrar organización seleccionada */}
        {localStorage.getItem("organizationName") && (
          <Typography
            variant="caption"
            sx={{ opacity: 0.9 }}
          >
            {localStorage.getItem("organizationName")}

            {localStorage.getItem("providerName")
              ? ` — ${localStorage.getItem("providerName")}`
              : ""}
          </Typography>
        )}
      </Box>
    </Box>

    {/* 🔹 Botón Salir */}
    <Button
      color="inherit"
      startIcon={<LogoutIcon />}
      onClick={signOut}
      sx={{
        px: 2.5,
        py: 0.8,
        borderRadius: 2,
        fontWeight: 600,
        textTransform: "none",
        backgroundColor: "rgba(255,255,255,0.18)",
        "&:hover": {
          backgroundColor: "rgba(255,255,255,0.28)",
        },
      }}
    >
      Salir
    </Button>
  </Toolbar>
</AppBar>

      {/* 📋 Drawer lateral permanente (desktop) */}
      {isDesktop && (
        <Drawer
          variant="permanent"
          open={menuOpen}
          sx={{
            width: menuOpen ? drawerWidthOpen : drawerWidthClosed,
            flexShrink: 0,
            whiteSpace: "nowrap",
            [`& .MuiDrawer-paper`]: {
              width: menuOpen ? drawerWidthOpen : drawerWidthClosed,
              transition: "width 0.3s ease",
              overflowX: "hidden",
              boxSizing: "border-box",
              borderRight: "1px solid #e0e0e0",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* 📱 Drawer temporal (mobile) */}
      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleMobileMenu}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: drawerWidthOpen,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* 🎛 FAB flotante para abrir/cerrar menú (solo desktop) */}
      {isDesktop && (
        <Fab
          color="default"
          size="small"
          onClick={toggleMenu}
          sx={{
            position: "fixed",
            top: 76,
            left: menuOpen ? drawerWidthOpen - 26 : drawerWidthClosed - 18,
            zIndex: theme.zIndex.drawer + 3,
            width: 34,
            height: 34,
            backgroundColor: "#f0f0f0",
            color: "#333",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            "&:hover": { backgroundColor: "#e0e0e0" },
            transition: "all 0.3s ease",
          }}
        >
          {menuOpen ? <ChevronLeftIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
        </Fab>
      )}

      {/* 🧭 Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          pl: isDesktop ? (menuOpen ? 2 : 1) : 2,
          backgroundColor: "#f4f6f8",
          minHeight: "100vh",
          borderLeft: isDesktop ? "1px solid #e0e0e0" : "none",
          transition: "padding 0.3s ease",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}