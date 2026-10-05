import React, { useState } from 'react';
import { Alert, Box, Button, Paper, Snackbar, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useUploadTierlistImage } from '../../services/useTierlistItems';
import { TierItem } from './tierlistTypes';
import TierItemRows from './TierItemRows';

interface UploadTrayProps {
  items: TierItem[];
  perRow: number;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function UploadTray({ items, perRow }: UploadTrayProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadMutation = useUploadTierlistImage();

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = input.files;
    if (!files) return;

    setUploadError(null);
    try {
      for (const file of Array.from(files)) {
        await uploadMutation.mutateAsync(file);
      }
    } catch (error) {
      console.error('Upload failed', error);
      setUploadError(getErrorMessage(error));
    } finally {
      input.value = '';
    }
  };

  return (
    <>
      <Box sx={{ mt: 4 }}>
        <Typography sx={{ fontSize: 18, color: '#ddd', fontWeight: 700, mb: 2 }}>
          Upload images
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            bgcolor: '#1f1c1c',
            borderColor: '#555',
            minHeight: 140,
            px: 2,
            py: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            disabled={uploadMutation.isPending}
            sx={{
              alignSelf: 'flex-start',
              bgcolor: '#fff',
              color: '#000',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#eee', boxShadow: 'none' },
            }}
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Choose files'}
            <input hidden multiple type="file" onChange={onFileChange} />
          </Button>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <TierItemRows tierId="tray" items={items} perRow={perRow} />
          </Box>
        </Paper>
      </Box>
      <Snackbar open={!!uploadError} autoHideDuration={6000} onClose={() => setUploadError(null)}>
        <Alert severity="error" onClose={() => setUploadError(null)} sx={{ width: '100%' }}>
          {uploadError}
        </Alert>
      </Snackbar>
    </>
  );
}
