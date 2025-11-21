import { useState } from "react";
import ForgotPasswordDialog from "../components/ForgotPasswordDialog";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LoginIcon from "@mui/icons-material/Login";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [forgotOpen, setForgotOpen] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn({ email, password });
    } catch (err) {
      console.error("Error de login:", err);
      setErrors({ password: "Credenciales incorrectas" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #007BFF 0%, #28A745 100%)",
        p: 2,
      }}
    >
      {/* 🟦 LOGO / HEADER */}
      <Typography
        variant="h4"
        sx={{
          color: "white",
          fontWeight: 700,
          mb: 2,
          letterSpacing: 0.5,
          textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
        }}
      >
        WATurnos
      </Typography>

      <Card
        sx={{
          width: 380,
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        <CardContent component="form" onSubmit={onSubmit} sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
            }}
          >
            <LockOutlinedIcon
              sx={{ fontSize: 50, color: "primary.main", mb: 1 }}
            />
            <Typography variant="h6" fontWeight={600}>
              Iniciar sesión
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, mb: 2 }}
            >
              Accedé a tu panel de gestión
            </Typography>
          </Box>

          {/* 🧩 Email */}
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* 🔒 Contraseña */}
          <TextField
            fullWidth
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* 🔘 Botón Entrar */}
          <Button
            fullWidth
            variant="contained"
            type="submit"
            startIcon={<LoginIcon />}
            sx={{ mt: 3, py: 1.2, fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Entrar"}
          </Button>

          {/* 🔗 Enlace olvido */}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Link
              href="#"
              underline="hover"
              sx={{ fontSize: 14, color: "primary.main", fontWeight: 500 }}
              onClick={e => { e.preventDefault(); setForgotOpen(true); }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 🧠 Pie de página */}
          <Typography
            variant="caption"
            display="block"
            textAlign="center"
            color="text.secondary"
          >
            © {new Date().getFullYear()} WATurnos — Simplificá tus reservas
          </Typography>
        </CardContent>
      </Card>
    <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </Box>
  );
}