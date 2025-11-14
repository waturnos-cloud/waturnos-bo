import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Avatar,
  CardActionArea,
  Snackbar,
  Alert,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Fab,
  Tooltip,
} from "@mui/material";
import {
  AddCircleOutline as AddIcon,
  Add as AddFabIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
} from "@mui/icons-material";
import { authFetch } from "../api/http";

function SlideTransition(props: any) {
  return <Slide {...props} direction="left" />;
}

export default function DashProviders() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    fotoUrl: "",
    bio: "",
  });

  const orgId = localStorage.getItem("organizationId");

  useEffect(() => {
    if (orgId) loadProviders(orgId);
  }, [orgId]);

  const loadProviders = async (id: string) => {
    try {
      const res = await authFetch(`/users/providers/${id}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data ?? [];
      setProviders(list);
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
      showToast("Error al cargar proveedores", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, severity: "success" | "error" | "warning") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSelect = (prov: any) => {
    localStorage.setItem("providerId", prov.id);
    localStorage.setItem("providerName", prov.fullName);
    window.location.href = "/";
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProvider = async () => {
    try {
      if (!orgId) return;

      const { fullName, email, phone, bio } = formData;
      if (!fullName || !email || !phone || !bio) {
        showToast("Por favor completá todos los campos obligatorios.", "warning");
        return;
      }

      const res = await authFetch(`/users/providers/${orgId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(`Error al crear proveedor: ${res.statusText}`);

      const json = await res.json();
      const provider = json.data ?? json;

      if (provider?.id) {
        showToast(`Proveedor ${provider.fullName} creado con éxito.`, "success");
        setOpenDialog(false);
        await loadProviders(orgId);
      }
    } catch (err) {
      console.error("Error al crear proveedor:", err);
      showToast("No se pudo crear el proveedor. Ver consola para más detalles.", "error");
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const getToastIcon = (severity: string) => {
    switch (severity) {
      case "success":
        return <CheckIcon fontSize="inherit" />;
      case "warning":
        return <WarningIcon fontSize="inherit" />;
      default:
        return <ErrorIcon fontSize="inherit" />;
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

      <Grid container spacing={3}>
        {/* ➕ Card Crear Proveedor (siempre visible) */}
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
              transition: "all 0.3s ease",
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
            <CardActionArea onClick={handleOpenDialog}>
              <CardContent>
                <AddIcon sx={{ fontSize: 46, color: "#1976D2", mb: 1 }} />
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  Crear Proveedor
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Agregá un nuevo profesional
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        {/* 🔹 Proveedores existentes */}
        {providers.map((prov) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={prov.id}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 2,
                transition: "transform 0.2s ease, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea onClick={() => handleSelect(prov)}>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Avatar
                    src={prov.photoUrl}
                    alt={prov.fullName}
                    sx={{
                      width: 64,
                      height: 64,
                      margin: "0 auto 12px",
                      bgcolor: "primary.light",
                      fontSize: 24,
                    }}
                  >
                    {prov.fullName?.[0] ?? "P"}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {prov.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {prov.bio || prov.email || "Proveedor"}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 🧾 Dialog Crear Proveedor */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={600}>Crear nuevo proveedor</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Nombre completo"
            name="fullName"
            fullWidth
            margin="normal"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Teléfono"
            name="phone"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <TextField
            label="Bio / Especialidad"
            name="bio"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={formData.bio}
            onChange={handleChange}
            required
          />
          <TextField
            label="URL de foto (opcional)"
            name="fotoUrl"
            fullWidth
            margin="normal"
            value={formData.fotoUrl}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleCreateProvider}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🟢 Toast */}
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
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            backgroundColor:
              snackbar.severity === "warning" ? "#FFA000" : undefined,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ➕ FAB flotante */}
      <Tooltip title="Agregar proveedor">
        <Fab
          color="primary"
          onClick={handleOpenDialog}
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