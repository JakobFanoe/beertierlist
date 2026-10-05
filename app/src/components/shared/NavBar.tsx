import React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../AuthContext';
import { tierlistItemsQueryOptions } from '../../services/useTierlistItems';
import { wheelOptionsQueryOptions } from '../../services/useWheelOptions';

export default function NavBar() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const prefetchTierlist = () => {
    void queryClient.prefetchQuery(tierlistItemsQueryOptions());
  };
  const prefetchWheel = () => {
    void queryClient.prefetchQuery(wheelOptionsQueryOptions());
  };

  return (
    <AppBar position="static" color="default" sx={{ mb: 2 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Beer Tierlist
        </Typography>

        <Button
          color="inherit"
          component={Link}
          to="/"
          onMouseEnter={prefetchTierlist}
          onFocus={prefetchTierlist}
        >
          Tierlist
        </Button>

        <Button
          color="inherit"
          component={Link}
          to="/wheel"
          onMouseEnter={prefetchWheel}
          onFocus={prefetchWheel}
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
