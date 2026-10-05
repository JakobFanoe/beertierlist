import { useState } from 'react';
import { Backdrop, Box, Button, Fade, Modal, Stack, TextField, Typography } from '@mui/material';

interface ImportOptionsModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (names: string[]) => Promise<boolean>;
}

export default function ImportOptionsModal({
  open,
  onClose,
  onImport,
}: ImportOptionsModalProps) {
  const [importText, setImportText] = useState('');
  const names = importText.split(',').map((name) => name.trim()).filter(Boolean);

  const handleClose = () => {
    onClose();
    setImportText('');
  };

  const handleImport = async () => {
    if (await onImport(names)) handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 250 } }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
            p: 4,
            minWidth: 400,
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h6" fontWeight={500}>
            Import options
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Paste a comma-separated list of names. Duplicates are allowed.
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            autoFocus
            placeholder="Alice, Bob, Charlie, Dana"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
          />
          <Typography variant="caption" color="text.secondary">
            {names.length} entries detected
          </Typography>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" size="small" onClick={handleClose} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              disabled={!importText.trim()}
              onClick={() => void handleImport()}
              sx={{
                bgcolor: '#3369e8',
                '&:hover': { bgcolor: '#2557d6' },
                textTransform: 'none',
              }}
            >
              Import
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
}
