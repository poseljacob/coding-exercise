'use client';

import React, { useState } from 'react';
import {
  TextField,
  Box,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { PurchaseOrder, ParentItem, PurchaseOrderLineItem } from '../types';
import { formatDate, flattenItems } from '../utils';
import LineItemList from './PurchaseOrderLineItemList';

interface PurchaseOrderFormProps {
  initialOrder?: PurchaseOrder;
  items: ParentItem[];
  isNewOrder?: boolean; // New prop to differentiate between new and existing orders
}
// PurchaseOrderForm component that displays a form for creating or editing a purchase order
const defaultOrder: PurchaseOrder = {
  id: 0,
  vendor_name: '',
  order_date: new Date().toISOString(),
  expected_delivery_date: new Date().toISOString(),
  purchase_order_line_items: [],
  createInWMS: false,
};

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  initialOrder = defaultOrder,
  items,
  isNewOrder = false,
}) => {
  const [purchaseOrder, setPurchaseOrder] =
    useState<PurchaseOrder>(initialOrder);
  const [editMode, setEditMode] = useState<boolean>(isNewOrder);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Flattens array of parent items into a single array of items
  const flatItems = flattenItems(items);

  // Handle change for purchase order fields
  const handleFieldChange = (field: keyof PurchaseOrder, value: any) => {
    const updatedPurchaseOrder = { ...purchaseOrder, [field]: value };
    setPurchaseOrder(updatedPurchaseOrder);
  };

  // Handle change for line item fields
  const handleLineItemChange = (
    index: number,
    field: keyof PurchaseOrderLineItem,
    value: string | number
  ) => {
    const updatedLineItems = purchaseOrder.purchase_order_line_items.map(
      (lineItem, idx) => {
        if (idx === index) {
          return {
            ...lineItem,
            [field]: value,
            action: lineItem.action || 'update',
          };
        }
        return lineItem;
      }
    );
    setPurchaseOrder((prev) => ({
      ...prev,
      purchase_order_line_items: updatedLineItems,
    }));
  };

  // Add a new line item to the purchase order
  const addLineItem = () => {
    setPurchaseOrder((prev) => ({
      ...prev,
      purchase_order_line_items: [
        ...prev.purchase_order_line_items,
        {
          quantity: 0,
          unit_cost: 0,
          item_id: 0,
          action: 'new',
        },
      ],
    }));
  };

  // Delete a line item from the purchase order
  const deleteLineItem = (index: number) => {
    const lineItem = purchaseOrder.purchase_order_line_items[index];

    // If line item is new, remove it from the list
    if (lineItem.action === 'new') {
      setPurchaseOrder((prev) => ({
        ...prev,
        purchase_order_line_items: prev.purchase_order_line_items.filter(
          (_, idx) => idx !== index
        ),
      }));
    } else {
      // If line item is existing, mark it for deletion
      const updatedLineItems = purchaseOrder.purchase_order_line_items.map(
        (item, idx) => {
          if (idx === index) {
            return { ...item, action: 'delete' };
          }
          return item;
        }
      );
      setPurchaseOrder((prev) => ({
        ...prev,
        purchase_order_line_items: updatedLineItems,
      }));
    }
  };

  const handleSave = async () => {
    const method = isNewOrder ? 'POST' : 'PUT';
    const url = isNewOrder
      ? 'http://localhost:3100/api/purchase-orders'
      : `http://localhost:3100/api/purchase-orders/${purchaseOrder.id}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchaseOrder),
    });

    if (!response.ok) {
      setSnackbar({
        open: true,
        message: `Failed to ${isNewOrder ? 'create' : 'update'} purchase order`,
        severity: 'error',
      });
      return;
    }

    setSnackbar({
      open: true,
      message: `Purchase Order ${
        isNewOrder ? 'Created' : 'Updated'
      } Successfully`,
      severity: 'success',
    });
    setEditMode(false);

    if (isNewOrder) {
      setPurchaseOrder(defaultOrder); // Reset form after creating a new order
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 2 }} component={Paper}>
      <Typography variant="h6" gutterBottom>
        {isNewOrder ? 'Create Purchase Order' : 'Purchase Order Details'}
      </Typography>
      {isNewOrder && (
        <FormControlLabel
          control={
            <Checkbox
              checked={purchaseOrder.createInWMS || false}
              onChange={(e) =>
                handleFieldChange('createInWMS', e.target.checked)
              }
              name="create_in_wms"
              color="primary"
            />
          }
          label="Create In WMS"
        />
      )}

      <TextField
        label="Vendor Name"
        variant="outlined"
        value={purchaseOrder.vendor_name}
        onChange={(e) => handleFieldChange('vendor_name', e.target.value)}
        fullWidth
        margin="normal"
        InputProps={{
          readOnly: !editMode,
        }}
      />
      <TextField
        label="Order Date"
        type="date"
        variant="outlined"
        value={formatDate(purchaseOrder.order_date)}
        onChange={(e) =>
          handleFieldChange('order_date', formatDate(e.target.value))
        }
        fullWidth
        margin="normal"
        InputProps={{
          readOnly: !editMode,
        }}
      />
      <TextField
        label="Expected Delivery"
        type="date"
        variant="outlined"
        value={formatDate(purchaseOrder.expected_delivery_date)}
        onChange={(e) =>
          handleFieldChange(
            'expected_delivery_date',
            formatDate(e.target.value)
          )
        }
        fullWidth
        margin="normal"
        InputProps={{
          readOnly: !editMode,
        }}
      />
      <LineItemList
        purchaseOrderLineItems={purchaseOrder.purchase_order_line_items}
        handleLineItemChange={handleLineItemChange}
        addLineItem={addLineItem}
        deleteLineItem={deleteLineItem}
        inventoryItems={flatItems}
        editMode={editMode}
      />

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {!isNewOrder && (
          <Button onClick={() => setEditMode(!editMode)} color="primary">
            {editMode ? 'Cancel' : 'Edit'}
          </Button>
        )}
        {editMode && (
          <Button onClick={handleSave} color="secondary">
            {isNewOrder ? 'Create Order' : 'Save Changes'}
          </Button>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PurchaseOrderForm;
