import { createEmptyTierLists, groupTierlistRecords } from './tierlistUtils';
import { useTierlistItems } from '../../services/useTierlistItems';

export default function useTierlistData() {
  const query = useTierlistItems();
  const lists = query.data ? groupTierlistRecords(query.data) : createEmptyTierLists();

  return {
    lists,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
}
