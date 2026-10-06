import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Option } from '../../services/wheelService';

interface OptionManagerProps {
  entries: Option[];
  history: string[];
  onSearchChange: (query: string) => void;
  onAddOption: (name: string) => Promise<void>;
  onRemoveOption: (name: string) => Promise<void>;
  onOpenImport: () => void;
}

export default function OptionManager({
  entries,
  history,
  onSearchChange,
  onAddOption,
  onRemoveOption,
  onOpenImport,
}: OptionManagerProps) {
  const [newOption, setNewOption] = useState('');

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: 340 },
        maxWidth: 400,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: { xs: 2, sm: 2.5 },
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="subtitle1" fontWeight={500}>
          Names
        </Typography>
        <TextField
          placeholder="Søg..."
          variant="outlined"
          size="small"
          fullWidth
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </Stack>
      <TextField
        disabled
        multiline
        rows={12}
        fullWidth
        value={entries.map((entry) => entry.name).join('\n')}
        inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
      />
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <TextField
          fullWidth
          value={newOption}
          onChange={(event) => setNewOption(event.target.value)}
          placeholder="Add or remove an option"
          size="small"
        />
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => void onAddOption(newOption)}
            sx={{ fontSize: 12 }}
          >
            Add
          </Button>
          <Button
            disabled={!newOption}
            variant="outlined"
            size="small"
            startIcon={<DeleteIcon fontSize="small" />}
            onClick={() => void onRemoveOption(newOption)}
          >
            Remove
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={onOpenImport}
            sx={{ fontSize: 12 }}
          >
            Import list
          </Button>
        </Stack>
      </Stack>
      {history.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Recent winners:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {history.join(', ')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
