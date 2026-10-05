import { useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { useUpdateTierlistItems } from '../../services/useTierlistItems';
import { TierLists } from './tierlistTypes';

interface DropLocation {
  tier: string;
  row: number;
}

function parseDropLocation(id: string): DropLocation {
  const [tier, row] = id.split(':');
  return { tier, row: Number.parseInt(row, 10) || 0 };
}

export default function useTierlistDragDrop(lists: TierLists, perRow: number) {
  const updateItems = useUpdateTierlistItems();

  const onDragEnd = useCallback(
    ({ source, destination }: DropResult) => {
      if (!destination) return;

      const sourceLocation = parseDropLocation(source.droppableId);
      const destinationLocation = parseDropLocation(destination.droppableId);
      const sourceTier = sourceLocation.tier;
      const destinationTier = destinationLocation.tier;
      const sourceFlat = lists[sourceTier].slice();
      const sourceIndex = sourceLocation.row * perRow + source.index;
      const destinationIndex = destinationLocation.row * perRow + destination.index;
      const [moved] = sourceFlat.splice(sourceIndex, 1);
      if (!moved) return;

      const destinationFlat =
        sourceTier === destinationTier ? sourceFlat : lists[destinationTier].slice();
      destinationFlat.splice(destinationIndex, 0, moved);

      const updates = [
        ...destinationFlat.map((item, order) => ({
          id: item.id,
          tier: destinationTier === 'tray' ? null : destinationTier,
          order,
        })),
        ...(sourceTier !== destinationTier
          ? sourceFlat.map((item, order) => ({
              id: item.id,
              tier: sourceTier === 'tray' ? null : sourceTier,
              order,
            }))
          : []),
      ];
      updateItems.mutate(updates);
    },
    [lists, perRow, updateItems],
  );

  return { onDragEnd, error: updateItems.error };
}
