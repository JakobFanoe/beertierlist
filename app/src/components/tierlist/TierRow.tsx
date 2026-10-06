import { Box, Typography } from '@mui/material';
import TierItemRows from './TierItemRows';
import { Tier, TierItem } from './tierlistTypes';
import { TIER_LABEL_WIDTH } from './tierlistUtils';

interface TierRowProps {
  tier: Tier;
  items: TierItem[];
  perRow: number;
}

export default function TierRow({ tier, items, perRow }: TierRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        borderBottom: 1,
        borderColor: 'divider',
        mb: 0.75,
      }}
    >
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
        <Typography sx={{ fontSize: 38, fontWeight: 700, color: '#222', userSelect: 'none' }}>
          {tier.label}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        <TierItemRows tierId={tier.label} items={items} perRow={perRow} />
      </Box>
    </Box>
  );
}
