import React from 'react';
import { Box, Paper } from '@mui/material';
import { TierRow, tiers, UploadSection } from './components/Tierlist';

export default function App() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#221f21",
        px: 4,
        py: 8,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1600 }}>
        {/* Tier List */}
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            bgcolor: "transparent",
            border: "1px solid #000",
          }}
        >
          {tiers.map((tier) => (
            <TierRow key={tier.label} tier={tier} />
          ))}
        </Paper>

        {/* Upload */}
        <UploadSection />
      </Box>
    </Box>
  );
}