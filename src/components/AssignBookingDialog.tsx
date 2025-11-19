
import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { BookingDTO, ClientDTO } from '../types/dto';
import { createBookings } from '../api/bookings';
import { getClients } from '../api/clients';

type Props = { open: boolean; onClose: () => void; serviceId: number; };
export default function AssignBookingDialog({ open, onClose, serviceId }: Props) {
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [clientId, setClientId] = useState<number | ''>('');
  const [date, setDate] = useState<string>('');
  const [start, setStart] = useState<string>('');
  const [durationMin, setDurationMin] = useState<number>(30);

  useEffect(() => { if (open) getClients().then(r => setClients(r.data||[])); }, [open]);

  const handleAssign = async () => {
    if (!clientId || !date || !start) return;
    const startISO = new Date(`${date}T${start}:00`);
    const endISO = new Date(startISO.getTime() + durationMin * 60000);

    const payload: BookingDTO = {
      serviceId,
      clientId: 0,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    status: 'RESERVED'
    };
    await createBookings([payload]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Asignar turno</DialogTitle>
      <DialogContent sx={{ display:'grid', gap:2, pt:2 }}>
        <TextField label="Fecha" type="date" InputLabelProps={{ shrink: true }} value={date} onChange={e=>setDate(e.target.value)} />
        <TextField label="Hora inicio" type="time" InputLabelProps={{ shrink: true }} value={start} onChange={e=>setStart(e.target.value)} />
        <TextField select label="Cliente" value={clientId} onChange={e=>setClientId(Number(e.target.value))}>
          {clients.map(c => <MenuItem key={c.id} value={c.id!}>{c.fullName}</MenuItem>)}
        </TextField>
        <TextField label="Duración (min)" type="number" value={durationMin} onChange={e=>setDurationMin(Number(e.target.value))}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleAssign}>Asignar</Button>
      </DialogActions>
    </Dialog>
  );
}
