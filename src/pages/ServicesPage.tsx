import React from 'react';
import { Box, Typography, Chip, Button, Stack, CircularProgress, Tooltip, Fab, TextField, MenuItem } from '@mui/material';
import { Add as AddFabIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useCRUDList, useForm } from '../hooks';
import { SelectableCardGrid, CreateServiceWizard } from '../components';
import { getServicesByUser, createService, updateService, deleteService } from '../api/services';
import { getOrganization } from '../api/organizations';
import { getCategoryChildren } from '../api/categories';
import type { ClientDTO } from '../types/dto';

export default function ServicesPage() {
  const { userId, providerId } = useAuth();
  const { organizationId } = useAuth();
  const { notify } = useNotification();

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingService, setEditingService] = React.useState<any | null>(null);
  const [locations, setLocations] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [organizationType, setOrganizationType] = React.useState<any>(null);

  const { formData, handleChange, handleSetField, reset } = useForm<any>({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    durationMinutes: 30,
    capacity: 1,
    advancePayment: 0,
    futureDays: 30,
    workInHollidays: true,
    locationId: '',
    listAvailability: [],
  });

  const loadFn = React.useCallback(async () => {
    const id = providerId ?? userId; // prefer providerId
    if (!id) return [];
    const json = await getServicesByUser(id);
    const services = json.data ?? json ?? [];
    // Transformar type/category a string si es un objeto
    return services.map((svc: any) => ({
      ...svc,
      type: typeof svc.type === 'object' && svc.type?.name ? svc.type.name : svc.type,
      category: typeof svc.category === 'object' && svc.category?.name ? svc.category.name : svc.category,
    }));
  }, [providerId, userId]);

  const { filtered: services, loading, reload, setCreating, creating } = useCRUDList<any>(loadFn);

  // Cargar servicios al montar / cuando cambia el providerId o userId
  React.useEffect(() => {
    const id = providerId ?? userId;
    if (id) reload();
  }, [providerId, userId, reload]);

  // Cargar locations de la organización y subcategorías
  React.useEffect(() => {
    const loadOrg = async () => {
      try {
        if (!organizationId) return;
        const json = await getOrganization(organizationId);
        const org = json.data ?? json ?? {};
        const locs = org.locations ?? org.locationsList ?? [];
        setLocations(locs);
        
        // Guardar el tipo de organización para obtener subcategorías
        setOrganizationType(org.type);
        
        // Cargar subcategorías si el tipo tiene un id
        if (org.type && (org.type.id || typeof org.type === 'number')) {
          const typeId = org.type.id || org.type;
          const catJson = await getCategoryChildren(typeId);
          const subcategories = catJson.data ?? catJson ?? [];
          setCategories(subcategories);
        }
        
        // Preselect location: if only one or find the main one
        if (locs && locs.length === 1) {
          handleChange({ target: { name: 'locationId', value: String(locs[0].id) } } as any);
        } else if (locs && locs.length > 1) {
          const mainLocation = locs.find((loc: any) => loc.main === true);
          if (mainLocation) {
            handleChange({ target: { name: 'locationId', value: String(mainLocation.id) } } as any);
          }
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
    // Preselect location: if only one or find the main one
    if (locations.length === 1) {
      handleChange({ target: { name: 'locationId', value: String(locations[0].id) } } as any);
    } else {
      const mainLocation = locations.find((loc: any) => loc.main === true);
      if (mainLocation) {
        handleChange({ target: { name: 'locationId', value: String(mainLocation.id) } } as any);
      }
    }
    setOpenDialog(true);
  };

  const handleEdit = (svc: any) => {
    setEditingService(svc);
    // populate form
    const initial = {
      name: svc.name,
      description: svc.description,
      categoryId: svc.category?.id ?? '',
      price: svc.price,
      durationMinutes: svc.durationMinutes ?? 30,
      capacity: svc.capacity ?? 1,
      advancePayment: svc.advancePayment ?? 0,
      futureDays: svc.futureDays ?? 30,
      workInHollidays: svc.workInHollidays ?? true,
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
        capacity: Number(formData.capacity || 1),
        advancePayment: Number(formData.advancePayment || 0),
        futureDays: Number(formData.futureDays || 0),
      };

      // Transform availability: flatten ranges into individual objects with dayOfWeek, startTime, endTime
      const flattenedAvailability: any[] = [];
      (formData.listAvailability || []).forEach((day: any) => {
        if (day.enabled && day.ranges && day.ranges.length > 0) {
          day.ranges.forEach((range: any) => {
            flattenedAvailability.push({
              dayOfWeek: day.dayOfWeek,
              startTime: range.start,
              endTime: range.end,
            });
          });
        }
      });

      const payload = {
        serviceDto,
        workInHollidays: formData.workInHollidays ?? true,
        listAvailability: flattenedAvailability,
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
    } catch (err: any) {
      console.error('Error guardando servicio', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'No se pudo guardar el servicio';
      notify(errorMessage, 'error');
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

      <CreateServiceWizard
        open={openDialog}
        onClose={() => { setOpenDialog(false); reset(); setEditingService(null); }}
        onSubmit={handleSubmit}
        formData={formData}
        onFieldChange={(name: string, value: any) => handleChange({ target: { name, value } } as any)}
        locations={locations}
        categories={categories}
        loading={creating}
      />

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
