import { useEffect, useState } from "react";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
// authFetch wrapper retained for compatibility in api/http.ts but not used here
import { useAuth } from "../auth/AuthContext";
import { getTodayByProvider } from "../api/bookings";
import { getClients, createClient } from "../api/clients";
import type { ClientDTO } from "../types/dto";
import type { Appointment } from "../types/types";
import DayOccupancyCard from "../components/DayOccupancyCard";
import { Autocomplete } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Fade,
  InputAdornment,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from "@mui/material";

import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import CancelIcon from "@mui/icons-material/Cancel";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";

import { assignBooking } from "../api/bookings";

export default function Dashboard() {
  const { providerId } = useAuth();

  // -------------------------------------------------
  // Estados principales
  // -------------------------------------------------
  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal asignar turno
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<number | "">("");
  const [selectedClient, setSelectedClient] = useState<number | "">("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [newClient, setNewClient] = useState<ClientDTO>({
    fullName: "",
    phone: "",
    email: "",
  });
  const [creatingClient, setCreatingClient] = useState(false);


  const { notify } = useNotification();

  // Datos guardados en localStorage
  const organizationName = localStorage.getItem("organizationName");
  const providerName = localStorage.getItem("providerName");
  const navigate = useNavigate();

  // -------------------------------------------------
  // Cargar datos principales
  // -------------------------------------------------
  useEffect(() => {
    if (providerId) {
      loadTurnos(providerId);
      loadClients();
    }
  }, [providerId]);

  const loadTurnos = async (provId: number) => {
    try {
      setLoading(true);
      const json = await getTodayByProvider(provId);
      const list = json.data ?? json ?? [];
      setTurnos(list);
    } catch (err) {
      console.error("Error cargando turnos:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const json = await getClients();
      setClients(json.data ?? json ?? []);
    } catch (err) {
      console.error("Error cargando clientes:", err);
    }
  };

  // -------------------------------------------------
  // Asignar turno
  // -------------------------------------------------
  const handleConfirmAssign = async () => {
    if (!selectedBooking || !selectedClient) {
      alert("Seleccioná turno y cliente.");
      return;
    }

    try {
      setAssignLoading(true);

      await assignBooking({
        id: Number(selectedBooking),
        clientId: Number(selectedClient),
      });

      notify("El turno fue asignado correctamente.", "success");
      setOpenAssignModal(false);
      setSelectedBooking("");
      setSelectedClient("");

      if (providerId) loadTurnos(providerId);
    } catch (err) {
      console.error("Error asignando turno:", err);
      notify("No se pudo asignar el turno.", "error");
    } finally {
      setAssignLoading(false);
    }
  };

  // -------------------------------------------------
  // Cambiar organización
  // -------------------------------------------------
  const handleChangeOrganization = () => {
    localStorage.removeItem("organizationId");
    localStorage.removeItem("organizationName");
    localStorage.removeItem("organizationLogo");
    localStorage.removeItem("organizationType");
    localStorage.removeItem("organizationCategory");
    localStorage.removeItem("organizationSubcategory");
    localStorage.removeItem("providerId");
    localStorage.removeItem("providerName");

    navigate("/dashboard-orgs");
  };

  // -------------------------------------------------
  // UI Estados
  // -------------------------------------------------
  const estadoUI: Record<string, { label: string; color: string }> = {
    FREE: { label: "Libre", color: "#FFA000" },
    PENDING: { label: "Libre", color: "#FFA000" },
    RESERVED: { label: "Reservado", color: "#2E7D32" },
    CANCELLED: { label: "Cancelado", color: "#C62828" },
    COMPLETED: { label: "Completado", color: "#1565C0" },
    "NO-SHOW": { label: "No-Show", color: "#8e24aa" },
  };

  // -------------------------------------------------
  // Columnas tabla
  // -------------------------------------------------
  const columns = [
    {
      field: "startTime",
      headerName: "Inicio",
      width: 120,
      renderCell: (params: GridRenderCellParams<Appointment, any, any>) => {
        const date = new Date(params.value as string);
        return date.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      },
    },
    { field: "clientName", headerName: "Cliente", width: 180 },
    { field: "serviceName", headerName: "Servicio", width: 160 },

    {
      field: "status",
      headerName: "Estado",
      width: 140,
      renderCell: (params: GridRenderCellParams<Appointment, any, any>) => {
        const st = estadoUI[params.value as string] ?? estadoUI["FREE"];
        return (
          <Chip
            size="small"
            label={st.label}
            sx={{
              bgcolor: st.color,
              color: "#fff",
              fontWeight: 600,
            }}
          />
        );
      },
    },

    {
      field: "actions",
      headerName: "Acciones",
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Appointment, any, any>) => {
        const turno = params.row as Appointment;

        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Ver detalle">
              <IconButton size="small">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Editar">
              <IconButton size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Cancelar turno">
              <IconButton size="small">
                <CancelIcon fontSize="small" sx={{ color: "#c62828" }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="No Show">
              <IconButton size="small">
                <DoNotDisturbIcon fontSize="small" sx={{ color: "#8e24aa" }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Completado">
              <IconButton size="small">
                <EventAvailableIcon fontSize="small" sx={{ color: "#1565C0" }} />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  // -------------------------------------------------
  // KPIs
  // -------------------------------------------------
  const count = {
    free: turnos.filter((t) => t.status === "FREE" || t.status === "PENDING").length,
    reserved: turnos.filter((t) => t.status === "RESERVED").length,
    cancelled: turnos.filter((t) => t.status === "CANCELLED").length,
    completed: turnos.filter((t) => t.status === "COMPLETED").length,
    noshow: turnos.filter((t) => t.status === "NO-SHOW").length,
  };

  // -------------------------------------------------
  // LOADING
  // -------------------------------------------------
  if (loading) {
    return (
      <Fade in={true}>
        <Box
          sx={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={55} />
          <Typography>Cargando turnos...</Typography>
        </Box>
      </Fade>
    );
  }

  // -------------------------------------------------
  // RENDER PRINCIPAL
  // -------------------------------------------------
  return (
    <Box sx={{ p: 4 }}>

      {/* INFO ORG / PROVEEDOR */}
      <Card sx={{ mb: 4, p: 2.5, borderRadius: 2, border: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          {/* Izquierda */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                backgroundColor: "#1976D2",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {organizationName?.substring(0, 1).toUpperCase()}
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={700}>
                {organizationName}
              </Typography>

              {providerName && (
                <Typography variant="body2" color="text.secondary">
                  Proveedor: <strong>{providerName}</strong>
                </Typography>
              )}
            </Box>
          </Box>

          {/* Derecha */}
          <Button variant="outlined" size="small" onClick={handleChangeOrganization}>
            Cambiar
          </Button>
        </Box>
      </Card>

      {/* KPIs */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, p: 2 }}>
            <Typography variant="h6">Turnos de Hoy</Typography>

            <Stack direction="row" spacing={2} mt={2}>
              <Chip label={`Libres: ${count.free}`} sx={{ bgcolor: "#FFF3CD" }} />
              <Chip label={`Reservados: ${count.reserved}`} sx={{ bgcolor: "#E8F5E9" }} />
              <Chip label={`Cancelados: ${count.cancelled}`} sx={{ bgcolor: "#FFEBEE" }} />
              <Chip label={`Completados: ${count.completed}`} sx={{ bgcolor: "#E3F2FD" }} />
              <Chip label={`No-Show: ${count.noshow}`} sx={{ bgcolor: "#F3E5F5" }} />
            </Stack>
          </Card>
        </Grid>

        {/* BOTONES LATERALES */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Button
              variant="contained"
              startIcon={<AssignmentIndIcon />}
              fullWidth
              size="large"
              onClick={() => setOpenAssignModal(true)}
              sx={{
                background: "linear-gradient(135deg, #007BFF 0%, #28A745 100%)",
                color: "white",
                fontWeight: 600,
              }}
            >
              Asignar Turno
            </Button>

            <Button variant="outlined" startIcon={<BlockIcon />} fullWidth size="large">
              Bloquear Agenda
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <DayOccupancyCard appointments={turnos} />
        </Grid>
      </Grid>

      {/* TABLA */}
      <Typography variant="h6" mt={4} mb={1}>
        Turnos del día
      </Typography>

      <DataGrid
        rows={turnos}
        columns={columns}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          sorting: {
            sortModel: [{ field: "startTime", sort: "asc" }],
          },
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />

      {/* MODAL ASIGNAR */}
      {/* MODAL ASIGNAR TURNO */}
      <Dialog
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 0.5 }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            pb: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Asignar Turno

          <IconButton onClick={() => setOpenAssignModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Seleccioná un turno libre y asignalo a un cliente.
          </Typography>

          {/* ------------------------- */}
          {/*   SELECT DE TURNOS       */}
          {/* ------------------------- */}
          <TextField
            select
            fullWidth
            label="Turno disponible"
            margin="normal"
            value={selectedBooking}
            onChange={(e) => setSelectedBooking(Number(e.target.value))}
            SelectProps={{ native: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EventAvailableIcon color="action" />
                </InputAdornment>
              ),
            }}
          >
            <option value="">-- Seleccionar turno --</option>

            {turnos
              .filter((t) => t.status === "FREE" || t.status === "PENDING")
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {new Date(t.startTime).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </option>
              ))}
          </TextField>

          {/* ------------------------- */}
          {/*   CLIENTE + CREAR NUEVO  */}
          {/* ------------------------- */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography fontWeight={600}>
                Cliente
              </Typography>

              <Button
                size="small"
                variant="outlined"
                onClick={() => setCreateClientOpen(true)}
                sx={{ textTransform: "none" }}
              >
                + Nuevo Cliente
              </Button>
            </Box>

            <Autocomplete<ClientDTO>
              fullWidth
              options={clients}
              getOptionLabel={(c) =>
                `${c.fullName} — ${c.phone || "Sin teléfono"}`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar cliente..."
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              filterOptions={(options, { inputValue }) =>
                options.filter(
                  (c) =>
                    c.fullName.toLowerCase().includes(inputValue.toLowerCase()) ||
                    (c.phone || "").toLowerCase().includes(inputValue.toLowerCase()) ||
                    (c.email || "").toLowerCase().includes(inputValue.toLowerCase())
                )
              }
              value={clients.find((c) => c.id === selectedClient) || null}
              onChange={(_, value) =>
                setSelectedClient(value ? (value.id as number) : "")
              }
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => setOpenAssignModal(false)}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleConfirmAssign}
            disabled={assignLoading}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 4,
            }}
          >
            {assignLoading ? "Asignando..." : "Asignar turno"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL CREAR CLIENTE */}
      <Dialog
        open={createClientOpen}
        onClose={() => setCreateClientOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 0.5 }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            pb: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Nuevo Cliente

          <IconButton onClick={() => setCreateClientOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Completá los datos para registrar un nuevo cliente.
          </Typography>

          {/* Nombre */}
          <TextField
            fullWidth
            label="Nombre completo"
            margin="normal"
            value={newClient.fullName}
            onChange={(e) =>
              setNewClient({ ...newClient, fullName: e.target.value })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Teléfono */}
          <TextField
            fullWidth
            label="Teléfono"
            margin="normal"
            value={newClient.phone}
            onChange={(e) =>
              setNewClient({ ...newClient, phone: e.target.value })
            }
            placeholder="Ej: 2494123456"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Email */}
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={newClient.email}
            onChange={(e) =>
              setNewClient({ ...newClient, email: e.target.value })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => setCreateClientOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={async () => {
              try {
                setCreatingClient(true);

                          const json = await createClient(newClient);
                          const created = json.data ?? json;

                          setClients((prev) => [...prev, created]);
                          setSelectedClient(created.id);
                setCreateClientOpen(false);
                setNewClient({ fullName: "", phone: "", email: "" });

                notify("Cliente creado correctamente", "success");
              } catch (err) {
                console.error("Error creando cliente:", err);
                notify("No se pudo crear el cliente", "error");
              } finally {
                setCreatingClient(false);
              }
            }}
            disabled={creatingClient}
            sx={{
              textTransform: "none",
              px: 4,
              fontWeight: 600,
            }}
          >
            {creatingClient ? "Guardando..." : "Crear cliente"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification handled by NotificationProvider */}

    </Box>
  );
}