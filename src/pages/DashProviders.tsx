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
import { getProvidersByOrg, createProvider } from "../api/organizations";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import type { ProviderDTO } from "../types/dto";
import { useCRUDList, useForm } from "../hooks";
import { CreateFormDialog, SelectableCardGrid } from "../components";

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
      if (!orgId) return;

      const { fullName, email, phone, bio } = formData;
      if (!fullName || !email || !phone || !bio) {
        notify("Por favor completá todos los campos obligatorios.", "warning");
        return;
      }

      setCreating(true);
      const json = await createProvider(orgId, formData);
      const provider = json.data ?? json;

      if (provider?.id) {
        notify(`Proveedor ${provider.fullName} creado con éxito.`, "success");
        setOpenDialog(false);
        reset();
        await reload();
      }
    } catch (err) {
      console.error("Error al crear proveedor:", err);
      notify("No se pudo crear el proveedor.", "error");
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
        title="Crear nuevo proveedor"
        fields={PROVIDER_FORM_FIELDS}
        formData={formData}
        onFieldChange={(name, value) => handleChange({ target: { name, value } } as any)}
        onSubmit={handleCreateProvider}
        onCancel={() => { setOpenDialog(false); reset(); }}
        loading={creating}
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