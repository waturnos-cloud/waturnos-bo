import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Skeleton } from '@mui/material';
import { getUser } from '../api/users';
import { updateUser } from '../api/users';

export default function EditAccountModal({ open, onClose, userId, role, onUpdated }: { open: boolean; onClose: () => void; userId: number; role: string; onUpdated?: () => void }) {
  const [form, setForm] = useState<any>({ id: userId, fullName: '', email: '', phone: '', password: '', photoUrl: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password2, setPassword2] = useState('');

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      getUser(userId).then(data => {
        setForm({
          id: data.id,
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          photoUrl: data.photoUrl || '',
          bio: data.bio || '',
          password: ''
        });
        setLoading(false);
      }).catch(e => {
        setError('Error al cargar usuario');
        setLoading(false);
      });
    }
  }, [open, userId]);

  const emailRegex = /^\S+@\S+\.\S+$/;
  const phoneRegex = /^\d{6,}$/;
  const handleSave = async () => {
    if (!form.fullName) { setError('El nombre es obligatorio'); return; }
    if (!form.email) { setError('El email es obligatorio'); return; }
    if (!emailRegex.test(form.email)) { setError('El email no es válido'); return; }
    if (!form.phone) { setError('El teléfono es obligatorio'); return; }
    if (!phoneRegex.test(form.phone)) { setError('El teléfono debe ser numérico y tener al menos 6 dígitos'); return; }
    if (form.password && form.password !== password2) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true);
    setError(null);
      try {
      let body: any = { id: form.id, fullName: form.fullName, email: form.email, phone: form.phone };
      if (form.password) body.password = form.password;
      if (role === 'PROVIDER') {
        body.photoUrl = form.photoUrl;
        body.bio = form.bio;
      }
      await updateUser(body);
      setLoading(false);
      onUpdated && onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al actualizar usuario');
      setLoading(false);
    }

    };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Administrar mi cuenta</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="text" width="20%" />
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="text" width="20%" />
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
            {role === 'PROVIDER' && (
              <>
                <Skeleton variant="rectangular" height={56} />
                <Skeleton variant="rectangular" height={80} />
              </>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Nombre</Typography>
              <TextField variant="outlined" placeholder="Nombre" value={form.fullName} onChange={e => setForm((f: any) => ({ ...f, fullName: e.target.value }))} fullWidth required error={!form.fullName} helperText={!form.fullName ? 'El nombre es obligatorio' : ''} />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Email *</Typography>
              <TextField variant="outlined" placeholder="Email" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} fullWidth required error={!form.email} helperText={!form.email ? 'El email es obligatorio' : ''} />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Teléfono *</Typography>
              <TextField variant="outlined" placeholder="Teléfono" value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} fullWidth required error={!form.phone} helperText={!form.phone ? 'El teléfono es obligatorio' : ''} />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Contraseña</Typography>
              <TextField variant="outlined" type="password" placeholder="Contraseña" value={form.password} onChange={e => setForm((f: any) => ({ ...f, password: e.target.value }))} fullWidth autoComplete="new-password" helperText="Solo si desea cambiarla" error={!!form.password && form.password !== password2} />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Repetir contraseña</Typography>
              <TextField variant="outlined" type="password" placeholder="Repetir contraseña" value={password2} onChange={e => setPassword2(e.target.value)} fullWidth autoComplete="new-password" error={!!form.password && form.password !== password2} helperText={form.password && form.password !== password2 ? 'Las contraseñas no coinciden' : ''} />
            </Box>

            {role === 'PROVIDER' && (
              <>
                <TextField variant="outlined" label="Foto URL" value={form.photoUrl} onChange={e => setForm((f: any) => ({ ...f, photoUrl: e.target.value }))} fullWidth helperText="URL de la foto del profesional" InputLabelProps={{ shrink: true }} />
                <TextField variant="outlined" label="Bio" value={form.bio} onChange={e => setForm((f: any) => ({ ...f, bio: e.target.value }))} fullWidth multiline minRows={2} helperText="Información profesional" InputLabelProps={{ shrink: true }} />
              </>
            )}
          </Box>
        )}
        {error && <Box sx={{ color: 'red', mt: 2 }}>{error}</Box>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
