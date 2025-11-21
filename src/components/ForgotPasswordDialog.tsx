import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ForgotPasswordDialog({ open, onClose }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!email.trim()) {
      setError("El email es obligatorio");
      return;
    }
    setLoading(true);
    try {
      const body = {
        email,
        userType: "USER"
      };
      // Usar authFetch para mantener la forma de invocación igual al resto de los servicios
      const res = await (await import("../api/http")).authFetch("/public/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.status < 200 || res.status >= 300) throw new Error("No se pudo enviar el email");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess(false);
    setLoading(false);
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Recuperar contraseña</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Ingresá tu email para recibir las instrucciones de recuperación.
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={e => setEmail(e.target.value)}
            margin="normal"
            required
            error={!!error}
            helperText={error}
            disabled={loading || success}
          />
          {success && (
            <Typography color="success.main" sx={{ mt: 2 }}>
              ¡Email enviado! Revisá tu bandeja de entrada.
            </Typography>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cerrar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || success}>
          {loading ? <CircularProgress size={20} /> : "Enviar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
