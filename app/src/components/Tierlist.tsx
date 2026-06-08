import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, Paper, Card, CardMedia, Snackbar, Alert } from '@mui/material';

import UploadFileIcon from '@mui/icons-material/UploadFile';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  uploadImage,
  listenToItems,
  updateItemTier,
  updateManyItemTiers,
} from '../services/tierlistService';

type Tier = {
  label: string;
  color: string;
};

// Deterministic color assignment for tiers
function getTierColor(label: string): string {
  // Assign colors based on label, deterministic and consistent
  const colorMap: Record<string, string> = {
    S: '#e88484',
    A: '#e7b67c',
    B: '#e8d57e',
    C: '#e6e77d',
    D: '#b8e57a',
    E: '#8ce57c',
  };
  return colorMap[label] || '#cccccc';
}

export const tiers: Tier[] = [
  { label: 'S', color: getTierColor('S') },
  { label: 'A', color: getTierColor('A') },
  { label: 'B', color: getTierColor('B') },
  { label: 'C', color: getTierColor('C') },
  { label: 'D', color: getTierColor('D') },
  { label: 'E', color: getTierColor('E') },
];

type Item = {
  id: string;
  filename: string;
  downloadUrl: string;
  tier: string | null;
  order?: number | null;
};

// Helper: chunk array into rows of N
function chunkItems(items: Item[], perRow: number): Item[][] {
  const rows: Item[][] = [];
  for (let i = 0; i < items.length; i += perRow) {
    rows.push(items.slice(i, i + perRow));
  }
  if (rows.length === 0) rows.push([]); // always at least one empty row
  return rows;
}

const ITEM_SIZE = 128; // px including gap
const TIER_LABEL_WIDTH = 140;

