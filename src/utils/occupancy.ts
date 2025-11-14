// src/utils/occupancy.ts

export interface Appointment {
  id: number;
  startTime: string;
  endTime?: string;
  status: string;
}

export function calculateDayOccupancy(appointments: Appointment[]) {
  if (!appointments || appointments.length === 0) {
    return {
      occupiedSlots: 0,
      freeSlots: 0,
      totalSlots: 0,
      occupancyPercent: 0,
    };
  }

  const occupiedStatuses = ["RESERVED", "COMPLETED", "NO-SHOW"];

  const occupiedSlots = appointments.filter((a) =>
    occupiedStatuses.includes(a.status)
  ).length;

  const freeSlots = appointments.filter((a) => a.status === "FREE").length;

  const totalSlots = appointments.length;

  const occupancyPercent =
    totalSlots === 0 ? 0 : Math.round((occupiedSlots / totalSlots) * 100);

  return { occupiedSlots, freeSlots, totalSlots, occupancyPercent };
}