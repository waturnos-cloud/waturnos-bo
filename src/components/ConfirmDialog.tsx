import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { Warning as WarningIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'warning' | 'info' | 'success' | 'error';
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  severity = 'warning',
  loading = false,
}: Props) {
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />;
      case 'error':
        return <WarningIcon sx={{ fontSize: 48, color: 'error.main' }} />;
      case 'info':
        return <CheckCircleIcon sx={{ fontSize: 48, color: 'info.main' }} />;
      default:
        return <WarningIcon sx={{ fontSize: 48, color: 'warning.main' }} />;
    }
  };

  const getColor = () => {
    switch (severity) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'warning';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getIcon()}
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mt: 1 }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={getColor()}
          disabled={loading}
          autoFocus
        >
          {loading ? 'Procesando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
