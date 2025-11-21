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
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Star as StarIcon,
} from '@mui/icons-material';

interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  main: boolean;
}

interface OrganizationDetail {
  id: number;
  name: string;
  type: string | { id: number; name: string; children?: any[] };
  active: boolean;
  status: string;
  locations: Location[];
  simpleOrganization: boolean;
  logoUrl?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  organization: OrganizationDetail | null;
  loading?: boolean;
}

export default function OrganizationDetailModal({ open, onClose, organization, loading }: Props) {
  if (!organization && !loading) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {organization?.logoUrl ? (
            <Avatar 
              src={organization.logoUrl.startsWith('http') ? organization.logoUrl : `/images/${organization.logoUrl.replace(/^\/images\//, '')}`} 
              sx={{ width: 56, height: 56 }} 
            />
          ) : (
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              {organization?.name?.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {organization?.name || 'Cargando...'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip
                label={organization?.simpleOrganization ? 'Simple' : 'Multi'}
                size="small"
                color={organization?.simpleOrganization ? 'success' : 'primary'}
              />
              <Chip
                label={organization?.active ? 'Activa' : 'Inactiva'}
                size="small"
                color={organization?.active ? 'success' : 'default'}
              />
            </Stack>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : organization ? (
          <Stack spacing={3}>
            {/* Información general */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tipo
              </Typography>
              <Typography variant="body1">
                {typeof organization.type === 'object' && organization.type?.name
                  ? String(organization.type.name)
                  : String(organization.type || 'No especificado')}
              </Typography>
            </Box>

            <Divider />

            {/* Sedes */}
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Sedes ({organization.locations?.length || 0})
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {organization.locations && organization.locations.length > 0 ? (
                  organization.locations.map((loc) => (
                    <Box
                      key={loc.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: loc.main ? 'primary.main' : 'divider',
                        bgcolor: loc.main ? 'primary.50' : 'background.paper',
                        position: 'relative',
                      }}
                    >
                      {loc.main && (
                        <Chip
                          icon={<StarIcon />}
                          label="Sede Principal"
                          size="small"
                          color="primary"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                        />
                      )}
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {loc.name}
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {loc.address}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {loc.phone}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {loc.email}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Coordenadas: {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                        </Typography>
                      </Stack>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay sedes registradas
                  </Typography>
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
