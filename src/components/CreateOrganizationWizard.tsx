import React, { useState } from 'react';
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
  FormControlLabel,
  Switch,
  CircularProgress,
  Fade,
  Slide,
  IconButton,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { LocationMarker } from './LocationMarker';
import '../utils/leafletConfig';
import type { CategoryDTO } from '../types/dto';

// Componente helper para actualizar el centro del mapa
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

interface FormData {
  name: string;
  logoUrl: string;
  type: string;
  simpleOrganization: boolean;
  managerFullName: string;
  managerEmail: string;
  managerPhone: string;
  managerPassword: string;
  locationName: string;
  locationAddress: string;
}

interface Location {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: FormData;
  onFieldChange: (name: string, value: any) => void;
  categories: CategoryDTO[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  location: Location;
  onLocationChange: (lat: number, lng: number) => void;
  loading: boolean;
}

const steps = ['Información Básica', 'Datos del Manager', 'Ubicación'];

export default function CreateOrganizationWizard({
  open,
  onClose,
  onSubmit,
  formData,
  onFieldChange,
  categories,
  selectedCategory,
  onCategoryChange,
  location,
  onLocationChange,
  loading,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Validador de email
  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError('El email es obligatorio');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Ingresa un email válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validador de teléfono (acepta formatos internacionales)
  const validatePhone = (phone: string): boolean => {
    if (!phone) {
      setPhoneError('El teléfono es obligatorio');
      return false;
    }
    // Acepta números con +, espacios, guiones y paréntesis
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setPhoneError('Ingresa un teléfono válido');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSearchAddress = async () => {
    if (!formData.locationAddress) return;

    setSearchingAddress(true);
    try {
      // Usar Nominatim (OpenStreetMap) para geocodificación
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          formData.locationAddress
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        onLocationChange(parseFloat(lat), parseFloat(lon));
      }
    } catch (error) {
      console.error('Error buscando dirección:', error);
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validar paso 1
      if (!formData.name || !selectedCategory) {
        return;
      }
    } else if (activeStep === 1) {
      // Validar paso 2
      if (!formData.managerFullName || !formData.managerEmail || !formData.managerPhone) {
        return;
      }
      // Validar email y teléfono
      if (!validateEmail(formData.managerEmail) || !validatePhone(formData.managerPhone)) {
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
    setEmailError('');
    setPhoneError('');
    onClose();
  };

  const handleSubmit = async () => {
    onSubmit();
    // No resetear el step aquí, se hará cuando se cierre el modal después de crear
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
              Creando Organización
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Por favor espera, esto puede tomar unos segundos...
            </Typography>
          </Box>
        </Box>
      </Fade>

      <DialogTitle>
        <Box component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
          Crear Nueva Organización
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

      <DialogContent sx={{ minHeight: 450, position: 'relative', overflow: 'hidden', px: 3 }}>
        {/* Paso 1: Información Básica */}
        <Slide direction={slideDirection} in={activeStep === 0} mountOnEnter unmountOnExit>
          <Box sx={{ position: 'absolute', width: 'calc(100% - 48px)' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: 'primary.main' }}>
              Información Básica
            </Typography>

            <TextField
              label="Nombre de la Organización"
              name="name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              required
              autoFocus
            />

            <TextField
              label="URL del Logo"
              name="logoUrl"
              fullWidth
              margin="normal"
              value={formData.logoUrl}
              onChange={(e) => onFieldChange('logoUrl', e.target.value)}
              helperText="URL de la imagen del logo (opcional)"
            />

            <TextField
              select
              label="Categoría"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              SelectProps={{ native: true }}
              fullWidth
              margin="normal"
              required
            >
              <option value=""></option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.simpleOrganization}
                  onChange={(e) => onFieldChange('simpleOrganization', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {formData.simpleOrganization ? 'Organización Simple' : 'Organización Multi'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.simpleOrganization
                      ? 'Un único proveedor para todos los servicios'
                      : 'Múltiples proveedores con sus propios servicios'}
                  </Typography>
                </Box>
              }
              sx={{ mt: 2 }}
            />
          </Box>
        </Slide>

        {/* Paso 2: Datos del Manager */}
        <Slide direction={slideDirection} in={activeStep === 1} mountOnEnter unmountOnExit>
          <Box sx={{ position: 'absolute', width: 'calc(100% - 48px)', minHeight: 450 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: 'primary.main' }}>
              Datos del Manager
            </Typography>

            <TextField
              label="Nombre Completo"
              name="managerFullName"
              fullWidth
              margin="normal"
              value={formData.managerFullName}
              onChange={(e) => onFieldChange('managerFullName', e.target.value)}
              required
              autoFocus
            />

            <TextField
              label="Email"
              name="managerEmail"
              type="email"
              fullWidth
              margin="normal"
              value={formData.managerEmail}
              onChange={(e) => {
                onFieldChange('managerEmail', e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={(e) => validateEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError || 'Ejemplo: usuario@dominio.com'}
              required
            />

            <TextField
              label="Teléfono"
              name="managerPhone"
              fullWidth
              margin="normal"
              value={formData.managerPhone}
              onChange={(e) => {
                onFieldChange('managerPhone', e.target.value);
                if (phoneError) validatePhone(e.target.value);
              }}
              onBlur={(e) => validatePhone(e.target.value)}
              error={!!phoneError}
              helperText={phoneError || 'Ejemplo: +54 9 11 1234-5678'}
              required
            />

            <TextField
              label="Contraseña"
              name="managerPassword"
              type="password"
              fullWidth
              margin="normal"
              value={formData.managerPassword}
              onChange={(e) => onFieldChange('managerPassword', e.target.value)}
              helperText="La contraseña por defecto es 12345"
              disabled
            />
          </Box>
        </Slide>

        {/* Paso 3: Ubicación */}
        <Slide direction={slideDirection} in={activeStep === 2} mountOnEnter unmountOnExit>
          <Box sx={{ position: 'absolute', width: 'calc(100% - 48px)' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: 'primary.main' }}>
              Ubicación de la Sede Principal
            </Typography>

            <TextField
              label="Nombre de la Sede"
              name="locationName"
              fullWidth
              margin="normal"
              value={formData.locationName}
              onChange={(e) => onFieldChange('locationName', e.target.value)}
              autoFocus
            />

            <TextField
              label="Dirección"
              name="locationAddress"
              fullWidth
              margin="normal"
              value={formData.locationAddress}
              onChange={(e) => onFieldChange('locationAddress', e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchAddress();
                }
              }}
              helperText="Ingresa la dirección y presiona Enter o haz clic en el botón de búsqueda"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSearchAddress}
                      disabled={!formData.locationAddress || searchingAddress}
                      edge="end"
                    >
                      {searchingAddress ? <CircularProgress size={20} /> : <SearchIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mt: 3, height: 250, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              <MapContainer
                {...({
                  center: [location.lat, location.lng],
                  zoom: 13,
                  style: { height: '100%', width: '100%' },
                } as any)}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapUpdater center={[location.lat, location.lng]} />
                <LocationMarker
                  position={{ lat: location.lat, lng: location.lng }}
                  onPositionChange={onLocationChange}
                />
              </MapContainer>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Haz clic en el mapa para ajustar la ubicación manualmente
            </Typography>
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
              {loading ? 'Creando...' : 'Crear Organización'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
