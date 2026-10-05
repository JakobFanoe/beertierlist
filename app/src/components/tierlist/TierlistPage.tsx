import { Alert, Box, CircularProgress, LinearProgress, Paper, Typography } from '@mui/material';
import { DragDropContext } from '@hello-pangea/dnd';
import TierRow from './TierRow';
import UploadTray from './UploadTray';
import useTierlistData from './useTierlistData';
import useTierlistDragDrop from './useTierlistDragDrop';
import useTierlistLayout from './useTierlistLayout';
import { TIERS } from './tierlistUtils';

export default function TierlistPage() {
  const { lists, isLoading, isFetching, error: loadError } = useTierlistData();
  const { containerRef, perRow } = useTierlistLayout();
  const { onDragEnd, error: updateError } = useTierlistDragDrop(lists, perRow);

  if (isLoading) {
    return (
      <Box
        role="status"
        aria-live="polite"
        sx={{
          minHeight: '100vh',
          bgcolor: '#221f21',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress aria-label="Loading tierlist" />
        <Typography>Loading tierlist...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#221f21',
        px: 4,
        py: 8,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1600 }}>
        {isFetching && <LinearProgress aria-label="Refreshing tierlist" />}
        {loadError instanceof Error && <Alert severity="error">{loadError.message}</Alert>}
        {updateError instanceof Error && <Alert severity="error">{updateError.message}</Alert>}
        <Box ref={containerRef}>
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              bgcolor: 'transparent',
              border: '1px solid #000',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              {TIERS.map((tier) => (
                <TierRow
                  key={tier.label}
                  tier={tier}
                  items={lists[tier.label]}
                  perRow={perRow}
                />
              ))}
              <UploadTray items={lists.tray} perRow={perRow} />
            </DragDropContext>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
