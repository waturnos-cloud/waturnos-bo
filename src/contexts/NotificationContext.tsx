import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

type Notification = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning';
};

type Ctx = {
  notify: (message: string, severity?: Notification['severity']) => void;
};

const NotificationContext = createContext<Ctx>({ notify: () => {} });

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<Notification>({ open: false, message: '', severity: 'success' });

  const notify = (message: string, severity: Notification['severity'] = 'success') => {
    setState({ open: true, message, severity });
  };

  const handleClose = () => setState((s) => ({ ...s, open: false }));

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Snackbar open={state.open} autoHideDuration={3500} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleClose} severity={state.severity} variant="filled" sx={{ width: '100%', fontWeight: 600 }}>
          {state.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
