import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, IconButton, Typography, CircularProgress, Skeleton, Checkbox, FormControlLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { updateLocations } from '../api/organizationLocations';
import { getOrganization } from '../api/organizations';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { LocationMarker } from './LocationMarker';
import 'leaflet/dist/leaflet.css';

export default function OrganizationLocationsWizard({ open, onClose, organizationId, onUpdated }: { open: boolean; onClose: () => void; organizationId: number; onUpdated?: () => void }) {
  const [locations, setLocations] = useState<any[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ name: '', address: '', phone: '', email: '', latitude: '', longitude: '', main: false });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && organizationId) {
      setLoading(true);
      getOrganization(organizationId).then(data => {
        setLocations(data.locations || []);
        setLoading(false);
      }).catch(err => {
        console.error('Error cargando organización:', err);
        setLoading(false);
      });
    }
  }, [open, organizationId]);

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setForm({ ...locations[idx] });
  };

  const handleAdd = () => {
    setEditingIdx(locations.length);
    setForm({ name: '', address: '', phone: '', email: '', latitude: '', longitude: '', main: false });
  };

  const emailRegex = /^\S+@\S+\.\S+$/;
  const phoneRegex = /^\d{6,}$/;
  const handleSave = () => {
    if (!form.name || !form.address || !form.phone || !form.email) { setError('Todos los campos son obligatorios'); return; }
    if (!emailRegex.test(form.email)) { setError('El email no es válido'); return; }
    if (!phoneRegex.test(form.phone)) { setError('El teléfono debe ser numérico y tener al menos 6 dígitos'); return; }
    if (form.main && locations.some((loc, i) => loc.main && i !== editingIdx)) { setError('Solo una sede puede ser principal'); return; }
    setError(null);
    let newLocs = [...locations];
    newLocs[editingIdx!] = { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) };
    setLocations(newLocs);
    setEditingIdx(null);
    setForm({ name: '', address: '', phone: '', email: '', latitude: '', longitude: '', main: false });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateLocations({ id: organizationId, locations });
      setLoading(false);
      onUpdated && onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al actualizar direcciones');
      setLoading(false);
    }
  };

  // Helper para centrar el mapa cuando cambian las coordenadas del form
  function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      if (center && map) {
        map.setView(center, map.getZoom());
      }
    }, [center, map]);
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Direcciones de la Organización</DialogTitle>
      <DialogContent>
        {/* Mostrar Skeletons durante la carga en lugar de overlay */}
        {loading ? (
          <Box sx={{ mb: 2 }}>
            {[0,1,2].map(i => (
              <Box key={i} sx={{ p:2, mb:2, borderRadius:2 }}>
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="60%" />
              </Box>
            ))}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Skeleton variant="rectangular" width={140} height={40} />
              <Skeleton variant="rectangular" width={100} height={40} />
            </Box>
          </Box>
        ) : (
          <Box sx={{ mb:2 }}>
            {locations.map((loc, idx) => (
              <Box key={idx} sx={{ p:2, mb:2, border:'1px solid #eee', borderRadius:2, position:'relative' }}>
                <Typography variant="subtitle1">{loc.name}</Typography>
                <Typography variant="body2">{loc.address} | {loc.phone} | {loc.email}</Typography>
                <Typography variant="body2">Lat: {loc.latitude} | Lng: {loc.longitude} {loc.main ? '(Principal)' : ''}</Typography>
                <IconButton sx={{ position:'absolute', top:8, right:8 }} onClick={()=>handleEdit(idx)}><EditIcon /></IconButton>
              </Box>
            ))}
          </Box>
        )}
        <Button startIcon={<AddIcon />} onClick={handleAdd}>Agregar sede</Button>
        {editingIdx !== null && (
          <Box sx={{ mt:2, p:2, border:'1px solid #ccc', borderRadius:2 }}>
            <TextField label="Nombre" value={form.name} onChange={e=>setForm((f: Record<string, any>)=>({...f, name:e.target.value}))} fullWidth sx={{ mb:1 }} required error={!form.name} helperText={!form.name ? 'El nombre es obligatorio' : ''} />
            <TextField label="Dirección" value={form.address} onChange={e=>setForm((f: Record<string, any>)=>({...f, address:e.target.value}))} fullWidth sx={{ mb:1 }} required error={!form.address} helperText={!form.address ? 'La dirección es obligatoria' : ''} />
            <TextField label="Teléfono" value={form.phone} onChange={e=>setForm((f: Record<string, any>)=>({...f, phone:e.target.value}))} fullWidth sx={{ mb:1 }} required error={!form.phone} helperText={!form.phone ? 'El teléfono es obligatorio' : ''} />
            <TextField label="Email" value={form.email} onChange={e=>setForm((f: Record<string, any>)=>({...f, email:e.target.value}))} fullWidth sx={{ mb:1 }} required error={!form.email} helperText={!form.email ? 'El email es obligatorio' : ''} />
            {/* Selector por mapa: no se muestran inputs de lat/lng manuales */}
            <Box sx={{ height: 300, mb: 1 }}>
              <MapContainer center={[Number(form.latitude) || -37.33, Number(form.longitude) || -59.13]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapUpdater center={[Number(form.latitude) || -37.33, Number(form.longitude) || -59.13]} />
                <LocationMarker
                  position={{ lat: Number(form.latitude) || -37.33, lng: Number(form.longitude) || -59.13 }}
                  onPositionChange={(lat, lng) => setForm((f: Record<string, any>) => ({ ...f, latitude: lat, longitude: lng }))}
                  clickToPlace={true}
                />
              </MapContainer>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Haz click en el mapa para colocar la sede o arrastra el marcador para ajustarla.
            </Typography>
            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.main}
                    onChange={e => setForm((f: Record<string, any>) => ({ ...f, main: e.target.checked }))}
                  />
                }
                label="Principal"
              />
            </Box>
            <Box sx={{ mt:2, display:'flex', gap:2 }}>
              <Button variant="outlined" onClick={()=>{setEditingIdx(null);setForm({ name: '', address: '', phone: '', email: '', latitude: '', longitude: '', main: false });}}>Cancelar</Button>
              <Button variant="contained" onClick={handleSave}>Guardar sede</Button>
            </Box>
            {error && <Box sx={{ color:'red', mt:2 }}>{error}</Box>}
          </Box>
        )}
        {error && <Box sx={{ color:'red', mt:2 }}>{error}</Box>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>Guardar todo</Button>
      </DialogActions>
    </Dialog>
  );
}
