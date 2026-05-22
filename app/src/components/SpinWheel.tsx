import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  Snackbar,
  Alert,
  TextField,
  Modal,
  Fade,
  Backdrop,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  createManyOptions,
  createOption,
  deleteOption,
  getOptions,
  Option,
} from '../services/wheelService';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = [
  '#e53935',
  '#8e24aa',
  '#3949ab',
  '#00897b',
  '#e65100',
  '#039be5',
  '#c0ca33',
  '#d81b60',
  '#1e88e5',
  '#43a047',
  '#fb8c00',
  '#6d4c41',
  '#546e7a',
  '#f4511e',
  '#7b1fa2',
  '#00acc1',
];

const CANVAS_SIZE = Math.min(window.innerWidth * 0.5, 600);
const RADIUS = CANVAS_SIZE / 2 - 4;
const CENTER = CANVAS_SIZE / 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function cryptoRandom(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / 4294967296;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

// ---------------------------------------------------------------------------
// Canvas drawing
// ---------------------------------------------------------------------------

function drawWheel(ctx: CanvasRenderingContext2D, entries: Option[], rotation: number): void {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  if (entries.length === 0) {
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9e9e9e';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Add names →', CENTER, CENTER);
    drawHub(ctx);
    return;
  }

  const n = entries.length;
  const slice = (Math.PI * 2) / n;
  const fontSize = n > 12 ? 11 : n > 8 ? 13 : 15;

  for (let i = 0; i < n; i++) {
    const start = rotation + i * slice;
    const end = start + slice;

    // Segment
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.arc(CENTER, CENTER, RADIUS, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    ctx.save();
    ctx.translate(CENTER, CENTER);
    ctx.rotate(start + slice / 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 3;
    ctx.font = `500 ${fontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(truncate(entries[i].name, 18), RADIUS - 10, 0);
    ctx.restore();
  }

  drawHub(ctx);
}

function drawHub(ctx: CanvasRenderingContext2D): void {
  // Outer ring
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 24, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner dot
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#bdbdbd';
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Pointer SVG
// ---------------------------------------------------------------------------

const Pointer: React.FC = () => (
  <Box
    sx={{
      position: 'absolute',
      top: -14,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
      lineHeight: 0,
    }}
  >
    <svg width="28" height="34" viewBox="0 0 28 34" xmlns="http://www.w3.org/2000/svg">
      <polygon points="14,34 0,0 28,0" fill="#e53935" />
    </svg>
  </Box>
);

// ---------------------------------------------------------------------------
// Winner Modal
// ---------------------------------------------------------------------------

interface WinnerModalProps {
  open: boolean;
  winner: string;
  winnerColor: string;
  onClose: () => void;
  onRemove: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({
  open,
  winner,
  winnerColor,
  onClose,
  onRemove,
}) => (
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SpinWheel() {
  // Data
  const [error, setError] = useState<string | null>(null);

  // Wheel state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  // Winner
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string>('');
  const [currentWinnerColor, setCurrentWinnerColor] = useState<string>('#3369e8');
  const [history, setHistory] = useState<string[]>([]);

  // Textarea for names
  const [entries, setEntries] = useState<Option[]>([]);

  // New option
  const [newOption, setNewOption] = useState<string | null>(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  // Options

  const fetchOptions = useCallback(async () => {
    try {
      const data = await getOptions();
      setEntries(data);
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }, []);

  // Add handler:
  const handleMassImport = useCallback(async () => {
    const names = importText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    try {
      await createManyOptions(names);
      await fetchOptions();
      setImportText('');
      setImportModalOpen(false);
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }, [importText, fetchOptions]);

  useEffect(() => {
    const init = async () => {
      await fetchOptions();
    };
    init();
  }, []);

  // Draw whenever entries change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawWheel(ctx, entries, angleRef.current);
  }, [entries]);

  // Spin
  const spin = useCallback(() => {
    if (spinning || entries.length < 2) return;

    const n = entries.length;
    const targetIdx = Math.floor(cryptoRandom() * n);
    const slice = (Math.PI * 2) / n;

    const fullSpins = 5 + Math.floor(cryptoRandom() * 4);
    // We want the pointer (at top = -π/2) to land in the middle of targetIdx's segment
    const targetSegmentMid = targetIdx * slice + slice / 2;
    const targetAngle =
      fullSpins * Math.PI * 2 +
      (Math.PI * 2 - targetSegmentMid) -
      (angleRef.current % (Math.PI * 2)) -
      Math.PI / 2;

    const duration = 4000 + cryptoRandom() * 1500;
    const startAngle = angleRef.current;
    const startTime = performance.now();

    setSpinning(true);

    const frame = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = easeOut(t);
      angleRef.current = startAngle + targetAngle * ease;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) drawWheel(ctx, entries, angleRef.current);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setSpinning(false);
        const winner = entries[targetIdx];
        const color = COLORS[targetIdx % COLORS.length];
        setCurrentWinner(winner.name);
        setCurrentWinnerColor(color);
        setHistory((prev) => [winner.name, ...prev].slice(0, 10));
        setWinnerModalOpen(true);
      }
    };

    rafRef.current = requestAnimationFrame(frame);
  }, [spinning, entries]);

  // Cleanup RAF on unmount
  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const handleCreateOption = useCallback(async () => {
    if (!newOption) return;

    try {
      await createOption(newOption);
      await fetchOptions();
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }, [fetchOptions, newOption]);

  const handleRemoveOption = useCallback(
    async (id: string) => {
      try {
        await deleteOption(id);
        await fetchOptions();
      } catch (err: any) {
        setError(err?.message || String(err));
      }
    },
    [fetchOptions],
  );

  // Remove current winner from list
  const removeWinner = useCallback(() => {
    if (!currentWinner) return;
    angleRef.current = 0;
    setWinnerModalOpen(false);
    handleRemoveOption(currentWinner);
  }, [handleRemoveOption, currentWinner]);

  return (
    <>
      <Box sx={{ px: 3, py: 3 }} alignSelf="center">
        <Typography variant="h5" fontWeight={500} mb={3}>
          Spin Wheel
        </Typography>
        <Stack
          direction="row"
          spacing={4}
          alignItems="center"
          alignContent="center"
          flexWrap="wrap"
        >
          {/* Wheel */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
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
                onClick={spin}
              />
            </Box>

            <Button
              variant="contained"
              size="large"
              disabled={spinning || entries.length < 2}
              onClick={spin}
              sx={{
                borderRadius: 8,
                px: 5,
                bgcolor: '#3369e8',
                '&:hover': { bgcolor: '#2557d6' },
                '&:disabled': { bgcolor: '#bdbdbd' },
                fontSize: 16,
                fontWeight: 500,
                textTransform: 'none',
              }}
            >
              {spinning ? 'Spinning…' : 'Spin'}
            </Button>
          </Box>

          {/* Side panel */}
          <Box
            sx={{
              flex: 1,
              minWidth: 420,
              maxWidth: 420,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={500}>
              Names
            </Typography>

            <TextField
              disabled={true}
              multiline
              rows={10}
              fullWidth
              value={entries.map((e) => e.name).join('\n')}
              inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
            />

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <TextField
                fullWidth
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Remove or add option"
              />

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={async () => await handleCreateOption()}
                  sx={{ textTransform: 'none', fontSize: 12 }}
                >
                  Add
                </Button>
              </Stack>
              <Button
                disabled={!newOption}
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon fontSize="small" />}
                onClick={async () => await handleRemoveOption(newOption!)}
                sx={{ textTransform: 'none' }}
              >
                Remove
              </Button>

              {/* Mass import button */}
              <Button
                size="small"
                variant="outlined"
                onClick={() => setImportModalOpen(true)}
                sx={{ textTransform: 'none', fontSize: 12 }}
              >
                Import list
              </Button>
              {/* Mass import modal */}
              <Modal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{ backdrop: { timeout: 250 } }}
              >
                <Fade in={importModalOpen}>
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
                      onChange={(e) => setImportText(e.target.value)}
                      inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {importText.split(',').filter((s) => s.trim()).length} entries detected
                    </Typography>
                    <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setImportModalOpen(false);
                          setImportText('');
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        disabled={!importText.trim()}
                        onClick={handleMassImport}
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
            </Stack>

            {/* History */}
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
        </Stack>
      </Box>

      {/* Winner modal */}
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
