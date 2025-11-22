
import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CircularProgress, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar } from '@mui/material';
import AppBarTop from '../components/AppBarTop';
import { getClientsByOrganization, searchClients, findClientBy, createClient, linkClientToOrganization } from '../api/clients';
import { useAuth } from '../auth/AuthContext';
import type { ClientDTO } from '../types/dto';

export default function ClientsPage() {
  const { organizationId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ClientDTO[]>([]);
  const [q, setQ] = useState('');
  // add client modal state
  const [openAdd, setOpenAdd] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchDni, setSearchDni] = useState('');
  const [foundClient, setFoundClient] = useState<ClientDTO | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ fullName: '', email: '', phone: '', password: '', dni: '' });
  // snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success'|'error'|'info'|'warning'>('success');

  const showSnackbar = (msg: string, severity: 'success'|'error'|'info'|'warning' = 'success') => {
    setSnackbarMsg(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const go = async () => {
    if (!organizationId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let resp: any;
      if (q) {
        // Enviar todos los campos con el mismo valor de búsqueda
        const params: any = {
          organizationId,
          name: q,
          email: q,
          phone: q,
          dni: q
        };
        resp = await searchClients(params);
      } else {
        resp = await getClientsByOrganization(organizationId);
      }
      setRows(resp.data || []);
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message || e?.message || 'Error en búsqueda de clientes';
      showSnackbar(serverMsg, 'error');
      setRows([]);
    }
    setLoading(false);
  };

  useEffect(() => { go(); }, []);

  const openAddModal = () => {
    setFoundClient(null);
    setCreateForm({ fullName: '', email: '', phone: '', password: '', dni: '' });
    setSearchEmail('');
    setSearchPhone('');
    setSearchDni('');
    setAddError(null);
    setOpenAdd(true);
  };

  const closeAddModal = () => {
    setOpenAdd(false);
    // asegurarse de que el buscador principal quede vacío al volver al listado
    setQ('');
  };

  const handleFind = async () => {
    setAddError(null);
    setFoundClient(null);
    setAddLoading(true);
    try {
      const params: any = {};
      if (searchEmail) params.email = searchEmail;
      if (searchPhone) params.phone = searchPhone;
      if (searchDni) params.dni = searchDni;
      const resp = await findClientBy(params);
      const client = resp?.data ?? resp ?? null;
      if (client && client.id) {
        setFoundClient(client);
        // prefill createForm too in case user wants to edit
        setCreateForm({ fullName: client.fullName || '', email: client.email || '', phone: client.phone || '', password: '', dni: (client as any).dni || '' });
      } else {
        setFoundClient(null);
        setAddError('No se encontró cliente. Complete los datos y luego vincule a la organización.');
      }
    } catch (e: any) {
      // Si el backend responde 404 significa que no encontró el cliente: indicamos al usuario que complete
      if (e?.response?.status === 404) {
        setFoundClient(null);
        // prefill create form with searched values so user can complete
        setCreateForm(f => ({ ...f, email: searchEmail || f.email, phone: searchPhone || f.phone, dni: searchDni || f.dni }));
        setAddError('No se encontró cliente. Complete los datos y luego vincule a la organización.');
      } else {
        setAddError(e?.message || 'Error en búsqueda');
      }
    }
    setAddLoading(false);
  };

  const handleLinkExisting = async () => {
    if (!foundClient || !foundClient.id || !organizationId) return;
    setAddLoading(true);
    setAddError(null);
    try {
      await linkClientToOrganization(foundClient.id as number, organizationId);
      closeAddModal();
      go();
      showSnackbar('Cliente vinculado correctamente', 'success');
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message || e?.message;
      setAddError(serverMsg || 'Error al vincular cliente');
      showSnackbar(serverMsg || 'Error al vincular cliente', 'error');
    }
    setAddLoading(false);
  };

  const handleCreateAndLink = async () => {
    if (!organizationId) { setAddError('No hay organización seleccionada'); return; }
    setAddLoading(true);
    setAddError(null);
    try {
      const resp = await createClient(createForm as any);
      const created = resp?.data ?? resp;
      const clientId = created?.id ?? created?.clientId ?? null;
      if (!clientId) throw new Error('No se recibió id del cliente creado');
      await linkClientToOrganization(clientId, organizationId);
      closeAddModal();
      go();
      showSnackbar('Cliente creado y vinculado correctamente', 'success');
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message || e?.message;
      setAddError(serverMsg || 'Error al crear/vincular cliente');
      showSnackbar(serverMsg || 'Error al crear/vincular cliente', 'error');
    }
    setAddLoading(false);
  };

  return (
    <>
      <AppBarTop />
      <Box sx={{ p:3 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>Clientes</Typography>

        <Card sx={{ mb:2 }}>
          <CardContent sx={{ display:'flex', gap:2 }}>
              <TextField fullWidth placeholder="Buscar por nombre, email, teléfono o DNI" value={q} onChange={e=>setQ(e.target.value)} />
            <Button variant="contained" onClick={go}>Buscar</Button>
            <Button variant="outlined" sx={{ ml:1 }} onClick={openAddModal}>Agregar cliente</Button>
          </CardContent>
        </Card>

          <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={()=>setSnackbarOpen(false)}>
            <Alert onClose={()=>setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMsg}
            </Alert>
          </Snackbar>

        <Dialog open={openAdd} onClose={()=>setOpenAdd(false)} fullWidth maxWidth="sm">
          <DialogTitle>Agregar / Vincular cliente</DialogTitle>
          <DialogContent>
            {addError && <Alert severity="error" sx={{ mb:2 }}>{addError}</Alert>}
            <Typography variant="subtitle2" sx={{ mb:1 }}>Buscar por email, teléfono o DNI</Typography>
            <Box sx={{ display:'flex', gap:1, mb:2 }}>
              <TextField label="Email" value={searchEmail} onChange={e=>setSearchEmail(e.target.value)} fullWidth autoComplete="off" inputProps={{ autoComplete: 'off' }} />
              <TextField label="Teléfono" value={searchPhone} onChange={e=>setSearchPhone(e.target.value)} fullWidth autoComplete="off" inputProps={{ autoComplete: 'off' }} />
              <TextField label="DNI" value={searchDni} onChange={e=>setSearchDni(e.target.value)} fullWidth autoComplete="off" inputProps={{ autoComplete: 'off' }} />
              <Button variant="outlined" onClick={handleFind} disabled={addLoading}>Buscar</Button>
            </Box>

            {foundClient ? (
              <Box sx={{ mb:2 }}>
                <Typography>Cliente encontrado: {foundClient.fullName} — {foundClient.email}</Typography>
              </Box>
            ) : (
              <Box sx={{ display:'flex', flexDirection:'column', gap:1, mb:2 }}>
                <Typography variant="subtitle2">Crear nuevo cliente</Typography>
                <TextField label="Nombre completo" value={createForm.fullName} onChange={e=>setCreateForm(f=>({...f, fullName:e.target.value}))} fullWidth autoComplete="off" inputProps={{ autoComplete: 'off' }} />
                <TextField label="Email" value={createForm.email} onChange={e=>setCreateForm(f=>({...f, email:e.target.value}))} fullWidth autoComplete="off" inputProps={{ autoComplete: 'off' }} />
                <TextField label="Teléfono" value={createForm.phone} onChange={e=>setCreateForm(f=>({...f, phone:e.target.value}))} fullWidth autoComplete="off" inputProps={{ autoComplete: 'off' }} />
                <TextField label="DNI" value={createForm.dni} onChange={e=>setCreateForm(f=>({...f, dni:e.target.value}))} fullWidth autoComplete="off" inputProps={{ autoComplete: 'off' }} />
                <TextField label="Contraseña" type="password" value={createForm.password} onChange={e=>setCreateForm(f=>({...f, password:e.target.value}))} fullWidth autoComplete="new-password" inputProps={{ autoComplete: 'new-password' }} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpenAdd(false)} disabled={addLoading}>Cancelar</Button>
            {foundClient ? (
              <Button variant="contained" onClick={handleLinkExisting} disabled={addLoading}>Vincular a organización</Button>
            ) : (
              <Button variant="contained" onClick={handleCreateAndLink} disabled={addLoading}>Crear y vincular</Button>
            )}
          </DialogActions>
        </Dialog>

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
