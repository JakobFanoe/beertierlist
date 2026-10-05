import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TierlistEntry } from './api/generatedClient';
import { getItems, TierlistRecord, updateManyItemTiers, uploadImage } from './tierlistService';

export const TIERLIST_ITEMS_QUERY_KEY = ['tierlist', 'entries'];

export const tierlistItemsQueryOptions = () => ({
  queryKey: TIERLIST_ITEMS_QUERY_KEY,
  queryFn: getItems,
  staleTime: 30_000,
});

export function useTierlistItems() {
  return useQuery(tierlistItemsQueryOptions());
}

export function useUploadTierlistImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TIERLIST_ITEMS_QUERY_KEY }),
  });
}

export function useUpdateTierlistItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: string; tier: string | null; order: number }[]) => {
      const items = queryClient.getQueryData<TierlistRecord[]>(TIERLIST_ITEMS_QUERY_KEY);
      if (!items) throw new Error('Tierlist entries are not loaded.');

      const itemsById = new Map(items.map((item) => [item.id, item]));
      const domainUpdates = updates.map((update) => {
        const item = itemsById.get(update.id);
        if (!item) throw new Error(`Tierlist entry ${update.id} is not loaded.`);

        return new TierlistEntry({
          ...item.entry,
          tierId: update.tier ?? undefined,
          position: update.order,
        });
      });

      return updateManyItemTiers(domainUpdates);
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: TIERLIST_ITEMS_QUERY_KEY });
      const previousItems = queryClient.getQueryData<TierlistRecord[]>(TIERLIST_ITEMS_QUERY_KEY);
      if (previousItems) {
        const updatesById = new Map(updates.map((update) => [update.id, update]));
        queryClient.setQueryData<TierlistRecord[]>(
          TIERLIST_ITEMS_QUERY_KEY,
          previousItems.map((item) => {
            const update = updatesById.get(item.id);
            return update ? { ...item, tier: update.tier, order: update.order } : item;
          }),
        );
      }
      return { previousItems };
    },
    onError: (_error, _updates, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(TIERLIST_ITEMS_QUERY_KEY, context.previousItems);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: TIERLIST_ITEMS_QUERY_KEY }),
  });
}
