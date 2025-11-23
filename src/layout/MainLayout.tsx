import { useState, useEffect } from "react";
import EditOrganizationModal from '../components/EditOrganizationModal';
import EditAccountModal from '../components/EditAccountModal';
import TopBar from '../components/TopBar';
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
  Apartment as OrgIcon,
  Build as ServicesIcon,
  Person as UsersIcon,
  Engineering as EngineeringIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const drawerWidthOpen = 240;
const drawerWidthClosed = 72;

export default function MainLayout() {
  const [editOrgOpen, setEditOrgOpen] = useState(false);
  const [editAccountOpen, setEditAccountOpen] = useState(false);
  const organizationId = Number(localStorage.getItem('organizationId')) || 0;
  const userId = Number(localStorage.getItem('userId')) || 0;
  const { role } = useAuth();
  // Obtener el tipo de organización desde localStorage ('simple' o 'multi')
  const organizationType = localStorage.getItem('organizationType') || 'simple';

  useEffect(() => {
    const openEditOrg = () => setEditOrgOpen(true);
    const openEditAccount = () => setEditAccountOpen(true);
    window.addEventListener('openEditOrg', openEditOrg);
    window.addEventListener('openEditAccount', openEditAccount);
    return () => {
      window.removeEventListener('openEditOrg', openEditOrg);
      window.removeEventListener('openEditAccount', openEditAccount);
    };
  }, []);
  const [menuOpen, setMenuOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);

  const hasOrganization = !!localStorage.getItem("organizationId");
  const hasProvider = !!localStorage.getItem("providerId");

  const menuItems = [
    { label: "Organizaciones", path: "/organization", icon: <OrgIcon />, roles: ["ADMIN", "SELLER"], requiresOrg: false, requiresProvider: false },
    { label: "Proveedores", path: "/dashboard-providers", icon: <EngineeringIcon />, roles: ["ADMIN", "MANAGER", "PROVIDER"], requiresOrg: true, requiresProvider: false },
    { label: "Dashboard", path: "/", icon: <DashboardIcon />, roles: ["ADMIN", "MANAGER", "PROVIDER"], requiresOrg: true, requiresProvider: true },
    { label: "Turnos", path: "/bookings", icon: <CalendarIcon />, roles: ["ADMIN", "MANAGER", "PROVIDER"], requiresOrg: true, requiresProvider: true },
    { label: "Servicios", path: "/services", icon: <ServicesIcon />, roles: ["ADMIN", "MANAGER", "PROVIDER"], requiresOrg: true, requiresProvider: true },
    { label: "Usuarios", path: "/users", icon: <UsersIcon />, roles: ["ADMIN", "MANAGER"], requiresOrg: true, requiresProvider: true },
    { label: "Clientes", path: "/clients", icon: <PeopleIcon />, roles: ["ADMIN", "MANAGER", "PROVIDER"], requiresOrg: true, requiresProvider: true },
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
        {visibleItems.map((item) => {
          const isDisabled = (item.requiresOrg && !hasOrganization) || (item.requiresProvider && !hasProvider);
          const tooltipText = !hasOrganization && item.requiresOrg 
            ? "Selecciona una organización primero" 
            : !hasProvider && item.requiresProvider 
            ? "Selecciona un proveedor primero" 
            : item.label;
          return (
            <Tooltip 
              title={!menuOpen ? tooltipText : ""} 
              placement="right" 
              key={item.path}
            >
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (!isDisabled) {
                      navigate(item.path);
                      setMobileOpen(false);
                    }
                  }}
                  disabled={isDisabled}
                  selected={location.pathname === item.path && !isDisabled}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    my: 0.2,
                    "&.Mui-selected": {
                      bgcolor: "primary.light",
                      color: "white",
                      "& .MuiListItemIcon-root": { color: "white" },
                    },
                    "&.Mui-disabled": {
                      opacity: 0.4,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isDisabled ? "text.disabled" : "primary.main",
                      minWidth: menuOpen ? 40 : 56,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {menuOpen && <ListItemText primary={item.label} />}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* role info removed per request */}
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
    {/* 🔹 TopBar con Avatar, rol y nombre de organización */}
    <TopBar organizationName={localStorage.getItem("organizationName") || ""} />
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

      {/* Modales de edición */}
      <EditOrganizationModal open={editOrgOpen} onClose={()=>setEditOrgOpen(false)} organizationId={organizationId} onUpdated={()=>window.location.reload()} />
      <EditAccountModal open={editAccountOpen} onClose={()=>setEditAccountOpen(false)} userId={userId} role={role || ""} onUpdated={()=>window.location.reload()} />

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