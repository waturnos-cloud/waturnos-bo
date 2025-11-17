import { useEffect, useState, useRef } from "react";
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
import { getTodayByProvider, getRangeByProvider } from "../api/bookings";
import type { BookingDTO } from "../types/dto";
import { createRoot } from "react-dom/client";

export default function BookingsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("dayGridMonth");
  const { providerId } = useAuth();
  const calendarRef = useRef<any>(null);
  const lastRequestRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const statusColors: Record<string, string> = {
    FREE: "#FFA000", // Amarillo
    CONFIRMED: "#2E7D32", // Verde
    CANCELLED: "#C62828", // Rojo
    COMPLETED: "#1565C0", // Azul
  };

  useEffect(() => {
    // when providerId changes, let the calendar's datesSet handler trigger the load.
    // we keep this effect to reset events when providerId becomes undefined
    if (!providerId) {
      setEvents([]);
      setBookings([]);
    }
  }, [providerId]);

  // If the calendar didn't trigger datesSet (edge cases), trigger an initial load
  useEffect(() => {
    if (!providerId) return;
    if (events.length > 0) return;
    if (loading) return;

    const now = new Date();
    let start: Date;
    let end: Date;

    if (view === "dayGridMonth") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (view === "timeGridWeek") {
      const day = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      end.setDate(start.getDate() + 1);
    }

    const s = formatLocalDate(start);
    const e = formatLocalDate(end);
    loadBookings(providerId, s, e, view);
  }, [providerId, view]);

  const loadBookings = async (
    provId: number,
    startDate?: string,
    endDate?: string,
    currentView?: string
  ) => {
    const reqKey = `${provId}|${startDate || ""}|${endDate || ""}`;
    if (lastRequestRef.current === reqKey) return; // avoid duplicate concurrent requests
    lastRequestRef.current = reqKey;
    try {
      setLoading(true);

      console.log("loadBookings start", { provId, startDate, endDate, currentView });
      if (startDate && endDate) {
        // New range endpoint returns grouped data by day -> services -> bookings
        const json = await getRangeByProvider(provId, startDate, endDate);
        const grouped = json.data ?? json ?? {};

        const list: BookingDTO[] = [];
        Object.entries(grouped).forEach(([day, services]) => {
          (services as any[]).forEach((svc) => {
            (svc.bookings ?? []).forEach((b: any) => {
              list.push({
                id: b.id,
                serviceId: svc.serviceId,
                startTime: b.startTime,
                endTime: b.endTime,
                status: b.status,
              });
            });
          });
        });
        setBookings(list);
        try {
          setEvents(mapEvents(list, currentView || view));
        } catch (err) {
          console.error("Error mapping events:", err);
          setEvents([]);
        }
      } else {
        const json = await getTodayByProvider(provId);
        const todayList = (json?.data ?? json) as any[];
        const list: BookingDTO[] = (todayList ?? []).map((b: any) => ({
          id: b.id,
          serviceId: b.serviceId,
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status,
        }));
        setBookings(list);
        try {
          setEvents(mapEvents(list, view));
        } catch (err) {
          console.error("Error mapping events:", err);
          setEvents([]);
        }
      }
    } catch (err) {
      console.error("Error cargando turnos:", err);
    } finally {
      setLoading(false);
      console.log("loadBookings end", { provId, startDate, endDate, currentView });
      // clear lastRequest so future requests can run
      lastRequestRef.current = null;
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
                 status === "FREE"
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
          b.status === "FREE"
            ? "Libre"
            : b.status === "RESERVED"
            ? "Reservado"
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

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleDatesSet = (arg: any) => {
    console.log("FullCalendar datesSet fired", { arg });
    const newView = arg.view.type as typeof view;
    if (newView !== view) setView(newView);

    // Ask backend for the visible range
    if (providerId) {
      const startDate = formatLocalDate(new Date(arg.start));
      const endDate = formatLocalDate(new Date(arg.end));

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // debounce requests to avoid rapid duplicate calls
      // window.setTimeout returns a number in browsers
      debounceTimerRef.current = window.setTimeout(() => {
        loadBookings(providerId, startDate, endDate, newView);
        debounceTimerRef.current = null;
      }, 150) as unknown as number;
    } else {
      setEvents(mapEvents(bookings, newView));
    }
  };

  const handleViewChange = (_: any, newView: typeof view | null) => {
    if (!newView) return;
    setView(newView);
    // If user toggles the view, instruct FullCalendar to change view programmatically
    try {
      const api = (calendarRef.current as any)?.getApi?.();
      if (api && api.view?.type !== newView) api.changeView(newView);
    } catch (err) {
      console.warn("Could not change FullCalendar view programmatically", err);
    }
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

  useEffect(() => {
    const onBefore = (e: BeforeUnloadEvent) => {
      console.log("window beforeunload fired", e);
    };
    const onUnload = (e: Event) => {
      console.log("window unload fired", e);
    };
    const onVisibility = () => {
      console.log("document.visibilityState", document.visibilityState);
    };
    window.addEventListener("beforeunload", onBefore);
    window.addEventListener("unload", onUnload);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", onBefore);
      window.removeEventListener("unload", onUnload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

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
        <Box sx={{ position: "relative" }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.6)",
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <FullCalendar
            ref={calendarRef}
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
        </Box>
      </Paper>
    </Box>
  );
}