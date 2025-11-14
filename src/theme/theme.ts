
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3f51b5' },
    secondary: { main: '#00bcd4' },
    success: { main: '#43a047' },
    error: { main: '#e53935' }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 12 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 16 } } }
  }
});
