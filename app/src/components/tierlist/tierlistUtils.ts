import { Tier, TierItem, TierLists } from './tierlistTypes';
import { TierlistRecord } from '../../services/tierlistService';

const TIER_COLORS: Record<string, string> = {
  S: '#e88484',
  A: '#e7b67c',
  B: '#e8d57e',
  C: '#e6e77d',
  D: '#b8e57a',
  E: '#8ce57c',
};

export const TIERS: Tier[] = Object.keys(TIER_COLORS).map((label) => ({
  label,
  color: TIER_COLORS[label],
}));

export const ITEM_SIZE = 128;
export const TIER_LABEL_WIDTH = 140;

export function createEmptyTierLists(): TierLists {
  return Object.fromEntries([['tray', []], ...TIERS.map(({ label }) => [label, []])]);
}

export function compareTierlistRecords(a: TierlistRecord, b: TierlistRecord): number {
  return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
}

export function groupTierlistRecords(records: TierlistRecord[]): TierLists {
  const grouped = createEmptyTierLists();

  records.slice().sort(compareTierlistRecords).forEach((record) => {
    const item: TierItem = {
      id: record.id,
      filename: record.filename,
      downloadUrl: record.downloadUrl,
      tier: record.tier,
      order: record.order,
    };
    if (!item.tier || !grouped[item.tier]) grouped.tray.push(item);
    else grouped[item.tier].push(item);
  });

  return grouped;
}

export function chunkItems(items: TierItem[], perRow: number): TierItem[][] {
  const rows: TierItem[][] = [];
  for (let index = 0; index < items.length; index += perRow) {
    rows.push(items.slice(index, index + perRow));
  }
  return rows.length > 0 ? rows : [[]];
}

export function getDisplayRows(items: TierItem[], perRow: number): TierItem[][] {
  const rows = chunkItems(items, perRow);
  if (rows[rows.length - 1].length >= perRow) rows.push([]);
  return rows;
}
