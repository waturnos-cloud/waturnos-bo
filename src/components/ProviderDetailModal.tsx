import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

interface ProviderDetail {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  bio?: string;
  photoUrl?: string;
  active?: boolean;
  role?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  provider: ProviderDetail | null;
  loading?: boolean;
}

export default function ProviderDetailModal({ open, onClose, provider, loading }: Props) {
  if (!provider && !loading) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {provider?.photoUrl ? (
            <Avatar src={provider.photoUrl} sx={{ width: 56, height: 56 }} />
          ) : (
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              {provider?.fullName?.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {provider?.fullName || 'Cargando...'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              {provider?.role && (
                <Chip label={provider.role} size="small" color="primary" />
              )}
              {provider?.active !== undefined && (
                <Chip
                  label={provider.active ? 'Activo' : 'Inactivo'}
                  size="small"
                  color={provider.active ? 'success' : 'default'}
                />
              )}
            </Stack>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : provider ? (
          <Stack spacing={3}>
            {/* Bio / Especialidad */}
            {provider.bio && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Bio / Especialidad
                </Typography>
                <Typography variant="body1">{provider.bio}</Typography>
              </Box>
            )}

            <Divider />

            {/* Información de contacto */}
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Contacto
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {provider.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {provider.email}
                    </Typography>
                  </Box>
                )}
                {provider.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {provider.phone}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
