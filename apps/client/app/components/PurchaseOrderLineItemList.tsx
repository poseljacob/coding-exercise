import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import PurchaseOrderLineItemComponent from './PurchaseOrderLineComponent';
import { Item, PurchaseOrderLineItem } from '../types';

interface PurchaseOrderLineItemListProps {
  purchaseOrderLineItems: PurchaseOrderLineItem[];
  handleLineItemChange: (
    index: number,
    field: keyof PurchaseOrderLineItem,
    value: string | number
  ) => void;
  addLineItem: () => void;
  deleteLineItem: (index: number) => void;
  inventoryItems: Item[];
  editMode: boolean;
}

// PurchaseOrderLineItemList component that displays a list of purchase order line items
const PurchaseOrderLineItemList: React.FC<PurchaseOrderLineItemListProps> = ({
  purchaseOrderLineItems,
  handleLineItemChange,
  addLineItem,
  deleteLineItem,
  inventoryItems,
  editMode,
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Line Items
      </Typography>
      {purchaseOrderLineItems.map(
        (lineItem, index) =>
          lineItem.action !== 'delete' && (
            <PurchaseOrderLineItemComponent
              key={index}
              lineItem={lineItem}
              index={index}
              inventoryItems={inventoryItems}
              editMode={editMode}
              handleLineItemChange={handleLineItemChange}
              deleteLineItem={deleteLineItem}
            />
          )
      )}
      <Button color="primary" onClick={addLineItem} disabled={!editMode}>
        Add Line Item
      </Button>
    </Box>
  );
};

export default PurchaseOrderLineItemList;
