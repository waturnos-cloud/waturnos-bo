import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authFetch } from "../api/http";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const userType = searchParams.get("userType") || "USER";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password || !confirm) {
      setError("Ambos campos son obligatorios");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const body = { token, userType, newPassword: password };
      const res = await authFetch("/public/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.status < 200 || res.status >= 300) throw new Error("No se pudo cambiar la contraseña");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #007BFF 0%, #28A745 100%)" }}>
      <Card sx={{ width: 380, borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2} textAlign="center">Restablecer contraseña</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Nueva contraseña"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <TextField
              label="Repetir contraseña"
              type="password"
              fullWidth
              margin="normal"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              error={!!error && password !== confirm}
              helperText={password !== confirm ? "Las contraseñas deben coincidir" : ""}
            />
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            {success && <Typography color="success.main" sx={{ mt: 2 }}>¡Contraseña cambiada con éxito! Redirigiendo...</Typography>}
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={loading || success}>
              {loading ? <CircularProgress size={20} /> : "Restablecer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
