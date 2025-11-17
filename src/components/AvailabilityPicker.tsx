import React from 'react';
import { Box, Grid, IconButton, Switch, TextField, Typography, Stack, Button } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

export type TimeRange = { start: string; end: string };
export type DayAvailability = { dayOfWeek: number; enabled: boolean; ranges: TimeRange[] };

interface Props {
  value?: DayAvailability[];
  onChange?: (v: DayAvailability[]) => void;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function ensureDays(v?: DayAvailability[]) {
  if (!v || v.length !== 7) {
    return Array.from({ length: 7 }).map((_, i) => ({ dayOfWeek: i, enabled: false, ranges: [] }));
  }
  return v;
}

export default function AvailabilityPicker({ value, onChange }: Props) {
  const [days, setDays] = React.useState<DayAvailability[]>(() => ensureDays(value));

  React.useEffect(() => {
    setDays(ensureDays(value));
  }, [value]);

  const emit = (next: DayAvailability[]) => {
    setDays(next);
    onChange?.(next);
  };

  const toggleDay = (index: number) => {
    const next = days.map((d, i) => (i === index ? { ...d, enabled: !d.enabled } : d));
    emit(next);
  };

  const addRange = (index: number) => {
    const next = days.slice();
    next[index] = { ...next[index], enabled: true, ranges: [...next[index].ranges, { start: '09:00', end: '17:00' }] };
    emit(next);
  };

  const removeRange = (dayIdx: number, rangeIdx: number) => {
    const next = days.slice();
    next[dayIdx] = { ...next[dayIdx], ranges: next[dayIdx].ranges.filter((_, i) => i !== rangeIdx) };
    emit(next);
  };

  const setRange = (dayIdx: number, rangeIdx: number, key: 'start' | 'end', value: string) => {
    const next = days.slice();
    const ranges = next[dayIdx].ranges.slice();
    ranges[rangeIdx] = { ...ranges[rangeIdx], [key]: value };
    next[dayIdx] = { ...next[dayIdx], ranges };
    emit(next);
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Disponibilidad</Typography>
      <Grid container spacing={1}>
        {days.map((d, idx) => (
          <Grid item xs={12} key={d.dayOfWeek}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Switch checked={d.enabled} onChange={() => toggleDay(idx)} />
              <Typography sx={{ width: 60 }}>{WEEK_DAYS[d.dayOfWeek]}</Typography>
              <Box sx={{ flex: 1 }}>
                {d.enabled ? (
                  <Stack spacing={1}>
                    {d.ranges.map((r, ri) => (
                      <Box key={ri} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          type="time"
                          label="Desde"
                          value={r.start}
                          onChange={(e) => setRange(idx, ri, 'start', e.target.value)}
                          size="small"
                        />
                        <TextField
                          type="time"
                          label="Hasta"
                          value={r.end}
                          onChange={(e) => setRange(idx, ri, 'end', e.target.value)}
                          size="small"
                        />
                        <IconButton size="small" color="error" onClick={() => removeRange(idx, ri)}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    <Button size="small" startIcon={<AddIcon />} onClick={() => addRange(idx)}>
                      Agregar rango
                    </Button>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">Cerrado</Typography>
                )}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
