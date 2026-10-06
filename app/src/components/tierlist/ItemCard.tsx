import React, { useState } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Button,
  Card,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useRemoveTierlistItem } from '../../services/useTierlistItems';
import { TierItem } from './tierlistTypes';

interface ItemCardProps {
  item: TierItem;
}

export default function ItemCard({ item }: ItemCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const removeMutation = useRemoveTierlistItem();

  const openConfirmation = () => {
    removeMutation.reset();
    setConfirmOpen(true);
  };

  const closeConfirmation = () => {
    if (!removeMutation.isPending) setConfirmOpen(false);
  };

  return (
    <>
      <Card sx={{ height: 120, width: 120, mr: 1, mb: 1, position: 'relative' }}>
        <CardMedia
          component="img"
          width="120"
          height="120"
          image={item.downloadUrl}
          alt={item.filename}
        />
        <Tooltip title={`Remove ${item.filename}`}>
          <IconButton
            aria-label={`Remove ${item.filename}`}
            onClick={(event) => {
              event.stopPropagation();
              openConfirmation();
            }}
            onMouseDown={(event) => event.stopPropagation()}
            size="small"
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Card>
      <Dialog
        open={confirmOpen}
        onClose={closeConfirmation}
        aria-labelledby={`remove-entry-title-${item.id}`}
      >
        <DialogTitle id={`remove-entry-title-${item.id}`}>Remove tier-list entry?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Permanently remove {item.filename}? This action cannot be undone.
          </DialogContentText>
          {removeMutation.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {removeMutation.error instanceof Error
                ? removeMutation.error.message
                : String(removeMutation.error)}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmation} disabled={removeMutation.isPending} autoFocus>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={() =>
              removeMutation.mutate(item.id, { onSuccess: () => setConfirmOpen(false) })
            }
            disabled={removeMutation.isPending}
          >
            {removeMutation.isPending ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
