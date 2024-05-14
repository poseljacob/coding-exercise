import React from 'react';
import {
  TextField,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
} from '@mui/material';
import { Item, PurchaseOrderLineItem } from '../types';

interface LineItemProps {
  lineItem: PurchaseOrderLineItem;
  index: number;
  inventoryItems: Item[];
  editMode: boolean;
  handleLineItemChange: (
    index: number,
    field: keyof PurchaseOrderLineItem,
    value: string | number
  ) => void;
  deleteLineItem: (index: number) => void;
}

// PurchaseOrderLineItemComponent component that displays a form for creating or editing a purchase order line item
const PurchaseOrderLineItemComponent: React.FC<LineItemProps> = ({
  lineItem,
  index,
  inventoryItems,
  editMode,
  handleLineItemChange,
  deleteLineItem,
}) => {
  return (
    <Box sx={{ mb: 2, position: 'relative' }}>
      <FormControl fullWidth margin="normal">
        <InputLabel id={`line-item-label-${index}`}>Item</InputLabel>
        <Select
          labelId={`line-item-label-${index}`}
          value={lineItem.item_id}
          disabled={!editMode}
          onChange={(e) =>
            handleLineItemChange(index, 'item_id', e.target.value as number)
          }
          fullWidth
        >
          {inventoryItems.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.sku} - {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Quantity"
        type="number"
        variant="outlined"
        InputProps={{
          readOnly: !editMode,
        }}
        value={lineItem.quantity}
        onChange={(e) =>
          handleLineItemChange(index, 'quantity', parseInt(e.target.value))
        }
        fullWidth
        margin="normal"
      />
      <TextField
        label="Unit Cost"
        type="text"
        variant="outlined"
        value={lineItem.unit_cost}
        InputProps={{
          readOnly: !editMode,
        }}
        onChange={(e) =>
          handleLineItemChange(index, 'unit_cost', e.target.value)
        }
        fullWidth
        margin="normal"
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => deleteLineItem(index)}
          disabled={!editMode}
        >
          Remove
        </Button>
      </Box>
    </Box>
  );
};

export default PurchaseOrderLineItemComponent;
