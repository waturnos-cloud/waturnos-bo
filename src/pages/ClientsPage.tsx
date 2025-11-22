
import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CircularProgress, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import AppBarTop from '../components/AppBarTop';
import { getClientsByOrganization, searchClients } from '../api/clients';
import { useAuth } from '../auth/AuthContext';
import type { ClientDTO } from '../types/dto';

export default function ClientsPage() {
  const { organizationId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ClientDTO[]>([]);
  const [q, setQ] = useState('');

  const go = async () => {
    if (!organizationId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const resp = q
      ? await searchClients({ name: q, email: q, phone: q, dni: q, organizationId })
      : await getClientsByOrganization(organizationId);
    setRows(resp.data || []);
    setLoading(false);
  };

  useEffect(() => { go(); }, []);

  return (
    <>
      <AppBarTop />
      <Box sx={{ p:3 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>Clientes</Typography>

        <Card sx={{ mb:2 }}>
          <CardContent sx={{ display:'flex', gap:2 }}>
              <TextField fullWidth placeholder="Buscar por nombre, email, teléfono o DNI" value={q} onChange={e=>setQ(e.target.value)} />
            <Button variant="contained" onClick={go}>Buscar</Button>
          </CardContent>
        </Card>

        {loading ? <CircularProgress/> : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>DNI</TableCell>
                <TableCell>Teléfono</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r=>(
                <TableRow key={r.id}>
                  <TableCell>{r.fullName}</TableCell>
                  <TableCell>{r.email || '—'}</TableCell>
                  <TableCell>{(r as any).dni || '—'}</TableCell>
                  <TableCell>{r.phone || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </>
  );
}
