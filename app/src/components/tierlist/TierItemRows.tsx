import { Box } from '@mui/material';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import ItemCard from './ItemCard';
import { TierItem } from './tierlistTypes';
import { getDisplayRows } from './tierlistUtils';

interface TierItemRowsProps {
  tierId: string;
  items: TierItem[];
  perRow: number;
}

export default function TierItemRows({ tierId, items, perRow }: TierItemRowsProps) {
  return (
    <>
      {getDisplayRows(items, perRow).map((rowItems, rowIndex) => (
        <Droppable
          key={`${tierId}:${rowIndex}`}
          droppableId={`${tierId}:${rowIndex}`}
          direction="horizontal"
        >
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                minHeight: 132,
                p: '4px',
              }}
            >
              {rowItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(draggable) => (
                    <div
                      ref={draggable.innerRef}
                      {...draggable.draggableProps}
                      {...draggable.dragHandleProps}
                    >
                      <ItemCard item={item} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      ))}
    </>
  );
}
