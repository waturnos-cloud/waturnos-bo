import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  CircularProgress,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Paper,
  Tooltip,
} from "@mui/material";
// authFetch wrapper retained for compatibility in api/http.ts; using typed helpers instead
import { useAuth } from "../auth/AuthContext";
import { getTodayByProvider } from "../api/bookings";
import type { BookingDTO } from "../types/dto";
import { createRoot } from "react-dom/client";

export default function BookingsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("dayGridMonth");
  const { providerId } = useAuth();

  const statusColors: Record<string, string> = {
    PENDING: "#FFA000", // Amarillo
    CONFIRMED: "#2E7D32", // Verde
    CANCELLED: "#C62828", // Rojo
    COMPLETED: "#1565C0", // Azul
  };

  useEffect(() => {
    if (providerId) loadBookings(providerId);
  }, [providerId]);

  const loadBookings = async (provId: number) => {
    try {
      const json = await getTodayByProvider(provId);
      const list = json.data ?? json ?? [];
      setBookings(list);
      setEvents(mapEvents(list, view));
    } catch (err) {
      console.error("Error cargando turnos:", err);
    } finally {
      setLoading(false);
    }
  };

  const mapEvents = (list: BookingDTO[], currentView: string) => {
    if (currentView === "dayGridMonth") {
      const grouped: Record<string, Record<string, number>> = {};
      list.forEach((b) => {
        const day = b.startTime.slice(0, 10);
        grouped[day] ||= {};
        grouped[day][b.status] = (grouped[day][b.status] || 0) + 1;
      });

      return Object.entries(grouped).flatMap(([day, statuses]) =>
        Object.entries(statuses).map(([status, count]) => ({
          id: `${day}-${status}`,
          title:
                 status === "PENDING"
              ? `${count} libres`
              : status === "CONFIRMED"
              ? `${count} confirmados`
              : status === "CANCELLED"
              ? `${count} cancelados`
              : status === "COMPLETED"
              ? `${count} completados`
              : status === "RESERVED"
              ? `${count} reservados`
              : ``,
          start: day,
          allDay: true,
          backgroundColor: statusColors[status],
          borderColor: "transparent",
        }))
      );
    } else {
      return list.map((b) => ({
        id: b.id,
        title:
          b.status === "PENDING"
            ? "Libre"
            : b.status === "CONFIRMED"
            ? "Confirmado"
            : b.status === "CANCELLED"
            ? "Cancelado"
            : "Completado",
        start: b.startTime,
        end: b.endTime,
        backgroundColor: statusColors[b.status] || "#757575",
        borderColor: "transparent",
        extendedProps: {
          startTime: new Date(b.startTime).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          endTime: new Date(b.endTime).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      }));
    }
  };

  const handleDatesSet = (arg: any) => {
    setView(arg.view.type);
    setEvents(mapEvents(bookings, arg.view.type));
  };

  const handleViewChange = (_: any, newView: typeof view | null) => {
    if (newView) setView(newView);
  };

  // 🎨 Render tooltip de MUI sobre cada evento
  const handleEventDidMount = (info: any) => {
    if (view === "dayGridMonth") return; // sin tooltip en vista mensual
    const { startTime, endTime } = info.event.extendedProps;

    const tooltipEl = document.createElement("div");
    createRoot(tooltipEl).render(
      <Tooltip title={`${startTime} - ${endTime}`} placement="top" arrow>
        <span>{info.el.textContent}</span>
      </Tooltip>
    );
    info.el.innerHTML = "";
    info.el.appendChild(tooltipEl);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={600}>
          📅 Calendario de Turnos
        </Typography>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={{
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: 1,
            "& .MuiToggleButton-root": {
              textTransform: "none",
              px: 2,
            },
          }}
        >
          <ToggleButton value="dayGridMonth">Mes</ToggleButton>
          <ToggleButton value="timeGridWeek">Semana</ToggleButton>
          <ToggleButton value="timeGridDay">Día</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Paper elevation={2} sx={{ p: 2 }}>
        <FullCalendar
          key={view}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={false}
          locale="es"
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          events={events}
          height="80vh"
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          displayEventTime={true}
          nowIndicator={true}
          datesSet={handleDatesSet}
          eventDidMount={handleEventDidMount}
        />
      </Paper>
    </Box>
  );
}