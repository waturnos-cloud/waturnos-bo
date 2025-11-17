import { useEffect, useState } from "react";
import { useNotification } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import { useAuth } from "../auth/AuthContext";
import { getTodayByProvider, getRangeByProvider, assignBooking } from "../api/bookings";
import { getClients, createClient } from "../api/clients";
import type { ClientDTO } from "../types/dto";
import type { Appointment } from "../types/types";
import DayOccupancyCard from "../components/DayOccupancyCard";
import { AssignBookingModal, CreateClientModal } from "../components";
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
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import CancelIcon from "@mui/icons-material/Cancel";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";

export default function Dashboard() {
  const { providerId } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  // Estados
  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [nextDayLabel, setNextDayLabel] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);

  const organizationName = localStorage.getItem("organizationName");
  const providerName = localStorage.getItem("providerName");

  const loadTurnos = async (provId: number) => {
    try {
      setLoading(true);
      const json = await getTodayByProvider(provId);
      const list = (json.data ?? json ?? []) as Appointment[];

      if (list.length > 0) {
        setTurnos(list);
        setNextDayLabel(null);
      } else {
        // If today's endpoint returns no turnos, fetch the next 7 days and pick the next day that has bookings
        const today = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const startDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        const end = new Date(today);
        end.setDate(end.getDate() + 7);
        const endDate = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;

        try {
          const rangeJson = await getRangeByProvider(provId, startDate, endDate);
          const grouped = rangeJson.data ?? rangeJson ?? {};

          // Find the earliest day with bookings
          const dayKeys = Object.keys(grouped).sort();
          let foundDay: string | null = null;
          for (const day of dayKeys) {
            const services = grouped[day] as any[];
            const hasBookings = services.some((s) => (s.bookings ?? []).length > 0);
            if (hasBookings) {
              foundDay = day;
              break;
            }
          }

          if (foundDay) {
            const services = grouped[foundDay] as any[];
            const flattened: Appointment[] = [];
            services.forEach((svc) => {
              const svcName = svc.serviceName || svc.name || "";
              (svc.bookings ?? []).forEach((b: any) => {
                flattened.push({
                  id: b.id,
                  startTime: b.startTime,
                  endTime: b.endTime,
                  status: b.status,
                  clientName: null,
                  serviceName: svcName,
                });
              });
            });
            setTurnos(flattened);
            // Guardar etiqueta para mostrar en el encabezado (DD-MM)
            try {
              const [y, m, d] = foundDay.split("-");
              setNextDayLabel(`${d}-${m}`);
            } catch (err) {
              setNextDayLabel(null);
            }
          } else {
            setTurnos([]);
            setNextDayLabel(null);
          }
        } catch (err) {
          console.error("Error cargando rango de turnos:", err);
          setTurnos([]);
        }
      }
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
  const handleConfirmAssign = async (bookingId: number, clientId: number) => {
    try {
      setAssignLoading(true);

      await assignBooking({
        id: bookingId,
        clientId: clientId,
      });

      notify("El turno fue asignado correctamente.", "success");
      setOpenAssignModal(false);

      if (providerId) loadTurnos(providerId);
    } catch (err) {
      console.error("Error asignando turno:", err);
      notify("No se pudo asignar el turno.", "error");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCreateClient = async (clientData: Partial<ClientDTO>) => {
    try {
      setClientLoading(true);

      const json = await createClient(clientData as ClientDTO);
      const created = json.data ?? json;

      setClients((prev) => [...prev, created]);
      setCreateClientOpen(false);

      notify("Cliente creado correctamente", "success");
    } catch (err) {
      console.error("Error creando cliente:", err);
      notify("No se pudo crear el cliente", "error");
    } finally {
      setClientLoading(false);
    }
  };

  // -------------------------------------------------
  // Cargar datos al montar
  // -------------------------------------------------
  useEffect(() => {
    if (providerId) {
      loadTurnos(providerId);
      loadClients();
    }
  }, [providerId]);

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
    free: turnos.filter((t) => t.status === "FREE").length,
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
            <Typography variant="h6">
              {nextDayLabel ? `Próximo día con turnos: ${nextDayLabel}` : "Turnos de Hoy"}
            </Typography>

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

      {/* MODAL ASIGNAR TURNO */}
      <AssignBookingModal
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        onSubmit={handleConfirmAssign}
        turnos={turnos}
        clients={clients}
        onAddClient={() => setCreateClientOpen(true)}
        loading={assignLoading}
      />

      {/* MODAL CREAR CLIENTE */}
      <CreateClientModal
        open={createClientOpen}
        onClose={() => setCreateClientOpen(false)}
        onSubmit={handleCreateClient}
        loading={clientLoading}
      />

      {/* Notification handled by NotificationProvider */}

    </Box>
  );
}