import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Fab,
  Tooltip,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import { Add as AddFabIcon, Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useCRUDList, useForm } from '../hooks';
import { SelectableCardGrid, CreateFormDialog, ConfirmDialog } from '../components';
import { getManagersByOrg, createManager, getUser, deleteUser } from '../api/users';

interface UserDTO {
  id?: number;
  fullName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  role?: string;
  active?: boolean;
}

export default function UsersPage() {
  const { organizationId } = useAuth();
  const { notify } = useNotification();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: UserDTO | null;
  }>({ open: false, user: null });
  const [processingDelete, setProcessingDelete] = useState(false);

  const { formData, handleChange, reset } = useForm({
    fullName: '',
    email: '',
    phone: '',
  });

  const loadUsers = React.useCallback(async () => {
    if (!organizationId) return [];
    const json = await getManagersByOrg(organizationId);
    return json.data ?? json ?? [];
  }, [organizationId]);

  const { filtered: users, loading, reload, setCreating, creating } = useCRUDList<UserDTO>(loadUsers);

  useEffect(() => {
    if (organizationId) reload();
  }, [organizationId, reload]);

  const handleViewDetail = async (user: UserDTO) => {
    if (!user.id) return;
    try {
      const json = await getUser(user.id);
      const fullUser = json.data ?? json;
      notify(`Usuario: ${fullUser.fullName}`, 'success');
      // TODO: Abrir modal de detalle si se requiere
    } catch (err) {
      console.error('Error cargando usuario:', err);
      notify('No se pudo cargar el usuario', 'error');
    }
  };

  const handleEdit = async (user: UserDTO) => {
    if (!user.id) return;
    try {
      const json = await getUser(user.id);
      const fullUser = json.data ?? json;
      setEditingUser(fullUser);
      handleChange({ target: { name: 'fullName', value: fullUser.fullName || '' } } as any);
      handleChange({ target: { name: 'email', value: fullUser.email || '' } } as any);
      handleChange({ target: { name: 'phone', value: fullUser.phone || '' } } as any);
      notify('La edición de usuarios no está implementada aún en el backend', 'warning');
      // setOpenDialog(true); // Descomentar cuando haya endpoint de actualización
    } catch (err) {
      console.error('Error cargando usuario:', err);
      notify('No se pudo cargar el usuario', 'error');
    }
  };

  const handleDelete = (user: UserDTO) => {
    setConfirmDialog({ open: true, user });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.user?.id) return;

    try {
      setProcessingDelete(true);
      await deleteUser(confirmDialog.user.id);
      notify('Usuario eliminado con éxito', 'success');
      setConfirmDialog({ open: false, user: null });
      await reload();
    } catch (err) {
      console.error('Error eliminando usuario:', err);
      notify('No se pudo eliminar el usuario', 'error');
    } finally {
      setProcessingDelete(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName?.trim()) {
      notify('El nombre completo es obligatorio', 'error');
      return;
    }
    if (!formData.email?.trim()) {
      notify('El email es obligatorio', 'error');
      return;
    }
    if (!formData.phone?.trim()) {
      notify('El teléfono es obligatorio', 'error');
      return;
    }

    try {
      setCreating(true);
      if (!organizationId) {
        notify('No se encontró la organización', 'error');
        return;
      }

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };

      await createManager(organizationId, payload);
      notify('Usuario creado con éxito', 'success');
      setOpenDialog(false);
      reset();
      await reload();
    } catch (err) {
      console.error('Error guardando usuario:', err);
      notify('No se pudo guardar el usuario', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    reset();
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Usuarios
        </Typography>
      </Box>

      <SelectableCardGrid<UserDTO>
        items={users}
        onSelect={handleViewDetail}
        onCreate={handleOpenCreate}
        onView={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderContent={(user) => (
          <Stack spacing={1} sx={{ mt: 1 }}>
            {user.email && (
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            )}
            {user.phone && (
              <Typography variant="body2" color="text.secondary">
                📞 {user.phone}
              </Typography>
            )}
            {user.role && (
              <Chip label={user.role} size="small" color="primary" sx={{ mt: 1 }} />
            )}
          </Stack>
        )}
      />

      <CreateFormDialog
        open={openDialog}
        title="Crear nuevo usuario"
        fields={[
          { name: 'fullName', label: 'Nombre completo', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Teléfono', required: true },
        ]}
        formData={formData}
        onFieldChange={(name, value) => handleChange({ target: { name, value } } as any)}
        onSubmit={handleSubmit}
        onCancel={() => {
          setOpenDialog(false);
          reset();
          setEditingUser(null);
        }}
        loading={creating}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar a "${confirmDialog.user?.fullName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ open: false, user: null })}
        severity="error"
        loading={processingDelete}
      />

      <Tooltip title="Agregar usuario">
        <Fab
          color="primary"
          onClick={handleOpenCreate}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          }}
        >
          <AddFabIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
}
