import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Select, MenuItem, InputLabel, FormControl, CircularProgress } from '@mui/material';
import OrganizationLocationsWizard from './OrganizationLocationsWizard';
import { getOrganization, updateOrganization } from '../api/organizations';
import { getCategories } from '../api/categories';

export default function EditOrganizationModal({ open, onClose, organizationId, onUpdated }: { open: boolean; onClose: () => void; organizationId: number; onUpdated?: () => void }) {
  const [form, setForm] = useState({ id: organizationId, name: '', typeId: '', logoUrl: '' });
  const [wizardOpen, setWizardOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (open && organizationId) {
      setLoading(true);
      getOrganization(organizationId).then(data => {
        setForm({
          id: data.id,
          name: data.name || '',
          typeId: data.type?.id || data.type || '',
          logoUrl: data.logoUrl || ''
        });
        setLoading(false);
      }).catch(e => {
        setError('Error al cargar organización');
        setLoading(false);
      });
    }
  }, [open, organizationId]);

  useEffect(() => {
    // Cargar categorías para seleccionar (igual que en creación)
    let mounted = true;
    getCategories().then(res => {
      const list = (res.data ?? res ?? []) as any[];
      if (!mounted) return;
      setCategories(list.map(c => ({ id: c.id, name: c.name })));
    }).catch(err => {
      console.error('Error cargando categorías', err);
    });
    return () => { mounted = false; };
  }, []);

  const emailRegex = /^\S+@\S+\.\S+$/;
  const phoneRegex = /^\d{6,}$/;
  const handleSave = async () => {
    if (!form.name) { setError('El nombre es obligatorio'); return; }
    if (!form.typeId) { setError('El tipo es obligatorio'); return; }
    // No hay email ni teléfono en este modal, pero si se agregan, usar regex
    setLoading(true);
    setError(null);
    try {
      await updateOrganization({ id: form.id, name: form.name, type: { id: Number(form.typeId) }, logoUrl: form.logoUrl });
      setLoading(false);
      onUpdated && onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al actualizar organización');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Organización</DialogTitle>
      <DialogContent sx={{ position: 'relative' }}>
        {loading && (
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.6)' }}>
            <CircularProgress />
          </Box>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, opacity: loading ? 0.6 : 1 }}>
          <TextField label="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth required disabled={loading} error={!loading && !form.name} helperText={!loading && !form.name ? 'El nombre es obligatorio' : ''} />
          <FormControl fullWidth required disabled={loading}>
            <InputLabel id="category-label">Categoría</InputLabel>
            <Select
              labelId="category-label"
              label="Categoría"
              value={form.typeId}
              onChange={e => setForm(f => ({ ...f, typeId: String(e.target.value) }))}
            >
              <MenuItem value="">-- Seleccione --</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={String(cat.id)}>{cat.name}</MenuItem>
              ))}
            </Select>
            {!loading && !form.typeId && <Box sx={{ color: 'error.main', mt: 1, fontSize: 12 }}>La categoría es obligatoria</Box>}
          </FormControl>
          <TextField label="Logo URL" value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} fullWidth helperText="URL de la imagen del logo" disabled={loading} />
          <Button variant="outlined" sx={{ mt:2 }} onClick={()=>setWizardOpen(true)} disabled={loading}>Ubicaciones</Button>
        </Box>
        {error && <Box sx={{ color: 'red', mt: 2 }}>{error}</Box>}
        <OrganizationLocationsWizard open={wizardOpen} onClose={()=>setWizardOpen(false)} organizationId={organizationId} onUpdated={onUpdated} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
