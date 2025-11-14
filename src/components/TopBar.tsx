// src/components/TopBar.tsx
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../auth/AuthContext";

export default function TopBar() {
  const { role, signOut } = useAuth();

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Izquierda */}
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          WATurnos
        </Typography>

        {/* Derecha */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {role && (
            <Typography
              variant="body2"
              sx={{ opacity: 0.85, fontStyle: "italic", fontWeight: 400 }}
            >
              Rol: {role}
            </Typography>
          )}

          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={signOut}
          >
            Salir
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}