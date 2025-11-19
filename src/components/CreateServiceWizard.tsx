import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Fade,
  Slide,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AvailabilityPicker from './AvailabilityPicker';

interface FormData {
  name: string;
  description: string;
  categoryId: string;
  locationId: string;
  price: number;
  durationMinutes: number;
  capacity: number;
  advancePayment: number;
  futureDays: number;
  workInHollidays: boolean;
  listAvailability: any[];
}

interface Location {
  id: number;
  name?: string;
  address?: string;
}

interface Category {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: FormData;
  onFieldChange: (name: string, value: any) => void;
  locations: Location[];
  categories: Category[];
  loading: boolean;
}

const steps = ['Información Básica', 'Configuración del Servicio', 'Disponibilidad'];

export default function CreateServiceWizard({
  open,
  onClose,
  onSubmit,
  formData,
  onFieldChange,
  locations,
  categories,
  loading,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  const handleNext = () => {
    if (activeStep === 0) {
      // Validar paso 1
      if (!formData.name || !formData.description || !formData.categoryId || !formData.locationId || !formData.price || formData.price <= 0) {
        return;
      }
    } else if (activeStep === 1) {
      // Validar paso 2
      if (!formData.durationMinutes || formData.durationMinutes <= 0) {
        return;
      }
    } else if (activeStep === 2) {
      // Validar paso 3 - disponibilidad
      const hasEnabledDay = formData.listAvailability?.some(
        (d: any) => d.enabled && d.ranges && d.ranges.length > 0
      );
      if (!hasEnabledDay) {
        return;
      }
    }
    setSlideDirection('left');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setSlideDirection('right');
    setActiveStep((prev) => prev - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      {/* Loading Overlay */}
      <Fade in={loading}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: loading ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
            }}
          >
            <CircularProgress
              size={70}
              thickness={4}
              sx={{
                color: 'primary.main',
                animationDuration: '1s',
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress
                size={50}
                thickness={4}
                sx={{
                  color: 'primary.light',
                  animationDuration: '1.5s',
                }}
              />
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
              Creando Servicio
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Por favor espera, esto puede tomar unos segundos...
            </Typography>
          </Box>
        </Box>
      </Fade>

      <DialogTitle>
        <Box component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
          {steps[activeStep]}
        </Box>
      </DialogTitle>

      {/* Stepper */}
      <Box sx={{ px: 3, pt: 2 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: activeStep === index ? 600 : 400,
                  },
                  '& .MuiStepIcon-root': {
                    color: activeStep > index ? '#4CAF50' : undefined,
                  },
                  '& .MuiStepIcon-root.Mui-active': {
                    color: '#1976D2',
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ minHeight: 500, maxHeight: '70vh', position: 'relative', overflow: 'hidden', px: 3 }}>
        {/* Paso 1: Información Básica */}
        <Slide direction={slideDirection} in={activeStep === 0} mountOnEnter unmountOnExit>
          <Box sx={{ position: 'absolute', width: 'calc(100% - 48px)', overflowY: 'auto', maxHeight: 'calc(70vh - 100px)' }}>
            <TextField
              label="Nombre del Servicio"
              name="name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              required
              autoFocus
            />

            <TextField
              label="Descripción"
              name="description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              required
            />

            <TextField
              select
              label="Categoría"
              value={formData.categoryId || ''}
              onChange={(e) => onFieldChange('categoryId', e.target.value)}
              fullWidth
              margin="normal"
              required
            >
              <MenuItem value="" disabled>
                Selecciona una categoría
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Sede"
              name="locationId"
              value={formData.locationId}
              onChange={(e) => onFieldChange('locationId', e.target.value)}
              fullWidth
              margin="normal"
              required
              disabled={locations.length === 1}
              helperText={locations.length === 1 ? 'Sede principal seleccionada automáticamente' : ''}
            >
              {locations.length === 0 ? (
                <MenuItem value="">No hay sedes disponibles</MenuItem>
              ) : (
                locations.map((loc) => (
                  <MenuItem key={loc.id} value={String(loc.id)}>
                    {loc.name || loc.address || `Sede ${loc.id}`}
                  </MenuItem>
                ))
              )}
            </TextField>

            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Precio"
                name="price"
                type="number"
                fullWidth
                margin="normal"
                value={formData.price || ''}
                onChange={(e) => onFieldChange('price', Number(e.target.value))}
                required
                InputProps={{
                  startAdornment: <Box sx={{ mr: 1 }}>$</Box>,
                }}
                helperText="Precio total del servicio"
              />
            </Box>
          </Box>
        </Slide>

        {/* Paso 2: Configuración del Servicio */}
        <Slide direction={slideDirection} in={activeStep === 1} mountOnEnter unmountOnExit>
          <Box sx={{ position: 'absolute', width: 'calc(100% - 48px)', overflowY: 'auto', maxHeight: 'calc(70vh - 100px)' }}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Duración (minutos)"
                name="durationMinutes"
                type="number"
                fullWidth
                margin="normal"
                value={formData.durationMinutes || 30}
                onChange={(e) => onFieldChange('durationMinutes', Number(e.target.value))}
                required
                helperText="Tiempo que dura el servicio (por defecto 30 minutos)"
              />
            </Box>

            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Capacidad (Cupo)"
                name="capacity"
                type="number"
                fullWidth
                margin="normal"
                value={formData.capacity || 1}
                onChange={(e) => onFieldChange('capacity', Number(e.target.value))}
                disabled
                helperText="Cantidad de personas permitidas por turno (actualmente limitado a 1)"
              />
            </Box>

            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Seña (%)"
                name="advancePayment"
                type="number"
                fullWidth
                margin="normal"
                value={formData.advancePayment || 0}
                onChange={(e) => onFieldChange('advancePayment', Number(e.target.value))}
                InputProps={{
                  endAdornment: <Box sx={{ ml: 1 }}>%</Box>,
                }}
                helperText="Porcentaje de seña requerido al reservar (0 = sin seña)"
              />
            </Box>

            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Días de Anticipación"
                name="futureDays"
                type="number"
                fullWidth
                margin="normal"
                value={formData.futureDays || 30}
                onChange={(e) => onFieldChange('futureDays', Number(e.target.value))}
                helperText="Máximo de días futuros para reservar (0 = sin límite)"
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.workInHollidays}
                  onChange={(e) => onFieldChange('workInHollidays', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    Trabajar en Feriados
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ¿El servicio está disponible en días feriados?
                  </Typography>
                </Box>
              }
              sx={{ mt: 2 }}
            />
          </Box>
        </Slide>

        {/* Paso 3: Disponibilidad */}
        <Slide direction={slideDirection} in={activeStep === 2} mountOnEnter unmountOnExit>
          <Box sx={{ position: 'absolute', width: 'calc(100% - 48px)', overflowY: 'auto', maxHeight: 'calc(70vh - 100px)' }}>
            <AvailabilityPicker
              value={formData.listAvailability}
              onChange={(v) => onFieldChange('listAvailability', v)}
            />
          </Box>
        </Slide>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={loading}>
              Atrás
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext} disabled={loading}>
              Siguiente
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Creando...' : 'Crear Servicio'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
