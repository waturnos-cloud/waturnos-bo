import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Switch,
  FormControlLabel,
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
import { CreateFormDialog, SelectableCardGrid, SearchAndFilter, LocationMarker, OrganizationDetailModal, ConfirmDialog } from "../components";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";

// Configure default Leaflet icon
(L as any).Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function DashOrganizations() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [subcategories, setSubcategories] = useState<CategoryDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
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
      console.error("Error cargando categorías:", e);
    }
  };

  const handleSelectCategory = async (parentId: string) => {
    setSelectedCategory(parentId);
    setSelectedSubcategory("");
    try {
      const json = await getCategoryChildren(parentId);
      setSubcategories(json.data ?? json ?? []);
    } catch (e) {
      console.error("Error cargando subcategorías:", e);
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
      setDetailOrg(json.data ?? json);
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

        const categoryId = selectedSubcategory || selectedCategory;
        const payload = {
          organization: {
            name,
            type,
            categoryId,
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
      setSelectedSubcategory("");
      setEditingOrg(null);
      await reload();
    } catch (err) {
      console.error("Error al guardar organización:", err);
      notify("No se pudo guardar la organización.", "error");
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

      <CreateFormDialog
        open={openDialog}
        title={editingOrg ? 'Editar organización' : 'Crear nueva organización'}
        fields={[
          { name: 'name', label: 'Nombre', required: true },
          { name: 'logoUrl', label: 'Logo URL' },
        ]}
        formData={formData}
        onFieldChange={(name, value) => handleChange({ target: { name, value } } as any)}
        onSubmit={handleCreateOrganization}
        onCancel={() => { setOpenDialog(false); reset(); setSelectedCategory(""); setSelectedSubcategory(""); setEditingOrg(null); }}
        loading={creating}
      >
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>Categoría</Typography>
        <TextField
          select
          label="Categoría principal"
          value={selectedCategory}
          onChange={(e) => handleSelectCategory(e.target.value)}
          SelectProps={{ native: true }}
          fullWidth
          margin="normal"
          required
        >
          <option value=""></option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </TextField>

        {selectedCategory && (
          <TextField
            select
            label="Subcategoría"
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            SelectProps={{ native: true }}
            fullWidth
            margin="normal"
          >
            <option value=""></option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </TextField>
        )}

        <FormControlLabel
          control={
            <Switch
              checked={formData.simpleOrganization}
              onChange={() => handleChange({ target: { name: 'simpleOrganization', value: !formData.simpleOrganization } } as any)}
              color="primary"
            />
          }
          label={formData.simpleOrganization ? "Organización Simple" : "Organización Multi"}
          sx={{ mt: 2 }}
        />

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>Datos del Manager</Typography>
        <TextField
          label="Nombre completo"
          name="managerFullName"
          fullWidth
          margin="normal"
          value={formData.managerFullName}
          onChange={handleChange}
          required
        />
        <TextField
          label="Email"
          name="managerEmail"
          fullWidth
          margin="normal"
          value={formData.managerEmail}
          onChange={handleChange}
          required
        />
        <TextField
          label="Teléfono"
          name="managerPhone"
          fullWidth
          margin="normal"
          value={formData.managerPhone}
          onChange={handleChange}
          required
        />

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>Sede principal</Typography>
        <TextField
          label="Nombre de la sede"
          name="locationName"
          fullWidth
          margin="normal"
          value={formData.locationName}
          onChange={handleChange}
        />
        <TextField
          label="Dirección"
          name="locationAddress"
          fullWidth
          margin="normal"
          value={formData.locationAddress}
          onChange={handleChange}
        />

        <Box sx={{ mt: 2, height: 260, borderRadius: 2, overflow: "hidden", border: "1px solid #eee" }}>
          <MapContainer {...({ center: [location.lat, location.lng], zoom: 13, style: { height: "100%", width: "100%" } } as any)}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker
              position={{ lat: location.lat, lng: location.lng }}
              onPositionChange={updateCoordinates}
            />
          </MapContainer>
        </Box>
      </CreateFormDialog>

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