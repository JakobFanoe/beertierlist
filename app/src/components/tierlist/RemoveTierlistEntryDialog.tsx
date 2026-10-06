import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { TierItem } from './tierlistTypes';

interface RemoveTierlistEntryDialogProps {
  item: TierItem | null;
  error: unknown;
  isRemoving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function RemoveTierlistEntryDialog({
  item,
  error,
  isRemoving,
  onCancel,
  onConfirm,
}: RemoveTierlistEntryDialogProps) {
  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : String(error)
    : null;

  return (
    <Dialog
      open={Boolean(item)}
      onClose={onCancel}
      aria-labelledby="remove-entry-title"
    >
      <DialogTitle id="remove-entry-title">Remove tier-list entry?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Permanently remove {item?.filename}? This action cannot be undone.
        </DialogContentText>
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isRemoving} autoFocus>
          Cancel
        </Button>
        <Button color="error" onClick={onConfirm} disabled={isRemoving}>
          {isRemoving ? 'Removing...' : 'Remove'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
