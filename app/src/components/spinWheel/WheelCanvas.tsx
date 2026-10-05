import React from 'react';
import { Box, Button } from '@mui/material';
import { Option } from '../../services/wheelService';
import { CANVAS_SIZE } from './wheelDrawing';
import Pointer from './Pointer';

interface WheelCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  entries: Option[];
  spinning: boolean;
  onSpin: () => void;
}

export default function WheelCanvas({
  canvasRef,
  entries,
  spinning,
  onSpin,
}: WheelCanvasProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        flexShrink: 0,
      }}
    >
      <Box sx={{ position: 'relative', width: CANVAS_SIZE, height: CANVAS_SIZE }}>
        <Pointer />
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{
            borderRadius: '50%',
            display: 'block',
            cursor: spinning ? 'default' : 'pointer',
          }}
          onClick={onSpin}
        />
      </Box>
      <Button
        variant="contained"
        size="large"
        disabled={spinning || entries.length < 2}
        onClick={onSpin}
        sx={{
          borderRadius: 8,
          px: 6,
          py: 1.5,
          bgcolor: '#3369e8',
          '&:hover': { bgcolor: '#2557d6' },
          '&:disabled': { bgcolor: '#bdbdbd' },
          fontSize: 18,
          fontWeight: 500,
          textTransform: 'none',
        }}
      >
        {spinning ? 'Spinning…' : 'Spin'}
      </Button>
    </Box>
  );
}
