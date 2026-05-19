import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Stack,
  Card,
  CardMedia,
  CardContent,
  Snackbar,
  Alert,
} from '@mui/material';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { uploadImage, listenToItems, updateItemTier } from '../services/tierlistService';

type Tier = {
  label: string;
  color: string;
};

export const tiers: Tier[] = [
  { label: 'S', color: '#e88484' },
  { label: 'A', color: '#e7b67c' },
  { label: 'B', color: '#e8d57e' },
  { label: 'C', color: '#e6e77d' },
  { label: 'D', color: '#b8e57a' },
];

export function TierControls() {
  return (
    <Box
      sx={{
        width: 72,
        bgcolor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        borderLeft: '1px solid #111',
      }}
    >
      <IconButton sx={{ color: '#fff' }}>
        <SettingsIcon sx={{ fontSize: 34 }} />
      </IconButton>

      <Stack spacing={0}>
        <IconButton sx={{ color: '#fff', p: 0.5 }}>
          <KeyboardArrowUpIcon sx={{ fontSize: 34 }} />
        </IconButton>

        <IconButton sx={{ color: '#fff', p: 0.5 }}>
          <KeyboardArrowDownIcon sx={{ fontSize: 34 }} />
        </IconButton>
      </Stack>
    </Box>
  );
}

type Item = {
  id: string;
  filename: string;
  downloadUrl: string;
  tier: string | null;
  order?: number | null;
};

function ItemCard({ item }: { item: Item }) {
  return (
    <Card sx={{ width: 120, mr: 1, mb: 1 }}>
      <CardMedia component="img" height="80" image={item.downloadUrl} alt={item.filename} />
      <CardContent sx={{ py: 0.5 }}>
        <Typography variant="caption" noWrap>
          {item.filename}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function TierlistPage() {
  const [lists, setLists] = useState<Record<string, Item[]>>({
    tray: [],
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
  });

  useEffect(() => {
    // subscribe to firestore
    const unsub = listenToItems((items) => {
      const grouped: Record<string, Item[]> = { tray: [], S: [], A: [], B: [], C: [], D: [] };
      // sort by order if present, otherwise by createdAt
      items.sort((a: any, b: any) => {
        const oa = a.order ?? Number.MAX_SAFE_INTEGER;
        const ob = b.order ?? Number.MAX_SAFE_INTEGER;
        if (oa !== ob) return oa - ob;
        const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return ta.getTime() - tb.getTime();
      });
      items.forEach((it: any) => {
        const item: Item = { id: it.id, filename: it.filename, downloadUrl: it.downloadUrl, tier: it.tier, order: it.order };
        if (!item.tier) grouped.tray.push(item);
        else if (grouped[item.tier]) grouped[item.tier].push(item);
        else grouped.tray.push(item);
      });
      setLists(grouped);
    });

    return () => unsub();
  }, []);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadImage(file);
      }
    } catch (err: any) {
      console.error('Upload failed', err);
      setUploadError(err?.message || String(err));
    } finally {
      // clear input
      e.currentTarget.value = '';
      setUploading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const srcId = source.droppableId;
    const destId = destination.droppableId;
    if (srcId === destId && source.index === destination.index) return;

    const srcList = Array.from(lists[srcId]);
    const [moved] = srcList.splice(source.index, 1);
    const destList = Array.from(lists[destId]);
    destList.splice(destination.index, 0, moved);

    const newLists = { ...lists, [srcId]: srcList, [destId]: destList };
    setLists(newLists);

    // Persist order for destination list
    for (let i = 0; i < destList.length; i++) {
      const it = destList[i];
      await updateItemTier(it.id, destId === 'tray' ? null : destId, i);
    }

    // Update source list order (if different)
    if (srcId !== destId) {
      for (let i = 0; i < srcList.length; i++) {
        const it = srcList[i];
        await updateItemTier(it.id, srcId === 'tray' ? null : srcId, i);
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#221f21', px: 4, py: 8, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 1600 }}>
        <Paper elevation={0} sx={{ overflow: 'hidden', bgcolor: 'transparent', border: '1px solid #000', p: 2 }}>
          <DragDropContext onDragEnd={onDragEnd}>
            {/* Tiers */}
            {tiers.map((tier) => (
              <Box key={tier.label} sx={{ display: 'flex', height: 140, borderBottom: '1px solid #000', mb: 1 }}>
                <Box sx={{ width: 140, bgcolor: tier.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 38, fontWeight: 500, color: '#222', userSelect: 'none' }}>{tier.label}</Typography>
                </Box>

                <Droppable droppableId={tier.label} direction="horizontal">
                  {(provided) => (
                    <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ flex: 1, bgcolor: '#11110f', p: 1, display: 'flex', alignItems: 'center', minHeight: 120, overflowX: 'auto' }}>
                      {lists[tier.label]?.map((it, idx) => (
                        <Draggable key={it.id} draggableId={it.id} index={idx}>
                          {(p) => (
                            <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                              <ItemCard item={it} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>

                <TierControls />
              </Box>
            ))}

            {/* Upload tray */}
            <Box sx={{ mt: 4 }}>
              <Typography sx={{ fontSize: 18, color: '#ddd', fontWeight: 700, mb: 2 }}>Upload images</Typography>

              <Paper variant="outlined" sx={{ bgcolor: '#1f1c1c', borderColor: '#555', height: 100, px: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="contained" component="label" startIcon={<UploadFileIcon />} disabled={uploading} sx={{ bgcolor: '#fff', color: '#000', boxShadow: 'none', '&:hover': { bgcolor: '#eee', boxShadow: 'none' } }}>
                  {uploading ? 'Uploading...' : 'Choose files'}
                  <input hidden multiple type="file" onChange={onFileChange} />
                </Button>

                <Droppable droppableId="tray" direction="horizontal">
                  {(provided) => (
                    <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ display: 'flex', alignItems: 'center', overflowX: 'auto', p: 1 }}>
                      {lists.tray.map((it, idx) => (
                        <Draggable key={it.id} draggableId={it.id} index={idx}>
                          {(p) => (
                            <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                              <ItemCard item={it} />
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Box>
          </DragDropContext>
        </Paper>
      </Box>
      <Snackbar open={!!uploadError} autoHideDuration={6000} onClose={() => setUploadError(null)}>
        <Alert severity="error" onClose={() => setUploadError(null)} sx={{ width: '100%' }}>
          {uploadError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
