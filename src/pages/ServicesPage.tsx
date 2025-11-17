import React from 'react';
import { Box, Typography, Chip, Button, Stack, CircularProgress, Tooltip, Fab, TextField, MenuItem } from '@mui/material';
import { Add as AddFabIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useCRUDList, useForm } from '../hooks';
import { SelectableCardGrid, CreateFormDialog } from '../components';
import AvailabilityPicker from '../components/AvailabilityPicker';
import { getServicesByUser, createService, updateService, deleteService } from '../api/services';
import { getOrganization } from '../api/organizations';
import type { ClientDTO } from '../types/dto';

export default function ServicesPage() {
  const { userId, providerId } = useAuth();
  const { organizationId } = useAuth();
  const { notify } = useNotification();

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingService, setEditingService] = React.useState<any | null>(null);
  const [locations, setLocations] = React.useState<any[]>([]);

  const { formData, handleChange, handleSetField, reset } = useForm<any>({
    name: '',
    description: '',
    price: 0,
    durationMinutes: 30,
    advancePayment: 0,
    futureDays: 30,
    locationId: '',
    listAvailability: [],
  });

  const loadFn = React.useCallback(async () => {
    const id = providerId ?? userId; // prefer providerId
    if (!id) return [];
    const json = await getServicesByUser(id);
    return json.data ?? json ?? [];
  }, [providerId, userId]);

  const { filtered: services, loading, reload, setCreating, creating } = useCRUDList<any>(loadFn);

  // Cargar servicios al montar / cuando cambia el providerId o userId
  React.useEffect(() => {
    const id = providerId ?? userId;
    if (id) reload();
  }, [providerId, userId, reload]);

  // Cargar locations de la organización
  React.useEffect(() => {
    const loadOrg = async () => {
      try {
        if (!organizationId) return;
        const json = await getOrganization(organizationId);
        const org = json.data ?? json ?? {};
        const locs = org.locations ?? org.locationsList ?? [];
        setLocations(locs);
        // if only one location, set default in form (also helpful when editing/creating)
        if (locs && locs.length === 1) {
          handleChange({ target: { name: 'locationId', value: String(locs[0].id) } } as any);
        }
      } catch (err) {
        console.error('Error cargando organización:', err);
      }
    };

    loadOrg();
  }, [organizationId]);

  const handleSelect = (svc: any) => {
    // possibly navigate to detail page in future
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    reset();
    // if organization has a single location, preselect it
    if (locations.length === 1) {
      handleChange({ target: { name: 'locationId', value: String(locations[0].id) } } as any);
    }
    setOpenDialog(true);
  };

  const handleEdit = (svc: any) => {
    setEditingService(svc);
    // populate form
    const initial = {
      name: svc.name,
      description: svc.description,
      price: svc.price,
      durationMinutes: svc.durationMinutes ?? 30,
      advancePayment: svc.advancePayment ?? 0,
      futureDays: svc.futureDays ?? 30,
      locationId: svc.location?.id ?? '',
      listAvailability: svc.listAvailability ?? [],
    };
    Object.entries(initial).forEach(([k, v]) => handleChange({ target: { name: k, value: v } } as any));
    setOpenDialog(true);
  };

  const handleDelete = async (svc: any) => {
    if (!svc?.id) return;
    try {
      await deleteService(svc.id);
      notify('Servicio eliminado', 'success');
      await reload();
    } catch (err) {
      console.error('Error eliminando servicio', err);
      notify('No se pudo eliminar el servicio', 'error');
    }
  };

  const handleSubmit = async () => {
    // Validación campos obligatorios
    if (!formData.name?.trim()) {
      notify('El nombre es obligatorio', 'error');
      return;
    }
    if (!formData.description?.trim()) {
      notify('La descripción es obligatoria', 'error');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      notify('El precio debe ser mayor a 0', 'error');
      return;
    }
    if (!formData.listAvailability || formData.listAvailability.length === 0) {
      notify('Debe configurar al menos un día de disponibilidad', 'error');
      return;
    }
    // Validar que haya al menos un día habilitado con rangos
    const hasEnabledDay = formData.listAvailability.some((d: any) => d.enabled && d.ranges && d.ranges.length > 0);
    if (!hasEnabledDay) {
      notify('Debe habilitar al menos un día con horarios de disponibilidad', 'error');
      return;
    }

    try {
      setCreating(true);
      const id = providerId ?? userId;
      const serviceDto: any = {
        user: { id },
        location: { id: Number(formData.locationId) },
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        durationMinutes: Number(formData.durationMinutes),
        advancePayment: Number(formData.advancePayment || 0),
        futureDays: Number(formData.futureDays || 0),
      };

      const payload = {
        serviceDto,
        workInHollidays: true,
        listAvailability: formData.listAvailability || [],
      };

      if (editingService) {
        // include id if editing
        payload.serviceDto.id = editingService.id;
        await updateService(payload);
        notify('Servicio actualizado', 'success');
      } else {
        await createService(payload);
        notify('Servicio creado', 'success');
      }

      setOpenDialog(false);
      reset();
      await reload();
    } catch (err) {
      console.error('Error guardando servicio', err);
      notify('No se pudo guardar el servicio', 'error');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Servicios</Typography>
      </Box>

      <SelectableCardGrid<any>
        items={services}
        onSelect={handleSelect}
        onCreate={handleOpenCreate}
        renderContent={(svc) => (
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">{svc.description}</Typography>
            <Typography variant="body2" color="text.secondary">Precio: ${svc.price}</Typography>
            <Typography variant="body2" color="text.secondary">Duración: {svc.durationMinutes} min</Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
              <Button size="small" onClick={() => handleEdit(svc)}>Editar</Button>
              <Button size="small" color="error" onClick={() => handleDelete(svc)}>Eliminar</Button>
            </Box>
          </Stack>
        )}
      />

      <CreateFormDialog
        open={openDialog}
        title={editingService ? 'Editar servicio' : 'Crear servicio'}
        fields={[
          { name: 'name', label: 'Nombre', required: true },
          { name: 'description', label: 'Descripción', required: true },
          { name: 'price', label: 'Precio', type: 'text', required: true },
          { name: 'durationMinutes', label: 'Duración (min)', type: 'text' },
          { name: 'advancePayment', label: 'Pago adelantado', type: 'text' },
          { name: 'futureDays', label: 'Agenda (días futuros)', type: 'text' },
          // locationId field will be rendered below as a select via children
        ]}
        formData={formData}
        onFieldChange={(n, v) => handleChange({ target: { name: n, value: v } } as any)}
        onSubmit={handleSubmit}
        onCancel={() => { setOpenDialog(false); reset(); setEditingService(null); }}
        loading={creating}
      >
        {/* Location select: if no locations show info, if one location auto-selected and disabled */}
        {locations && locations.length > 0 ? (
          <TextField
            select
            label="Sede"
            name="locationId"
            value={formData.locationId || ''}
            onChange={(e) => handleChange({ target: { name: 'locationId', value: e.target.value } } as any)}
            fullWidth
            margin="normal"
            required
            disabled={locations.length === 1}
          >
            {locations.map((loc) => (
              <MenuItem key={loc.id} value={String(loc.id)}>
                {loc.name || loc.address || `Sede ${loc.id}`}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No se encontraron sedes para la organización.
          </Typography>
        )}

        {/* Availability picker */}
        <AvailabilityPicker
          value={formData.listAvailability}
          onChange={(v) => handleSetField('listAvailability', v)}
        />
      </CreateFormDialog>

      <Tooltip title="Agregar servicio">
        <Fab
          color="primary"
          onClick={handleOpenCreate}
          sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}
        >
          <AddFabIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
}
