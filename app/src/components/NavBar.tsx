import React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function NavBar() {
  const { logout } = useAuth();

  return (
    <AppBar position="static" color="default" sx={{ mb: 2 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Beer Tierlist
        </Typography>

        <Button color="inherit" component={Link} to="/">
          Tierlist
        </Button>

        <Button color="inherit" component={Link} to="/wheel">
          Spin Wheel
        </Button>

        <Button color="inherit" onClick={() => logout()}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
