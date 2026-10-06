import { useCallback, useState } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import {
  useRemoveTierlistItem,
  useUpdateTierlistItems,
} from '../../services/useTierlistItems';
import { TierItem, TierLists } from './tierlistTypes';

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
  const removeItem = useRemoveTierlistItem();
  const [itemToRemove, setItemToRemove] = useState<TierItem | null>(null);

  const onDragEnd = useCallback(
    ({ source, destination }: DropResult) => {
      if (!destination) return;

      const sourceLocation = parseDropLocation(source.droppableId);
      const sourceIndex = sourceLocation.row * perRow + source.index;
      if (destination.droppableId === 'trash') {
        const item = lists[sourceLocation.tier]?.[sourceIndex];
        if (item) {
          removeItem.reset();
          setItemToRemove(item);
        }
        return;
      }

      const destinationLocation = parseDropLocation(destination.droppableId);
      const sourceTier = sourceLocation.tier;
      const destinationTier = destinationLocation.tier;
      const sourceFlat = lists[sourceTier].slice();
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
    [lists, perRow, removeItem, updateItems],
  );

  const confirmRemove = useCallback(() => {
    if (!itemToRemove) return;
    removeItem.mutate(itemToRemove.id, {
      onSuccess: () => setItemToRemove(null),
    });
  }, [itemToRemove, removeItem]);

  const cancelRemove = useCallback(() => {
    if (!removeItem.isPending) setItemToRemove(null);
  }, [removeItem.isPending]);

  return {
    onDragEnd,
    error: updateItems.error,
    itemToRemove,
    confirmRemove,
    cancelRemove,
    removeError: removeItem.error,
    isRemoving: removeItem.isPending,
  };
}
