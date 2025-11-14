// types.ts
export type AppointmentStatus =
  | "FREE"
  | "RESERVED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO-SHOW";

export interface Appointment {
  id: string;
  startTime: string; // ISO string
  endTime?: string;  // opcional
  durationMinutes?: number; // opcional
  status: AppointmentStatus;
  clientName?: string | null;
  serviceName?: string | null;
}