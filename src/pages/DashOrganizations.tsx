import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  CardActionArea,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Slide,
  Switch,
  FormControlLabel,
  Fab,
  Tooltip,
} from "@mui/material";
import {
  Add as AddFabIcon,
  AddCircleOutline as AddIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
} from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { authFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function SlideTransition(props: any) {
  return <Slide {...props} direction="left" />;
}

// Icono default Leaflet
const defaultMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type LocationState = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type LocationMarkerProps = {
  position: LocationState;
  setPosition: React.Dispatch<React.SetStateAction<LocationState>>;
};

function LocationMarker({ position, setPosition }: LocationMarkerProps) {
  useMapEvents({
    click(e) {
      setPosition((prev) => ({
        ...prev,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      }));
    },
  });

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={defaultMarkerIcon}
      draggable
      eventHandlers={{
        dragend: (event) => {
          const latlng = (event.target as any).getLatLng();
          setPosition((prev) => ({
            ...prev,
            lat: latlng.lat,
            lng: latlng.lng,
          }));
        },
      }}
    />
  );
}

export default function DashOrganizations() {
  // ------------------------------
  // Estados principales
  // ------------------------------
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");

  const { userId } = useAuth();

  // ------------------------------
  // Categorías
  // ------------------------------
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  // ------------------------------
  // Formulario
  // ------------------------------
  const [formData, setFormData] = useState({
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

  // ------------------------------
  // Ubicación principal
  // ------------------------------
  const [location, setLocation] = useState<LocationState>({
    name: "Sede principal",
    address: "",
    lat: -37.33,
    lng: -59.13,
  });

  // ------------------------------
  // Toast
  // ------------------------------
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  const showToast = (message: string, severity: "success" | "error" | "warning") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const getToastIcon = (severity: string) => {
    switch (severity) {
      case "success": return <CheckIcon fontSize="inherit" />;
      case "warning": return <WarningIcon fontSize="inherit" />;
      default: return <ErrorIcon fontSize="inherit" />;
    }
  };

  // ------------------------------
  // Loaders
  // ------------------------------
  useEffect(() => {
    loadOrganizations();
    loadCategories();
  }, []);

  const loadOrganizations = async () => {
    try {
      const res = await authFetch("/organizations");
      const json = await res.json();
      let orgs = json.data ?? json ?? [];

      orgs = orgs.sort((a: any, b: any) =>
        a.simpleOrganization === b.simpleOrganization ? 0 :
        a.simpleOrganization ? -1 : 1
      );

      setOrganizations(orgs);
      setFiltered(orgs);

    } catch (err) {
      console.error("Error al cargar organizaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await authFetch("/categories");
      const json = await res.json();
      setCategories(json.data ?? json);
    } catch (e) {
      console.error("Error cargando categorías:", e);
    }
  };

  const handleSelectCategory = async (parentId: string) => {
    setSelectedCategory(parentId);
    setSelectedSubcategory("");

    try {
      const res = await authFetch(`/categories/${parentId}/children`);
      const json = await res.json();
      setSubcategories(json.data ?? json);
    } catch (e) {
      console.error("Error cargando subcategorías:", e);
    }
  };

const handleSelect = async (org: any) => {
  try {
    localStorage.setItem("organizationId", org.id);
    localStorage.setItem("organizationName", org.name);
    localStorage.setItem("organizationLogo", org.logoUrl || "");
    localStorage.setItem("organizationType", org.simpleOrganization ? "simple" : "multi");

    // Guardamos categorías solo si las envía el backend
    if (org.categoryName) localStorage.setItem("organizationCategory", org.categoryName);
    if (org.subcategoryName) localStorage.setItem("organizationSubcategory", org.subcategoryName);

    if (org.simpleOrganization) {
      const res = await authFetch(`/users/providers/${org.id}`);
      const json = await res.json();
      const providers = json.data ?? json;

      if (providers && providers.length > 0) {
        const provider = providers[0];
        localStorage.setItem("providerId", provider.id);
        localStorage.setItem("providerName", provider.fullName);
      }

      window.location.href = "/";
    } 
    else {
      // MULTI → no seteamos providerId
      localStorage.removeItem("providerId");
      localStorage.removeItem("providerName");

      window.location.href = "/dashboard-providers";
    }
  } catch (err) {
    console.error("Error al procesar selección de organización:", err);
  }
};
  // ------------------------------
  // Form inputs
  // ------------------------------
  const handleSearch = (value: string) => {
    setSearch(value);
    const filteredList = organizations.filter(
      (o) =>
        o.name?.toLowerCase().includes(value.toLowerCase()) ||
        o.type?.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(filteredList);
  };

  const handleTypeFilter = (value: string) => {
  setTypeFilter(value);

  let list = organizations;

  if (value) {
    list = list.filter((o) => o.type === value);
  }

  // aplicar también el search si había texto
  if (search) {
    list = list.filter(
      (o) =>
        o.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.type?.toLowerCase().includes(search.toLowerCase())
    );
  }

  setFiltered(list);
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "locationName") setLocation((prev) => ({ ...prev, name: value }));
    if (name === "locationAddress") setLocation((prev) => ({ ...prev, address: value }));
  };

  const handleToggleSimple = () => {
    setFormData((prev) => ({
      ...prev,
      simpleOrganization: !prev.simpleOrganization,
    }));
  };

  // ------------------------------
  // Crear Organización
  // ------------------------------
  const handleCreateOrganization = async () => {
    try {
      const {
        name,
        type,
        logoUrl,
        simpleOrganization,
        managerFullName,
        managerEmail,
        managerPhone,
        managerPassword,
        locationName,
        locationAddress,
      } = formData;

      if (!name || !selectedCategory || !managerFullName || !managerEmail || !managerPhone) {
        showToast("Por favor completá todos los campos obligatorios.", "warning");
        return;
      }

      setCreating(true);

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

      const res = await authFetch("/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Error al crear organización: ${res.statusText}`);

      showToast(`Organización "${name}" creada con éxito.`, "success");
      setOpenDialog(false);
      await loadOrganizations();

    } catch (err) {
      console.error("Error al crear organización:", err);
      showToast("No se pudo crear la organización.", "error");
    } finally {
      setCreating(false);
    }
  };

  // ------------------------------
  // Render
  // ------------------------------
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>

      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Organizaciones</Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          
          {/* 🔽 Filtro por Tipo */}
          <TextField
            select
            size="small"
            label=""
            value={typeFilter}
            onChange={(e) => handleTypeFilter(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ width: 180, backgroundColor: "white", borderRadius: 1 }}
          >
            <option value="">Todos</option>
            {[...new Set(organizations.map(o => o.type).filter(Boolean))].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </TextField>

          {/* 🔍 Buscador */}
          <TextField
            size="small"
            placeholder="Buscar organización..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 280, backgroundColor: "white", borderRadius: 1 }}
          />
        </Box>
      </Box>

      {/* GRID PRINCIPAL */}
      <Grid container spacing={3}>

        {/* CARD CREAR */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 3,
              p: 2,
              textAlign: "center",
              backgroundColor: "#E3F2FD",
              border: "1.5px dashed #64B5F6",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "#BBDEFB",
                transform: "translateY(-3px)",
                borderColor: "#2196F3",
              },
            }}
          >
            <CardActionArea onClick={() => setOpenDialog(true)}>
              <CardContent>
                <AddIcon sx={{ fontSize: 46, color: "#1976D2", mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>Crear Organización</Typography>
                <Typography variant="body2" color="text.secondary">
                  Agregá una nueva organización
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        {/* TARJETAS */}
        {filtered.map((org) => {
          const isSimple = org.simpleOrganization;
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={org.id}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isSimple
                    ? "rgba(76, 175, 80, 0.08)"
                    : "rgba(0, 123, 255, 0.06)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea onClick={() => handleSelect(org)}>
                    <CardContent
                      sx={{
                        textAlign: "center",
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                      }}
                    >
                    {org.logoUrl ? (
                      <Box
                        component="img"
                        src={org.logoUrl}
                        sx={{
                          width: 64,
                          height: 64,
                          objectFit: "contain",
                          mb: 2,
                          borderRadius: 2,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                          color: "#fff",
                          fontSize: 22,
                          mb: 2,
                          bgcolor: isSimple ? "#4CAF50" : "#007BFF",
                        }}
                      >
                        {org.name
                          ?.split(" ")
                          .slice(0, 2)
                          .map((w: string) => w[0])
                          .join("")
                          .toUpperCase()}
                      </Box>
                    )}

                    <Typography variant="h6">{org.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {org.type || "Sin tipo"}
                    </Typography>

                    <Box sx={{ mt: 1.5, display: "flex", gap: 1, justifyContent: "center" }}>
                      <Chip
                        label={org.active ? "Activa" : "Inactiva"}
                        color={org.active ? "success" : "default"}
                        size="small"
                      />
                      <Chip
                        label={isSimple ? "Simple" : "Multi"}
                        size="small"
                        sx={{
                          bgcolor: isSimple
                            ? "rgba(76, 175, 80, 0.15)"
                            : "rgba(0, 123, 255, 0.15)",
                        }}
                      />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* DIALOG CREAR */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={600}>Crear nueva organización</DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Nombre"
            name="name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
            Categoría
          </Typography>

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
              required
            >
              <option value=""></option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </TextField>
          )}

          <TextField
            label="Logo URL"
            name="logoUrl"
            fullWidth
            margin="normal"
            value={formData.logoUrl}
            onChange={handleChange}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.simpleOrganization}
                onChange={handleToggleSimple}
                color="primary"
              />
            }
            label={formData.simpleOrganization ? "Organización Simple" : "Organización Multi"}
            sx={{ mt: 1 }}
          />

          {/* MANAGER */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
            Datos del Manager
          </Typography>

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

          {/* LOCACIÓN */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
            Sede principal
          </Typography>

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
            helperText="Podés escribir la dirección y ajustar el pin en el mapa."
          />

          <Box
            sx={{
              mt: 2,
              height: 260,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #eee",
            }}
          >
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker position={location} setPosition={setLocation} />
            </MapContainer>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleCreateOrganization} disabled={creating}>
            {creating ? "Creando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TOAST */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={handleCloseSnackbar}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          icon={getToastIcon(snackbar.severity)}
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* FAB */}
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