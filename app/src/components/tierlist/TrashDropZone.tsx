import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box, Paper, Typography } from '@mui/material';
import { Droppable } from '@hello-pangea/dnd';

export default function TrashDropZone() {
  return (
    <Droppable droppableId="trash">
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.droppableProps}
          variant="outlined"
          role="region"
          aria-label="Trash"
          sx={{
            mt: 3,
            minHeight: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            borderStyle: 'dashed',
            borderColor: snapshot.isDraggingOver ? 'error.main' : 'divider',
            bgcolor: snapshot.isDraggingOver ? 'rgba(244, 67, 54, 0.14)' : 'background.default',
            color: snapshot.isDraggingOver ? 'error.light' : 'text.secondary',
            borderRadius: 2,
            transition: 'background-color 150ms ease, border-color 150ms ease',
          }}
        >
          <DeleteOutlineIcon fontSize="large" aria-hidden="true" />
          <Box>
            <Typography fontWeight={700}>Trash</Typography>
            <Typography variant="body2">
              Drop an image here to permanently remove it
            </Typography>
          </Box>
          {provided.placeholder}
        </Paper>
      )}
    </Droppable>
  );
}