function ItemCard({ item }: { item: Item }) {
  return (
    <Card sx={{ height: 120, width: 120, mr: 1, mb: 1 }}>
      <CardMedia
        component="img"
        width="120"
        height="120"
        image={item.downloadUrl}
        alt={item.filename}
      />
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
    E: [],
  });

  useEffect(() => {
    // subscribe to firestore
    const unsub = listenToItems((items) => {
      const grouped: Record<string, Item[]> = { tray: [], S: [], A: [], B: [], C: [], D: [], E: [] };
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
        const item: Item = {
          id: it.id,
          filename: it.filename,
          downloadUrl: it.downloadUrl,
          tier: it.tier,
          order: it.order,
        };
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
  const input = e.currentTarget; // ← capture before any await
  const files = input.files;
  if (!files) return;
  setUploading(true);
  try {
    for (let i = 0; i < files.length; i++) {
      await uploadImage(files[i]);
    }
  } catch (err: any) {
    console.error('Upload failed', err);
    setUploadError(err?.message || String(err));
  } finally {
    input.value = ''; // ← use the captured ref, not e.currentTarget
    setUploading(false);
  }
};

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const getPerRow = () => Math.max(1, Math.floor((containerWidth - TIER_LABEL_WIDTH) / ITEM_SIZE));

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    // Parse "TIER:ROW" ids
    const parseTierId = (id: string) => {
      const [tier, row] = id.split(':');
      return { tier, row: row !== undefined ? parseInt(row) : undefined };
    };

    const src = parseTierId(source.droppableId);
    const dest = parseTierId(destination.droppableId);

    const srcTier = src.tier; // e.g. "S" or "tray"
    const destTier = dest.tier;

    // Rebuild flat list for source tier from its current rows
    const perRow = getPerRow(); // see below
    const srcRows = chunkItems(lists[srcTier], perRow);
    const destRows = srcTier === destTier ? srcRows : chunkItems(lists[destTier], perRow);

    // Find global index
    const srcGlobalIdx = src.row! * perRow + source.index;
    const destGlobalIdx = dest.row! * perRow + destination.index;

    const srcFlat = lists[srcTier].slice();
    const [moved] = srcFlat.splice(srcGlobalIdx, 1);

    let destFlat: Item[];
    if (srcTier === destTier) {
      destFlat = srcFlat;
    } else {
      destFlat = lists[destTier].slice();
    }
    destFlat.splice(destGlobalIdx, 0, moved);

    setLists({
      ...lists,
      [srcTier]: srcTier === destTier ? destFlat : srcFlat,
      [destTier]: destFlat,
    });

    const updates = [
      ...destFlat.map((it, i) => ({
        id: it.id,
        tier: destTier === 'tray' ? null : destTier,
        order: i,
      })),
      ...(srcTier !== destTier
        ? srcFlat.map((it, i) => ({
            id: it.id,
            tier: srcTier === 'tray' ? null : srcTier,
            order: i,
          }))
        : []),
    ];
    await updateManyItemTiers(updates);
  };
   return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#221f21', px: 4, py: 8, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 1600 }}>
        
        {/* containerRef goes here, on the outer width-measuring box */}
        <Box ref={containerRef}>
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              bgcolor: 'transparent',
              border: '1px solid #000',
              p: 2,
              display: 'flex',        // ← ADD
              flexDirection: 'column', // ← ADD: tiers stack vertically
            }}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              {/* Tiers */}
              {tiers.map((tier) => {
                const perRow = getPerRow();
                const rows = chunkItems(lists[tier.label], perRow);
                const displayRows = rows.length > 0 ? rows : [[]];
                if (displayRows[displayRows.length - 1].length >= perRow) {
                  displayRows.push([]);
                }

                return (
                  <Box
                    key={tier.label}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row', // ← label + content side by side
                      borderBottom: '1px solid #000',
                      mb: 1,
                    }}
                  >
                    {/* Tier label */}
                    <Box
                      sx={{
                        width: TIER_LABEL_WIDTH,
                        minHeight: 132,
                        bgcolor: tier.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography sx={{ fontSize: 38, fontWeight: 500, color: '#222', userSelect: 'none' }}>
                        {tier.label}
                      </Typography>
                    </Box>

                    {/* Rows stacked vertically inside the tier */}
                    <Box sx={{ flex: 1, bgcolor: '#11110f', display: 'flex', flexDirection: 'column' }}>
                      {displayRows.map((rowItems, rowIdx) => (
                        <Droppable key={rowIdx} droppableId={`${tier.label}:${rowIdx}`} direction="horizontal">
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              sx={{
                                display: 'flex',
                                flexDirection: 'row', // ← items go left to right
                                alignItems: 'flex-start',
                                minHeight: 132,
                                p: '4px',
                              }}
                            >
                              {rowItems.map((it, idx) => (
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
                      ))}
                    </Box>
                  </Box>
                );
              })}

              {/* Upload tray */}
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
                    flexDirection: 'column', // ← tray rows also stack vertically
                    gap: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    disabled={uploading}
                    sx={{
                      alignSelf: 'flex-start',
                      bgcolor: '#fff',
                      color: '#000',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#eee', boxShadow: 'none' },
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Choose files'}
                    <input hidden multiple type="file" onChange={onFileChange} />
                  </Button>

                  {/* Tray droppable rows */}
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {(() => {
                      const perRow = getPerRow();
                      const rows = chunkItems(lists.tray, perRow);
                      const displayRows = rows.length > 0 ? rows : [[]];
                      if (displayRows[displayRows.length - 1].length >= perRow) displayRows.push([]);

                      return displayRows.map((rowItems, rowIdx) => (
                        <Droppable key={rowIdx} droppableId={`tray:${rowIdx}`} direction="horizontal">
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              sx={{
                                display: 'flex',
                                flexDirection: 'row', // ← horizontal
                                alignItems: 'flex-start',
                                minHeight: 132,
                                p: '4px',
                              }}
                            >
                              {rowItems.map((it, idx) => (
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
                      ));
                    })()}
                  </Box>
                </Paper>
              </Box>
            </DragDropContext>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={!!uploadError} autoHideDuration={6000} onClose={() => setUploadError(null)}>
        <Alert severity="error" onClose={() => setUploadError(null)} sx={{ width: '100%' }}>
          {uploadError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
