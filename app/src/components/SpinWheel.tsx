import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, TextField, Select, MenuItem, Paper, Typography, Stack, Snackbar, Alert } from '@mui/material';
import { listenOptionSets, createOptionSet, deleteOptionSet, OptionSet } from '../services/wheelService';

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  const d = [`M ${cx} ${cy}`, `L ${start.x} ${start.y}`, `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, 'Z'].join(' ');
  return d;
}

const COLORS = ['#f94144', '#f3722c', '#f9844a', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#277da1'];

export default function SpinWheel() {
  const [sets, setSets] = useState<OptionSet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newOptions, setNewOptions] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const wheelRef = useRef<SVGSVGElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = listenOptionSets((s) => {
      setSets(s as OptionSet[]);
      if (!selectedId && s.length) setSelectedId(s[0].id || null);
    });
    return () => unsub();
  }, []);

  const selected = sets.find((s) => s.id === selectedId) || (null as OptionSet | null);
  const options = selected?.options || [];

  const handleCreate = async () => {
    const opts = newOptions.split(',').map((s) => s.trim()).filter(Boolean);
    if (!newName || opts.length === 0) return;
    try {
      await createOptionSet(newName, opts);
      setNewName('');
      setNewOptions('');
    } catch (err: any) {
      console.error('Create option set failed', err);
      setError(err?.message || String(err));
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await deleteOptionSet(id);
      if (selectedId === id) setSelectedId(null);
    } catch (err: any) {
      console.error('Delete option set failed', err);
      setError(err?.message || String(err));
    }
  };

  const spin = () => {
    if (!options.length || spinning) return;
    const count = options.length;
    const targetIndex = Math.floor(Math.random() * count);
    const baseAngle = 360 / count;
    // We want the target segment to land at top (angle 0)
    const randomOffset = Math.random() * baseAngle; // randomize within segment
    const targetAngle = 360 * (3 + 1) + (360 - (targetIndex * baseAngle + randomOffset)); // 3 full rotations + align

    setSpinning(true);
    setResult(null);
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.33, 1, 0.68, 1)';
      wheelRef.current.style.transform = `rotate(${targetAngle}deg)`;
    }

    setTimeout(() => {
      setSpinning(false);
      setResult(options[targetIndex]);
    }, 4200);
  };

  // build segments
  const segments = options.map((opt, i) => {
    const count = options.length || 1;
    const start = (i * 360) / count;
    const end = ((i + 1) * 360) / count;
    const path = describeArc(150, 150, 140, start, end);
    const midAngle = (start + end) / 2;
    const labelPos = polarToCartesian(150, 150, 90, midAngle);
    return (
      <g key={i}>
        <path d={path} fill={COLORS[i % COLORS.length]} stroke="#222" />
        <text x={labelPos.x} y={labelPos.y} fontSize={12} fill="#111" textAnchor="middle" dominantBaseline="middle">
          {opt}
        </text>
      </g>
    );
  });

  return (
    <Box sx={{ px: 4, py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Spin Wheel</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Select value={selectedId || ''} onChange={(e) => setSelectedId(e.target.value as string)} sx={{ minWidth: 200 }}>
            {sets.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>

          <Button variant="outlined" color="error" onClick={() => handleDelete(selectedId || undefined)} disabled={!selectedId}>
            Delete set
          </Button>

          <Button variant="contained" onClick={spin} disabled={spinning || options.length === 0}>
            {spinning ? 'Spinning...' : 'Spin'}
          </Button>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Create new option set (comma separated)</Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <TextField label="Options" value={newOptions} onChange={(e) => setNewOptions(e.target.value)} placeholder="a, b, c" sx={{ minWidth: 300 }} />
            <Button variant="contained" onClick={handleCreate}>Create</Button>
          </Stack>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 4 }}>
        <Box>
          <svg width={300} height={300} viewBox="0 0 300 300">
            <g ref={wheelRef as any} style={{ transformOrigin: '150px 150px' }}>
              {segments}
            </g>
            {/* pointer */}
            <polygon points="150,5 140,25 160,25" fill="#111" />
          </svg>

          {result && (
            <Paper sx={{ mt: 2, p: 1 }}>
              <Typography>Result: {result}</Typography>
            </Paper>
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1">Option sets</Typography>
          <Box sx={{ mt: 1 }}>
            {sets.map((s) => (
              <Paper key={s.id} sx={{ p: 1, mb: 1 }}>
                <Typography variant="subtitle2">{s.name}</Typography>
                <Typography variant="body2">{(s.options || []).join(', ')}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
  );
}
