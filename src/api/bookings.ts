
import api from './axios';
import { BookingDTO, AssignBooking, CancelBooking } from '../types/dto';

export async function getByService(serviceId: number) {
  const { data } = await api.get(`/bookings/service/${serviceId}`);
  return data as BookingDTO[];
}

export async function createBookings(arr: BookingDTO[]) {
  const { data } = await api.post('/bookings', arr);
  return data;
}

export async function assignBooking(body: AssignBooking) {
  const { data } = await api.post('/bookings/assign', body);
  return data;
}

export async function cancelBooking(body: CancelBooking) {
  const { data } = await api.post('/bookings/cancel', body);
  return data;
}
