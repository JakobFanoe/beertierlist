import React from 'react';
import {
  Backdrop,
  Box,
  Button,
  Fade,
  Modal,
  Stack,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface WinnerModalProps {
  open: boolean;
  winner: string;
  winnerColor: string;
  onClose: () => void;
  onRemove: () => void;
}

export default function WinnerModal({
  open,
  winner,
  winnerColor,
  onClose,
  onRemove,
}: WinnerModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
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
            textAlign: 'center',
            minWidth: 280,
            outline: 'none',
          }}
        >
          <Typography fontSize={48} lineHeight={1} mb={1}>
            🎉
          </Typography>
          <Typography variant="h6" fontWeight={500} mb={1}>
            We have a winner!
          </Typography>
          <Box
            sx={{
              bgcolor: winnerColor,
              color: '#fff',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              my: 2,
              display: 'inline-block',
              fontSize: 22,
              fontWeight: 500,
              wordBreak: 'break-word',
              maxWidth: 320,
            }}
          >
            {winner}
          </Box>
          <Stack direction="row" spacing={1.5} justifyContent="center" mt={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={onRemove}
              startIcon={<DeleteIcon fontSize="small" />}
            >
              Remove winner
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={onClose}
              sx={{ bgcolor: '#3369e8', '&:hover': { bgcolor: '#2557d6' } }}
            >
              Done
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
}
