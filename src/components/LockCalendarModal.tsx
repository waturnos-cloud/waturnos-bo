import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { es } from 'date-fns/locale';
import { addHours, setHours, setMinutes } from 'date-fns';

interface Service {
  id: number;
  name: string;
}

interface LockCalendarModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (startTime: string, endTime: string, serviceId: number) => void;
  loading?: boolean;
  services?: Service[];
}

export default function LockCalendarModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  services = []
}: LockCalendarModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [startTime, setStartTime] = useState<Date | null>(setHours(setMinutes(new Date(), 0), 9)); // 9:00 AM por defecto
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(setHours(setMinutes(new Date(), 0), 17)); // 5:00 PM por defecto
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      const now = new Date();
      setStartDate(now);
      setStartTime(setHours(setMinutes(now, 0), 9));
      setEndDate(now);
      setEndTime(setHours(setMinutes(now, 0), 17));
      setSelectedServiceId(services.length === 1 ? services[0].id : '');
    }
  }, [open, services]);

  const handleSubmit = () => {
    if (!startDate || !startTime || !endDate || !endTime || !selectedServiceId) return;

    // Combinar fecha y hora para crear DateTime completo
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    // Convertir a ISO string para enviar al backend
    const startISO = startDateTime.toISOString();
    const endISO = endDateTime.toISOString();

    onSubmit(startISO, endISO, selectedServiceId as number);
  };

  const handleClose = () => {
    // Resetear formulario
    const now = new Date();
    setStartDate(now);
    setStartTime(setHours(setMinutes(now, 0), 9));
    setEndDate(now);
    setEndTime(setHours(setMinutes(now, 0), 17));
    setSelectedServiceId('');
    onClose();
  };

  // Validaciones
  const isFormValid = startDate && startTime && endDate && endTime && selectedServiceId;
  
  let dateTimeError = '';
  if (startDate && startTime && endDate && endTime) {
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
    
    if (endDateTime <= startDateTime) {
      dateTimeError = 'La fecha y hora de fin debe ser posterior a la de inicio';
    }
  }

  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">🔒 Bloquear Agenda</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary">
                Selecciona el servicio y el rango de fechas y horas que deseas bloquear.
              </Typography>

              {/* Selector de servicio */}
              <FormControl fullWidth required>
                <InputLabel>Servicio</InputLabel>
                <Select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value as number)}
                  label="Servicio"
                >
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Fecha y hora de inicio */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  📅 Inicio del bloqueo
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Fecha de inicio"
                      value={startDate}
                      onChange={setStartDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                        }
                      }}
                      minDate={new Date()}
                      format="dd/MM/yyyy"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TimePicker
                      label="Hora de inicio"
                      value={startTime}
                      onChange={setStartTime}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                        }
                      }}
                      format="HH:mm"
                      ampm={false}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Fecha y hora de fin */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  🏁 Fin del bloqueo
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Fecha de fin"
                      value={endDate}
                      onChange={setEndDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                        }
                      }}
                      minDate={startDate || new Date()}
                      format="dd/MM/yyyy"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TimePicker
                      label="Hora de fin"
                      value={endTime}
                      onChange={setEndTime}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                        }
                      }}
                      format="HH:mm"
                      ampm={false}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Mensajes de error */}
              {dateTimeError && (
                <Typography color="error" variant="body2">
                  {dateTimeError}
                </Typography>
              )}

              {!selectedServiceId && services.length === 0 && (
                <Typography color="error" variant="body2">
                  No hay servicios disponibles para bloquear
                </Typography>
              )}
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!isFormValid || loading || services.length === 0}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {loading ? 'Bloqueando...' : 'Bloquear'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}