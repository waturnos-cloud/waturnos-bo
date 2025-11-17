/**
 * Modal para crear clientes.
 * Reutilizable en DashboardPage y otras páginas.
 */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import type { ClientDTO } from '../types/dto';

export interface CreateClientModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (client: Partial<ClientDTO>) => Promise<void>;
  loading?: boolean;
}

export function CreateClientModal({ open, onClose, onSubmit, loading = false }: CreateClientModalProps) {
  const [newClient, setNewClient] = React.useState<Partial<ClientDTO>>({
    fullName: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async () => {
    await onSubmit(newClient);
    setNewClient({ fullName: "", phone: "", email: "" });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Nuevo Cliente
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Completá los datos para registrar un nuevo cliente.
        </Typography>

        <TextField
          fullWidth
          label="Nombre completo"
          margin="normal"
          value={newClient.fullName || ""}
          onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Teléfono"
          margin="normal"
          value={newClient.phone || ""}
          onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
          placeholder="Ej: 2494123456"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          value={newClient.email || ""}
          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ textTransform: "none", px: 4, fontWeight: 600 }}
        >
          {loading ? "Guardando..." : "Crear cliente"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
