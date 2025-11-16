// types.ts
import type { AppointmentStatus } from './enums';

export interface Appointment {
  id: number;
  startTime: string; // ISO string
  endTime?: string; // opcional
  durationMinutes?: number; // opcional
  status: AppointmentStatus;
  clientName?: string | null;
  serviceName?: string | null;
}