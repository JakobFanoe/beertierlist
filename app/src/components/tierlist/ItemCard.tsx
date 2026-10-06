import { Card, CardMedia } from '@mui/material';
import { TierItem } from './tierlistTypes';

interface ItemCardProps {
  item: TierItem;
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Card
      sx={{
        height: 120,
        width: 120,
        mr: 1,
        mb: 1,
        bgcolor: '#fff',
        overflow: 'hidden',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.32)',
        },
      }}
    >
      <CardMedia
        component="img"
        width="120"
        height="120"
        image={item.downloadUrl}
        alt={item.filename}
        sx={{ bgcolor: '#fff' }}
      />
    </Card>
  );
}
