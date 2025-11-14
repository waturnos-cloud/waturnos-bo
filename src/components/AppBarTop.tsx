
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';

export default function AppBarTop() {
  return (
    <AppBar elevation={1} position="sticky" color="inherit">
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>WATurnos</Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton><NotificationsIcon /></IconButton>
        <IconButton><AccountCircle /></IconButton>
      </Toolbar>
    </AppBar>
  );
}
