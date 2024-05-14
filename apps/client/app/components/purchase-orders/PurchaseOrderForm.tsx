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
import { PurchaseOrder, ParentItem } from '../../types';
import { formatDate, flattenItems } from '../../utils';
import LineItemList from './PurchaseOrderLineItemList';
import { useRouter } from 'next/navigation';
import {
  handleFieldChange,
  handleLineItemChange,
  addLineItem,
  deleteLineItem,
  handleSave,
  handleDelete,
  defaultOrder,
} from '../../utils';

interface PurchaseOrderFormProps {
  initialOrder?: PurchaseOrder;
  items: ParentItem[];
  isNewOrder?: boolean;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  initialOrder = defaultOrder,
  items,
  isNewOrder = false,
}) => {
  const router = useRouter();

  const [purchaseOrder, setPurchaseOrder] =
    useState<PurchaseOrder>(initialOrder);
  const [editMode, setEditMode] = useState<boolean>(isNewOrder);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const flatItems = flattenItems(items);

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
                handleFieldChange(
                  purchaseOrder,
                  setPurchaseOrder,
                  'createInWMS',
                  e.target.checked
                )
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
        onChange={(e) =>
          handleFieldChange(
            purchaseOrder,
            setPurchaseOrder,
            'vendor_name',
            e.target.value
          )
        }
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
          handleFieldChange(
            purchaseOrder,
            setPurchaseOrder,
            'order_date',
            formatDate(e.target.value)
          )
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
            purchaseOrder,
            setPurchaseOrder,
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
        handleLineItemChange={(index, field, value) =>
          handleLineItemChange(
            purchaseOrder,
            setPurchaseOrder,
            index,
            field,
            value
          )
        }
        addLineItem={() => addLineItem(purchaseOrder, setPurchaseOrder)}
        deleteLineItem={(index) =>
          deleteLineItem(purchaseOrder, setPurchaseOrder, index)
        }
        inventoryItems={flatItems}
        editMode={editMode}
      />

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {!isNewOrder && (
          <>
            <Button
              onClick={() =>
                handleDelete(
                  purchaseOrder,
                  setSnackbar,
                  setPurchaseOrder,
                  setEditMode,
                  router
                )
              }
              color="error"
            >
              Delete
            </Button>
            <Button onClick={() => setEditMode(!editMode)} color="primary">
              {editMode ? 'Cancel' : 'Edit'}
            </Button>
          </>
        )}
        {editMode && (
          <Button
            onClick={() =>
              handleSave(
                purchaseOrder,
                setSnackbar,
                setEditMode,
                setPurchaseOrder,
                isNewOrder,
                router
              )
            }
            color="secondary"
          >
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
