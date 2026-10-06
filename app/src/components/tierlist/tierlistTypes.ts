export interface TierItem {
  id: string;
  filename: string;
  downloadUrl: string;
  tier: string | null;
  order?: number | null;
}

export interface Tier {
  label: string;
  color: string;
}

export type TierLists = Record<string, TierItem[]>;
