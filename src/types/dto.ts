
import type { BookingStatus } from './enums';

export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { token: string; user?: any; }

export interface ClientDTO {
  id?: number;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingDTO {
  id?: number;
  serviceId: number;
  clientId?: number | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string | null;
}

export interface AssignBooking { id: number; clientId: number; }
export interface CancelBooking { id: number; reason: string; }

export interface ServiceDTO {
  id?: number;
  name: string;
  description?: string;
  price?: number;
  durationMinutes: number;
  advancePayment?: number;
  futureDays?: number;
  userId?: number;
  locationId?: number;
}

export interface OrganizationDTO {
  id?: number;
  name?: string;
  type?: string;
  logoUrl?: string;
  simpleOrganization?: boolean;
  categoryName?: string;
  subcategoryName?: string;
  active?: boolean;
}

export interface ProviderDTO {
  id?: number;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
}

export interface CategoryDTO {
  id?: number;
  name: string;
  parentId?: number | null;
}

export interface LockCalendarDTO {
  startTime: string;
  endTime: string;
  serviceId: number;
}
