import React from 'react';
import { Card, CardMedia } from '@mui/material';

interface ItemCardProps {
  item: {
    filename: string;
    downloadUrl: string;
  };
}

export default function ItemCard({ item }: ItemCardProps) {
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
