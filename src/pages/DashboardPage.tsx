import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { authFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import DayOccupancyCard from "../components/DayOccupancyCard";

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


  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { providerId } = useAuth();

  const orgName = localStorage.getItem("organizationName");
  const providerName = localStorage.getItem("providerName");

  useEffect(() => {
    if (!providerId) return;
    loadData(providerId);
  }, [providerId]);

  const loadData = async (provId: number) => {
    try {
      setLoading(true);

      const res = await authFetch(`/bookings/today?providerId=${provId}`);
      const json = await res.json();

      setTurnos(json.data ?? []);
    } catch (e) {
      console.error("Error cargando dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // 🍬 MAPA VISUAL DE ESTADOS
  // ----------------------------------------------------
const estadoUI = {
  PENDING: { label: "Libre", color: "#FFA000" },   // 👈 antes FREE
  FREE: { label: "Libre", color: "#FFA000" },      // soportamos ambos por si después migrás
  RESERVED: { label: "Reservado", color: "#2E7D32" },
  CANCELLED: { label: "Cancelado", color: "#C62828" },
  COMPLETED: { label: "Completado", color: "#1565C0" },
  "NO-SHOW": { label: "No-Show", color: "#8e24aa" },
};

  // ----------------------------------------------------
  // 📌 Columnas nuevas con acciones
  // ----------------------------------------------------
  const columns = [
{
  field: "startTime",
  headerName: "Inicio",
  width: 120,
  renderCell: (params) => {
    if (!params.value) return "-";
    const date = new Date(params.value);
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
      renderCell: (params) => {
        const st = estadoUI[params.value] ?? estadoUI["FREE"];
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

    // ------------------------------------------------
    // 🟦 ACCIONES POR FILA
    // ------------------------------------------------
    {
      field: "actions",
      headerName: "Acciones",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const turno = params.row;

        return (

          <Stack direction="row" spacing={1}>
            {/* VER DETALLE */}
            <Tooltip title="Ver detalle">
              <IconButton size="small" onClick={() => console.log("Detalle", turno)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* EDITAR */}
            <Tooltip title="Editar turno">
              <IconButton size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* CANCELAR */}
            <Tooltip title="Cancelar turno">
              <IconButton size="small">
                <CancelIcon fontSize="small" sx={{ color: "#c62828" }} />
              </IconButton>
            </Tooltip>

            {/* NO SHOW */}
            <Tooltip title="Marcar No-Show">
              <IconButton size="small">
                <DoNotDisturbIcon fontSize="small" sx={{ color: "#8e24aa" }} />
              </IconButton>
            </Tooltip>

            {/* COMPLETAR */}
            <Tooltip title="Marcar completado">
              <IconButton size="small">
                <EventAvailableIcon fontSize="small" sx={{ color: "#1565C0" }} />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  // --------------------------------------------------------
  // ⏳ Loader elegante
  // --------------------------------------------------------
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

  // --------------------------------------------------------
  // 📊 KPI DE CONTADORES DEL DÍA
  // --------------------------------------------------------
const count = {
  free: turnos.filter((t) => t.status === "PENDING" || t.status === "FREE").length,
  reserved: turnos.filter((t) => t.status === "RESERVED").length,
  cancelled: turnos.filter((t) => t.status === "CANCELLED").length,
  completed: turnos.filter((t) => t.status === "COMPLETED").length,
  noshow: turnos.filter((t) => t.status === "NO-SHOW").length,
};


const handleChangeOrganization = () => {
    // Limpiamos sólo lo relacionado a la org/proveedor
    localStorage.removeItem("organizationId");
    localStorage.removeItem("organizationName");
    localStorage.removeItem("organizationLogo");
    localStorage.removeItem("organizationType");
    localStorage.removeItem("organizationCategory");
    localStorage.removeItem("organizationSubcategory");
    localStorage.removeItem("providerId");
    localStorage.removeItem("providerName");

    // Volvemos a la pantalla de selección de organizaciones
    window.location.href = "/dashboard-orgs"; // 👈 asegurate que esta ruta exista en tu router
  };

  return (
  <Box sx={{ p: 4 }}>
    {/* Información de organización y proveedor */}
{/* 🔷 INFO DE ORGANIZACIÓN Y PROVEEDOR */}
<Card
  elevation={0}
  sx={{
    mb: 4,
    p: 2.5,
    borderRadius: 2,
    border: "1px solid #e0e0e0",
    bgcolor: "#fafafa",
  }}
>
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    
    {/* IZQUIERDA: logo + nombre */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      
      {/* LOGO */}
      {localStorage.getItem("organizationLogo") ? (
        <Box
          component="img"
          src={localStorage.getItem("organizationLogo")!}
          alt="logo"
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            objectFit: "cover",
            border: "1px solid #ddd",
            backgroundColor: "#fff",
          }}
        />
      ) : (
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            backgroundColor: "#1976D2",
            color: "#fff",
            fontSize: 22,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #ddd",
          }}
        >
          {(localStorage.getItem("organizationName") || "?")
            .substring(0, 1)
            .toUpperCase()}
        </Box>
      )}

      {/* TEXTOS */}
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.2 }}>
          {localStorage.getItem("organizationName") || "Organización no seleccionada"}
        </Typography>

        {localStorage.getItem("providerName") && (
          <Typography variant="body2" color="text.secondary">
            Proveedor: <strong>{localStorage.getItem("providerName")}</strong>
          </Typography>
        )}
      </Box>
    </Box>

    {/* DERECHA: chips */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

      {/* CHIP SIMPLE/MULTI */}
      <Chip
        label={
          localStorage.getItem("organizationType") === "simple" ? "Simple" : "Multi"
        }
        color={
          localStorage.getItem("organizationType") === "simple" ? "success" : "primary"
        }
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />

      {/* CHIP CATEGORÍA */}
      {localStorage.getItem("organizationCategory") && (
        <Chip
          icon={<span style={{ fontSize: 16 }}>📁</span>}
          label={localStorage.getItem("organizationCategory")}
          sx={{ bgcolor: "#E3F2FD", fontWeight: 600 }}
        />
      )}

      {/* CHIP SUBCATEGORÍA */}
      {localStorage.getItem("organizationSubcategory") && (
        <Chip
          icon={<span style={{ fontSize: 16 }}>🏷️</span>}
          label={localStorage.getItem("organizationSubcategory")}
          sx={{ bgcolor: "#FFF3E0", fontWeight: 600 }}
        />
      )}

      {/* BOTÓN CAMBIAR */}
      <Button
        size="small"
        variant="outlined"
        onClick={handleChangeOrganization}
      >
        Cambiar
      </Button>
    </Box>

  </Box>
</Card>

      {/* 🔷 KPIs superiores */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, p: 2 }}>
            <Typography variant="h6">Turnos de Hoy</Typography>
            <Stack direction="row" spacing={2} mt={2}>
              <Chip label={`Libres: ${count.free}`} sx={{ bgcolor: "#FFF3CD", color: "#856404" }} />
              <Chip label={`Reservados: ${count.reserved}`} sx={{ bgcolor: "#E8F5E9", color: "#2E7D32" }} />
              <Chip label={`Cancelados: ${count.cancelled}`} sx={{ bgcolor: "#FFEBEE", color: "#C62828" }} />
              <Chip label={`Completados: ${count.completed}`} sx={{ bgcolor: "#E3F2FD", color: "#1565C0" }} />
              <Chip label={`No-Show: ${count.noshow}`} sx={{ bgcolor: "#F3E5F5", color: "#8e24aa" }} />
            </Stack>
          </Card>
        </Grid>

        {/* 🟦 BOTONES ACCIÓN */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Button
              variant="contained"
              startIcon={<AssignmentIndIcon />}
              fullWidth
              size="large"
            >
              Asignar Turno
            </Button>

            <Button
              variant="outlined"
              startIcon={<BlockIcon />}
              fullWidth
              size="large"
            >
              Bloquear Agenda
            </Button>
          </Stack>
        </Grid>

       
        <Grid item xs={12} md={4}>
          <DayOccupancyCard appointments={turnos} />
      </Grid>
      </Grid>

      {/* 🗂️ TABLA PRINCIPAL */}
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
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />

      {/* 🟩 RESUMEN RÁPIDO */}
      <Typography variant="h6" mt={5} mb={1}>
        Resumen de la jornada
      </Typography>

      <Card sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={3}>
          <Typography>Próximo turno: <strong>-</strong></Typography>
          <Typography>Tiempo libre hoy: <strong>-</strong></Typography>
          <Typography>Nuevos clientes hoy: <strong>-</strong></Typography>
        </Stack>
      </Card>
    </Box>
  );
}