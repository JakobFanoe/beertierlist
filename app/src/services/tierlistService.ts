import {
  TierlistEntry,
  UpdateTierlistEntriesRequest,
} from './api/generatedClient';
import { apiClient } from './api/apiClient';

export interface TierlistRecord {
  id: string;
  filename: string;
  downloadUrl: string;
  tier: string | null;
  order?: number | null;
  entry: TierlistEntry;
}

export async function getItems(): Promise<TierlistRecord[]> {
  const entries = await apiClient.getEntries();
  return entries.map((entry) => ({
    id: entry.id,
    filename: entry.name,
    downloadUrl: entry.imageUri,
    tier: entry.tierId ?? null,
    order: entry.position ?? null,
    entry,
  }));
}

export async function uploadImage(file: File): Promise<void> {
  await apiClient.addEntry({ data: file, fileName: file.name });
}

export async function updateManyItemTiers(updates: TierlistEntry[]): Promise<void> {
  await apiClient.updateEntries(new UpdateTierlistEntriesRequest({ updates }));
}

export async function removeItem(id: string): Promise<void> {
  await apiClient.removeEntry(id);
}
