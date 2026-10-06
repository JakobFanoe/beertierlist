import React from 'react';
import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

export default function NavBar() {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ width: '100%', maxWidth: 1680, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" sx={{ flexGrow: 1, color: 'primary.main' }}>
          Beer Tierlist
        </Typography>

        <Button
          color="inherit"
          component={Link}
          to="/"
          aria-current={location.pathname === '/' ? 'page' : undefined}
          sx={location.pathname === '/' ? { color: 'primary.main' } : undefined}
        >
          Tierlist
        </Button>

        <Button
          color="inherit"
          component={Link}
          to="/wheel"
          aria-current={location.pathname === '/wheel' ? 'page' : undefined}
          sx={location.pathname === '/wheel' ? { color: 'primary.main' } : undefined}
        >
          Spin Wheel
        </Button>

        <Button color="inherit" onClick={() => logout()}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
