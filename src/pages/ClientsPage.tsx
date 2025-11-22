
import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CircularProgress, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar } from '@mui/material';
import { IconButton } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AppBarTop from '../components/AppBarTop';
import { getClientsByOrganization, searchClients, findClientBy, createClient, linkClientToOrganization, updateClient, unlinkClientFromOrganization, notifyClient } from '../api/clients';
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
  // edit client state
  const [openEdit, setOpenEdit] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  // delete / notify state
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClientDTO | null>(null);
  const [openNotify, setOpenNotify] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState<ClientDTO | null>(null);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifySubject, setNotifySubject] = useState('');
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
    // Validaciones
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
    const phoneRegex = /^\d+$/;
    const dniRegex = /^\d+$/;
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!createForm.fullName || !nameRegex.test(createForm.fullName)) {
      setAddError('El nombre debe ser solo letras y espacios');
      return;
    }
    if (!createForm.phone || !phoneRegex.test(createForm.phone)) {
      setAddError('El teléfono debe ser solo números');
      return;
    }
    if (!createForm.dni || !dniRegex.test(createForm.dni)) {
      setAddError('El DNI debe ser solo números');
      return;
    }
    if (!createForm.email || !emailRegex.test(createForm.email)) {
      setAddError('El email no es válido');
      return;
    }
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

  const openEditModal = (client: ClientDTO) => {
    setEditingClientId(client.id ?? null);
    setCreateForm({ fullName: client.fullName || '', email: client.email || '', phone: client.phone || '', password: '', dni: (client as any).dni || '' });
    setOpenEdit(true);
    setAddError(null);
  };

  const closeEditModal = () => {
    setOpenEdit(false);
    setEditingClientId(null);
  };

  const handleUpdateClient = async () => {
    if (!editingClientId) return;
    // Validaciones (mismas que al crear)
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
    const phoneRegex = /^\d+$/;
    const dniRegex = /^\d+$/;
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!createForm.fullName || !nameRegex.test(createForm.fullName)) {
      setAddError('El nombre debe ser solo letras y espacios');
      return;
    }
    if (!createForm.phone || !phoneRegex.test(createForm.phone)) {
      setAddError('El teléfono debe ser solo números');
      return;
    }
    if (!createForm.dni || !dniRegex.test(createForm.dni)) {
      setAddError('El DNI debe ser solo números');
      return;
    }
    if (!createForm.email || !emailRegex.test(createForm.email)) {
      setAddError('El email no es válido');
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
    const body: ClientDTO = { id: editingClientId ?? undefined, fullName: createForm.fullName, dni: createForm.dni, email: createForm.email, phone: createForm.phone };
    await updateClient(body as any);
      closeEditModal();
      go();
      showSnackbar('Cliente actualizado correctamente', 'success');
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message || e?.message;
      setAddError(serverMsg || 'Error al actualizar cliente');
      showSnackbar(serverMsg || 'Error al actualizar cliente', 'error');
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

        {/* Delete confirmation dialog */}
        <Dialog open={openDelete} onClose={()=>setOpenDelete(false)}>
          <DialogTitle>Eliminar cliente de la organización</DialogTitle>
          <DialogContent>
            <Typography>¿Estás seguro que querés eliminar a {deleteTarget?.fullName} de la organización?</Typography>
            {addError && <Alert severity="error" sx={{ mt:2 }}>{addError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpenDelete(false)} disabled={addLoading}>Cancelar</Button>
            <Button color="error" variant="contained" onClick={async ()=>{
              if (!deleteTarget || !organizationId) return;
              setAddLoading(true);
              setAddError(null);
              try {
                await unlinkClientFromOrganization(deleteTarget.id as number, organizationId);
                setOpenDelete(false);
                setDeleteTarget(null);
                go();
                showSnackbar('Cliente eliminado de la organización', 'success');
              } catch (e: any) {
                const serverMsg = e?.response?.data?.message || e?.message;
                setAddError(serverMsg || 'Error al eliminar cliente');
                showSnackbar(serverMsg || 'Error al eliminar cliente', 'error');
              }
              setAddLoading(false);
            }} disabled={addLoading}>Eliminar</Button>
          </DialogActions>
        </Dialog>

        {/* Notify dialog */}
        <Dialog open={openNotify} onClose={()=>setOpenNotify(false)} fullWidth maxWidth="sm">
          <DialogTitle>Enviar notificación</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb:1 }}>Enviar notificación a {notifyTarget?.fullName}</Typography>
            <TextField label="Asunto" fullWidth value={notifySubject} onChange={e=>setNotifySubject(e.target.value)} sx={{ mb:2 }} />
            <TextField fullWidth multiline minRows={3} value={notifyMessage} onChange={e=>setNotifyMessage(e.target.value)} placeholder="Mensaje de notificación" />
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpenNotify(false)}>Cancelar</Button>
            <Button variant="contained" onClick={async ()=>{
              if (!notifyTarget) return;
              if (!notifySubject || notifySubject.trim().length===0) { showSnackbar('Ingrese un asunto', 'warning'); return; }
              if (!notifyMessage || notifyMessage.trim().length===0) { showSnackbar('Ingrese un mensaje', 'warning'); return; }
              if (!organizationId) { showSnackbar('No hay organización seleccionada', 'error'); return; }
              try {
                await notifyClient(notifyTarget.id as number, { language: 'ES', subject: notifySubject, message: notifyMessage, organizationId: organizationId });
                setOpenNotify(false);
                setNotifyTarget(null);
                setNotifyMessage('');
                setNotifySubject('');
                showSnackbar('Notificación enviada', 'success');
              } catch (e: any) {
                const serverMsg = e?.response?.data?.message || e?.message;
                showSnackbar(serverMsg || 'Error al enviar notificación', 'error');
              }
            }}>Enviar</Button>
          </DialogActions>
        </Dialog>
        
        {/* Edit dialog */}
        <Dialog open={openEdit} onClose={closeEditModal} fullWidth maxWidth="sm">
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogContent>
            {addError && <Alert severity="error" sx={{ mb:2 }}>{addError}</Alert>}
            <Box sx={{ display:'flex', flexDirection:'column', gap:1, mb:2 }}>
              <TextField label="Nombre completo" value={createForm.fullName} onChange={e=>setCreateForm(f=>({...f, fullName:e.target.value}))} fullWidth autoComplete="off" inputProps={{ autoComplete: 'off' }} />
              <TextField label="Email" value={createForm.email} onChange={e=>setCreateForm(f=>({...f, email:e.target.value}))} fullWidth autoComplete="off" inputProps={{ autoComplete: 'off' }} />
              <TextField label="Teléfono" value={createForm.phone} onChange={e=>setCreateForm(f=>({...f, phone:e.target.value}))} fullWidth autoComplete="off" inputProps={{ autoComplete: 'off' }} />
              <TextField label="DNI" value={createForm.dni} onChange={e=>setCreateForm(f=>({...f, dni:e.target.value}))} fullWidth autoComplete="off" inputProps={{ autoComplete: 'off' }} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditModal} disabled={addLoading}>Cancelar</Button>
            <Button variant="contained" onClick={handleUpdateClient} disabled={addLoading}>Actualizar</Button>
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
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r=>(
                <TableRow key={r.id}>
                  <TableCell>{r.fullName}</TableCell>
                  <TableCell>{r.email || '—'}</TableCell>
                  <TableCell>{(r as any).dni || '—'}</TableCell>
                  <TableCell>{r.phone || '—'}</TableCell>
                  <TableCell align="center">
                      <IconButton title="Enviar notificación" size="small" onClick={()=>{ setNotifyTarget(r); setNotifyMessage(''); setNotifySubject(''); setOpenNotify(true); }}>
                        <NotificationsActiveIcon fontSize="small" />
                      </IconButton>
                      <IconButton title="Editar cliente" size="small" onClick={()=>{ openEditModal(r); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton title="Eliminar de organización" size="small" onClick={()=>{ setDeleteTarget(r); setOpenDelete(true); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </>
  );
}
