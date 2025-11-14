import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AccessDenied() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        textAlign: "center",
        mt: 10,
      }}
    >
      <Typography variant="h4" gutterBottom>
        🚫 Acceso denegado
      </Typography>
      <Typography variant="body1" gutterBottom>
        No tenés permisos para ver esta sección.
      </Typography>
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => navigate("/")}
      >
        Volver al Dashboard
      </Button>
    </Box>
  );
}