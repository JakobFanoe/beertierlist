import React, { useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import ImportOptionsModal from './ImportOptionsModal';
import OptionManager from './OptionManager';
import WheelCanvas from './WheelCanvas';
import WinnerModal from './WinnerModal';
import useSpinWheel from './useSpinWheel';

export default function SpinWheelPage() {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const {
    addOption,
    canvasRef,
    currentWinner,
    currentWinnerColor,
    entries,
    error,
    filteredEntries,
    history,
    importOptions,
    isFetching,
    isLoading,
    removeOption,
    removeWinner,
    setError,
    setSearchQuery,
    setWinnerModalOpen,
    spin,
    spinning,
    winnerModalOpen,
  } = useSpinWheel();

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: 3,
          py: 4,
        }}
      >
        <Typography variant="h5" fontWeight={500} mb={4} alignSelf="flex-start">
          Spin Wheel
        </Typography>
        <Box sx={{ width: '100%', maxWidth: 1100 }}>
          {isFetching && !isLoading && <LinearProgress aria-label="Refreshing wheel options" />}
          {isLoading ? (
            <Box
              role="status"
              aria-live="polite"
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}
            >
              <CircularProgress aria-label="Loading wheel options" />
              <Typography>Loading wheel options...</Typography>
            </Box>
          ) : (
            <Stack
              direction="row"
              spacing={5}
              alignItems="flex-start"
              justifyContent="center"
              sx={{ width: '100%' }}
              flexWrap="wrap"
            >
              <WheelCanvas
                canvasRef={canvasRef}
                entries={entries}
                spinning={spinning}
                onSpin={spin}
              />
              <OptionManager
                entries={filteredEntries}
                history={history}
                onSearchChange={setSearchQuery}
                onAddOption={addOption}
                onRemoveOption={removeOption}
                onOpenImport={() => setImportModalOpen(true)}
              />
            </Stack>
          )}
        </Box>
      </Box>
      <ImportOptionsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={importOptions}
      />
      <WinnerModal
        open={winnerModalOpen}
        winner={currentWinner}
        winnerColor={currentWinnerColor}
        onClose={() => setWinnerModalOpen(false)}
        onRemove={removeWinner}
      />
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
