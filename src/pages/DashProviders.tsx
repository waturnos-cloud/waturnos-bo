import { useEffect } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Fab,
  Tooltip,
} from "@mui/material";
import { Add as AddFabIcon } from "@mui/icons-material";
import React from 'react';
import { getProvidersByOrg, createProvider, getProvider, updateProvider, deleteProvider } from "../api/organizations";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import type { ProviderDTO } from "../types/dto";
import { useCRUDList, useForm } from "../hooks";
import { CreateFormDialog, SelectableCardGrid, ConfirmDialog, ProviderDetailModal } from "../components";
import { useState } from "react";

const PROVIDER_FORM_FIELDS = [
  { name: 'fullName', label: 'Nombre completo', required: true },
  { name: 'email', label: 'Email', type: 'email' as const, required: true },
  { name: 'phone', label: 'Teléfono', type: 'tel' as const, required: true },
  { name: 'bio', label: 'Bio / Especialidad', type: 'textarea' as const, multiline: true, rows: 2, required: true },
  { name: 'fotoUrl', label: 'URL de foto (opcional)', type: 'text' as const },
];

export default function DashProviders(): JSX.Element {
  const orgId = Number(localStorage.getItem("organizationId"));
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingProvider, setEditingProvider] = React.useState<ProviderDTO | null>(null);
  const [detailProvider, setDetailProvider] = React.useState<any | null>(null);
  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    provider: ProviderDTO | null;
  }>({ open: false, provider: null });
  const [processingDelete, setProcessingDelete] = React.useState(false);

  const { formData, handleChange, reset } = useForm({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    fotoUrl: "",
  });

  const loadProviders = React.useCallback(async () => {
    if (!orgId) return [];
    const json = await getProvidersByOrg(orgId);
    return json.data ?? json ?? [];
  }, [orgId]);

  const { filtered: providers, loading, reload, setCreating, creating } = useCRUDList<ProviderDTO>(
    loadProviders
  );

  useEffect(() => {
    if (orgId) reload();
  }, [orgId, reload]);

  const handleViewDetail = async (prov: ProviderDTO) => {
    if (!prov.id) return;
    try {
      setLoadingDetail(true);
      setOpenDetailModal(true);
      const json = await getProvider(prov.id);
      setDetailProvider(json.data ?? json);
    } catch (err) {
      console.error('Error cargando detalle:', err);
      notify('No se pudo cargar el detalle del proveedor', 'error');
      setOpenDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEdit = async (prov: ProviderDTO) => {
    if (!prov.id) return;
    try {
      setLoadingDetail(true);
      const json = await getProvider(prov.id);
      const fullProv = json.data ?? json;
      setEditingProvider(fullProv);
      handleChange({ target: { name: 'fullName', value: fullProv.fullName || '' } } as any);
      handleChange({ target: { name: 'email', value: fullProv.email || '' } } as any);
      handleChange({ target: { name: 'phone', value: fullProv.phone || '' } } as any);
      handleChange({ target: { name: 'bio', value: fullProv.bio || '' } } as any);
      handleChange({ target: { name: 'fotoUrl', value: fullProv.photoUrl || fullProv.fotoUrl || '' } } as any);
      setOpenDialog(true);
    } catch (err) {
      console.error('Error cargando proveedor:', err);
      notify('No se pudo cargar el proveedor', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = (prov: ProviderDTO) => {
    setConfirmDialog({ open: true, provider: prov });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.provider?.id) return;

    try {
      setProcessingDelete(true);
      await deleteProvider(confirmDialog.provider.id);
      notify('Proveedor eliminado con éxito', 'success');
      setConfirmDialog({ open: false, provider: null });
      await reload();
    } catch (err) {
      console.error('Error eliminando proveedor:', err);
      notify('No se pudo eliminar el proveedor', 'error');
    } finally {
      setProcessingDelete(false);
    }
  };

  const handleSelect = (prov: ProviderDTO) => {
    try {
      if (prov.id) localStorage.setItem("providerId", String(prov.id));
      if (prov.fullName) localStorage.setItem("providerName", prov.fullName);
      window.dispatchEvent(new CustomEvent("auth:update", {
        detail: {
          providerId: prov.id,
          providerName: prov.fullName,
        }
      }));
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error seleccionando proveedor:", err);
    }
  };

  const handleCreateProvider = async () => {
    try {
      const { fullName, email, phone, bio } = formData;
      if (!fullName || !email || !phone || !bio) {
        notify("Por favor completá todos los campos obligatorios.", "warning");
        return;
      }

      setCreating(true);

      if (editingProvider) {
        // Modo edición
        const updatePayload = {
          id: editingProvider.id,
          fullName,
          email,
          phone,
          bio,
          photoUrl: formData.fotoUrl || null,
        };
        await updateProvider(updatePayload);
        notify(`Proveedor ${fullName} actualizado con éxito.`, "success");
      } else {
        // Modo creación
        if (!orgId) {
          notify("No se encontró la organización.", "error");
          setCreating(false);
          return;
        }
        const json = await createProvider(orgId, formData);
        const provider = json.data ?? json;
        notify(`Proveedor ${provider.fullName || fullName} creado con éxito.`, "success");
      }

      setOpenDialog(false);
      reset();
      setEditingProvider(null);
      await reload();
    } catch (err) {
      console.error("Error al guardar proveedor:", err);
      notify("No se pudo guardar el proveedor.", "error");
    } finally {
      setCreating(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 4, position: "relative" }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Proveedores
      </Typography>

      <SelectableCardGrid<ProviderDTO>
        items={providers}
        onSelect={handleSelect}
        onCreate={() => setOpenDialog(true)}
        onView={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderContent={(prov) => (
          <Typography variant="body2" color="text.secondary">
            {prov.bio || prov.email}
          </Typography>
        )}
        xs={12}
        sm={6}
        md={4}
        lg={3}
        spacing={3}
      />

      <CreateFormDialog
        open={openDialog}
        title={editingProvider ? 'Editar proveedor' : 'Crear nuevo proveedor'}
        fields={PROVIDER_FORM_FIELDS}
        formData={formData}
        onFieldChange={(name, value) => handleChange({ target: { name, value } } as any)}
        onSubmit={handleCreateProvider}
        onCancel={() => { setOpenDialog(false); reset(); setEditingProvider(null); }}
        loading={creating}
      />

      <ProviderDetailModal
        open={openDetailModal}
        onClose={() => { setOpenDetailModal(false); setDetailProvider(null); }}
        provider={detailProvider}
        loading={loadingDetail}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title="Eliminar proveedor"
        message={`¿Estás seguro de eliminar a "${confirmDialog.provider?.fullName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ open: false, provider: null })}
        severity="error"
        loading={processingDelete}
      />

      <Tooltip title="Agregar proveedor">
        <Fab
          color="primary"
          onClick={() => setOpenDialog(true)}
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          <AddFabIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
}