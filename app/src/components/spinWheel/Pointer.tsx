import React from 'react';
import { Box } from '@mui/material';

export default function Pointer() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: -16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
        lineHeight: 0,
      }}
    >
      <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,40 0,0 32,0" fill="#e53935" />
      </svg>
    </Box>
  );
}
