/**
 * Modal para asignar turnos a clientes.
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
import { Autocomplete } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import type { ClientDTO } from '../types/dto';
import type { Appointment } from '../types/types';

export interface AssignBookingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (bookingId: number, clientId: number) => Promise<void>;
  turnos: Appointment[];
  clients: ClientDTO[];
  onAddClient?: () => void;
  loading?: boolean;
}

export function AssignBookingModal({
  open,
  onClose,
  onSubmit,
  turnos,
  clients,
  onAddClient,
  loading = false,
}: AssignBookingModalProps) {
  const [selectedBooking, setSelectedBooking] = React.useState<number | "">("");
  const [selectedClient, setSelectedClient] = React.useState<number | "">("");

  const handleSubmit = async () => {
    if (!selectedBooking || !selectedClient) {
      alert("Seleccioná turno y cliente.");
      return;
    }
    await onSubmit(Number(selectedBooking), Number(selectedClient));
    setSelectedBooking("");
    setSelectedClient("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Asignar Turno
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Seleccioná un turno libre y asignalo a un cliente.
        </Typography>

        <TextField
          select
          fullWidth
          label="Turno disponible"
          margin="normal"
          value={selectedBooking}
          onChange={(e) => setSelectedBooking(Number(e.target.value))}
          SelectProps={{ native: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EventAvailableIcon color="action" />
              </InputAdornment>
            ),
          }}
        >
          <option value="">-- Seleccionar turno --</option>
          {turnos
            .filter((t) => t.status === "FREE")
            .map((t) => (
              <option key={t.id} value={t.id}>
                {new Date(t.startTime).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </option>
            ))}
        </TextField>

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography fontWeight={600}>Cliente</Typography>
            {onAddClient && (
              <Button size="small" variant="outlined" onClick={onAddClient} sx={{ textTransform: "none" }}>
                + Nuevo Cliente
              </Button>
            )}
          </Box>

          <Autocomplete<ClientDTO>
            fullWidth
            options={clients}
            getOptionLabel={(c) => `${c.fullName} — ${c.phone || "Sin teléfono"}`}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar cliente..."
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            filterOptions={(options, { inputValue }) =>
              options.filter(
                (c) =>
                  c.fullName.toLowerCase().includes(inputValue.toLowerCase()) ||
                  (c.phone || "").toLowerCase().includes(inputValue.toLowerCase()) ||
                  (c.email || "").toLowerCase().includes(inputValue.toLowerCase())
              )
            }
            value={clients.find((c) => c.id === selectedClient) || null}
            onChange={(_, value) => setSelectedClient(value ? (value.id as number) : "")}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ textTransform: "none", fontWeight: 600, px: 4 }}
        >
          {loading ? "Asignando..." : "Asignar turno"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
