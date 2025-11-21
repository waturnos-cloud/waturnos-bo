import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Fab,
  Tooltip,
} from "@mui/material";
import React from 'react';
import { Add as AddFabIcon } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../auth/AuthContext";
import { getOrganizations, createOrganization, getProvidersByOrg, getOrganization, updateOrganization, toggleOrganizationStatus } from "../api/organizations";
import { getCategories, getCategoryChildren } from "../api/categories";
import type { OrganizationDTO, CategoryDTO, ProviderDTO } from "../types/dto";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { useCRUDList, useForm, useLocationPicker } from "../hooks";
import { SelectableCardGrid, SearchAndFilter, OrganizationDetailModal, ConfirmDialog, CreateOrganizationWizard } from "../components";
import "../utils/leafletConfig";

export default function DashOrganizations() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingOrg, setEditingOrg] = useState<OrganizationDTO | null>(null);
  const [detailOrg, setDetailOrg] = useState<any | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    org: OrganizationDTO | null;
    isActive: boolean;
  }>({ open: false, org: null, isActive: false });
  const [processingToggle, setProcessingToggle] = useState(false);

  const loadOrganizations = React.useCallback(async () => {
    const json = await getOrganizations();
    let orgs = json.data ?? json ?? [];
    // Map organizations to CardItem format with categoryType
    return (orgs as any[])
      .map((org) => ({
        ...org,
        // Si type es un objeto, extraer solo el nombre del primer nivel
        type: typeof org.type === 'object' && org.type?.name ? org.type.name : org.type,
        categoryType: org.simpleOrganization ? "simple" : "multi",
      }))
      .sort((a: any, b: any) =>
        a.simpleOrganization === b.simpleOrganization ? 0 : a.simpleOrganization ? -1 : 1
      );
  }, []);

  const { filtered: organizations, loading, reload, setCreating, creating } = useCRUDList<OrganizationDTO>(
    loadOrganizations
  );

  const { formData, handleChange, reset } = useForm({
    name: "",
    type: "",
    logoUrl: "",
    simpleOrganization: true,
    managerFullName: "",
    managerEmail: "",
    managerPhone: "",
    managerPassword: "12345",
    locationName: "Sede principal",
    locationAddress: "",
  });

  const { location, updateCoordinates } = useLocationPicker({
    name: "Sede principal",
    address: "",
    lat: -37.33,
    lng: -59.13,
  });

  useEffect(() => {
    reload();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const json = await getCategories();
      setCategories(json.data ?? json ?? []);
    } catch (e) {
      console.error("Error cargando tipos:", e);
    }
  };

  const handleEdit = async (org: OrganizationDTO) => {
    if (!org.id) return;
    try {
      setLoadingDetail(true);
      const json = await getOrganization(org.id);
      const fullOrg = json.data ?? json;
      setEditingOrg(fullOrg);
      // Cargar datos en el formulario
      handleChange({ target: { name: 'name', value: fullOrg.name || '' } } as any);
      handleChange({ target: { name: 'logoUrl', value: fullOrg.logoUrl || '' } } as any);
      handleChange({ target: { name: 'type', value: fullOrg.type || '' } } as any);
      handleChange({ target: { name: 'simpleOrganization', value: fullOrg.simpleOrganization ?? true } } as any);
      setOpenDialog(true);
    } catch (err) {
      console.error('Error cargando organización:', err);
      notify('No se pudo cargar la organización', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleStatus = (org: OrganizationDTO) => {
    const isActive = org.active ?? false;
    setConfirmDialog({ open: true, org, isActive });
  };

  const handleConfirmToggle = async () => {
    const { org, isActive } = confirmDialog;
    if (!org?.id) return;
    
    const newStatus = isActive ? 'DEACTIVE' : 'ACTIVE';
    
    try {
      setProcessingToggle(true);
      await toggleOrganizationStatus(org.id, newStatus);
      notify(`Organización ${isActive ? 'desactivada' : 'activada'} con éxito`, 'success');
      setConfirmDialog({ open: false, org: null, isActive: false });
      await reload();
    } catch (err) {
      console.error('Error cambiando estado de organización:', err);
      notify('No se pudo cambiar el estado de la organización', 'error');
    } finally {
      setProcessingToggle(false);
    }
  };

  const handleViewDetail = async (org: OrganizationDTO) => {
    if (!org.id) return;
    try {
      setLoadingDetail(true);
      setOpenDetailModal(true);
      const json = await getOrganization(org.id);
      const orgData = json.data ?? json;
      // Transformar type a string si es un objeto
      if (typeof orgData.type === 'object' && orgData.type?.name) {
        orgData.type = orgData.type.name;
      }
      setDetailOrg(orgData);
    } catch (err) {
      console.error('Error cargando detalle:', err);
      notify('No se pudo cargar el detalle de la organización', 'error');
      setOpenDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSelect = async (org: OrganizationDTO) => {
    try {
      if (org.id != null) localStorage.setItem("organizationId", String(org.id));
      localStorage.setItem("organizationName", org.name || "");
      localStorage.setItem("organizationLogo", org.logoUrl || "");
      localStorage.setItem("organizationType", org.simpleOrganization ? "simple" : "multi");

      if (org.categoryName) localStorage.setItem("organizationCategory", org.categoryName);
      if (org.subcategoryName) localStorage.setItem("organizationSubcategory", org.subcategoryName);

      if (org.simpleOrganization) {
        if (org.id == null) throw new Error('Organization id missing');
        const json = await getProvidersByOrg(org.id);
        const providers = (json.data ?? json) as ProviderDTO[];

        if (providers && providers.length > 0) {
          const provider = providers[0];
          if (provider.id) localStorage.setItem("providerId", String(provider.id));
          if (provider.fullName) localStorage.setItem("providerName", provider.fullName);
          window.dispatchEvent(new CustomEvent("auth:update", {
            detail: {
              providerId: provider.id,
              providerName: provider.fullName,
              organizationId: org.id,
              organizationName: org.name,
            }
          }));
        }
        navigate("/", { replace: true });
      } else {
        localStorage.removeItem("providerId");
        localStorage.removeItem("providerName");
        navigate("/dashboard-providers", { replace: true });
      }
    } catch (err) {
      console.error("Error al procesar selección de organización:", err);
    }
  };

  const handleCreateOrganization = async () => {
    try {
      const { name, type, logoUrl, simpleOrganization, managerFullName, managerEmail, managerPhone, managerPassword, locationName, locationAddress } = formData;

      if (!name) {
        notify("El nombre es obligatorio.", "warning");
        return;
      }

      setCreating(true);

      if (editingOrg) {
        // Modo edición: solo actualizar campos básicos
        const updatePayload = {
          id: editingOrg.id,
          name,
          type: type || editingOrg.type,
          logoUrl: logoUrl || null,
        };
        await updateOrganization(updatePayload);
        notify(`Organización "${name}" actualizada con éxito.`, "success");
      } else {
        // Modo creación
        if (!selectedCategory || !managerFullName || !managerEmail || !managerPhone) {
          notify("Por favor completá todos los campos obligatorios.", "warning");
          setCreating(false);
          return;
        }

        const payload = {
          organization: {
            name,
            type: {
              id: Number(selectedCategory)
            },
            logoUrl: logoUrl || null,
            simpleOrganization,
            locations: [
              {
                name: locationName || "Sede principal",
                address: locationAddress || "Dirección a definir",
                phone: managerPhone,
                email: managerEmail,
                latitude: location.lat,
                longitude: location.lng,
                main: true,
              },
            ],
          },
          manager: {
            fullName: managerFullName,
            email: managerEmail,
            password: managerPassword,
            phone: managerPhone,
            photoUrl: null,
            bio: "Administrador de la organización.",
          },
        };
        await createOrganization(payload);
        notify(`Organización "${name}" creada con éxito.`, "success");
      }

      setOpenDialog(false);
      reset();
      setSelectedCategory("");
      setEditingOrg(null);
      await reload();
    } catch (err: any) {
      console.error("Error al guardar organización:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "No se pudo guardar la organización.";
      notify(errorMessage, "error");
    } finally {
      setCreating(false);
    }
  };

  // Filtrado combinado
  const filtered = organizations.filter((org) => {
    let matches = true;
    if (typeFilter && org.type !== typeFilter) matches = false;
    if (search && !org.name?.toLowerCase().includes(search.toLowerCase()) &&
        !org.type?.toLowerCase().includes(search.toLowerCase())) matches = false;
    return matches;
  });

  const typeOptions = [...new Set(organizations.map(o => o.type).filter(Boolean))].map(t => ({ label: t || "", value: t || "" }));

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Organizaciones</Typography>
        <SearchAndFilter
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar organización..."
          filters={[{ label: "Tipo", value: typeFilter, onChange: setTypeFilter, options: [{ label: "", value: "" }, ...typeOptions] }]}
        />
      </Box>

      <SelectableCardGrid<OrganizationDTO>
        items={filtered}
        onSelect={handleSelect}
        onCreate={() => setOpenDialog(true)}
        onView={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleToggleStatus}
        cardBgColor={(org) =>
          org.simpleOrganization
            ? "rgba(76, 175, 80, 0.08)"  // Light green for Simple
            : "rgba(0, 123, 255, 0.06)"  // Light blue for Multi
        }
        logoPlaceholderBg={(org) =>
          org.simpleOrganization
            ? "#4CAF50"  // Green for Simple
            : "#007BFF"  // Blue for Multi
        }
      />

      <CreateOrganizationWizard
        open={openDialog}
        onClose={() => { setOpenDialog(false); reset(); setSelectedCategory(""); setEditingOrg(null); }}
        onSubmit={handleCreateOrganization}
        formData={formData}
        onFieldChange={(name: string, value: any) => handleChange({ target: { name, value } } as any)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        location={location}
        onLocationChange={updateCoordinates}
        loading={creating}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.isActive ? 'Desactivar organización' : 'Activar organización'}
        message={`¿Estás seguro de ${confirmDialog.isActive ? 'desactivar' : 'activar'} "${confirmDialog.org?.name}"?${confirmDialog.isActive ? ' La organización no estará disponible hasta que la vuelvas a activar.' : ''}`}
        confirmText={confirmDialog.isActive ? 'Desactivar' : 'Activar'}
        cancelText="Cancelar"
        onConfirm={handleConfirmToggle}
        onCancel={() => setConfirmDialog({ open: false, org: null, isActive: false })}
        severity={confirmDialog.isActive ? 'warning' : 'success'}
        loading={processingToggle}
      />

      <OrganizationDetailModal
        open={openDetailModal}
        onClose={() => { setOpenDetailModal(false); setDetailOrg(null); }}
        organization={detailOrg}
        loading={loadingDetail}
      />

      <Tooltip title="Agregar organización">
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