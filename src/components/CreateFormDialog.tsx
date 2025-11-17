/**
 * Componente reutilizable: Modal genérico para crear/editar elementos.
 * Evita duplicación en DashProviders, DashOrganizations, etc.
 */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';

export interface FormFieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'password';
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  helperText?: string;
}

export interface CreateFormDialogProps {
  open: boolean;
  title: string;
  fields: FormFieldConfig[];
  formData: { [key: string]: any };
  onFieldChange: (name: string, value: any) => void;
  onSubmit: () => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  children?: React.ReactNode; // slot para campos adicionales
}

export function CreateFormDialog({
  open,
  title,
  fields,
  formData,
  onFieldChange,
  onSubmit,
  onCancel,
  loading = false,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  children,
}: CreateFormDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={600}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {fields.map((field) => (
            <TextField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type || 'text'}
              fullWidth
              value={formData[field.name] || ''}
              onChange={(e) => onFieldChange(field.name, e.target.value)}
              multiline={field.multiline}
              rows={field.rows}
              required={field.required}
              placeholder={field.placeholder}
              disabled={field.disabled}
              helperText={field.helperText}
              margin="normal"
            />
          ))}
          {children}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} color="inherit" disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          {loading ? 'Guardando...' : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
