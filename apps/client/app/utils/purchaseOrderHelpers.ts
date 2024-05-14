import { PurchaseOrder, PurchaseOrderLineItem } from '../types';
import { useRouter } from 'next/navigation';

export const defaultOrder: PurchaseOrder = {
  id: 0,
  vendor_name: '',
  order_date: new Date().toISOString(),
  expected_delivery_date: new Date().toISOString(),
  purchase_order_line_items: [],
  createInWMS: false,
};

// Function to handle change for purchase order fields
export const handleFieldChange = (
  purchaseOrder: PurchaseOrder,
  setPurchaseOrder: React.Dispatch<React.SetStateAction<PurchaseOrder>>,
  field: keyof PurchaseOrder,
  value: string | number | boolean
) => {
  const updatedPurchaseOrder = { ...purchaseOrder, [field]: value };
  setPurchaseOrder(updatedPurchaseOrder);
};

// Function to handle change for line item fields
export const handleLineItemChange = (
  purchaseOrder: PurchaseOrder,
  setPurchaseOrder: React.Dispatch<React.SetStateAction<PurchaseOrder>>,
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

// Function to add a new line item to the purchase order
export const addLineItem = (
  purchaseOrder: PurchaseOrder,
  setPurchaseOrder: React.Dispatch<React.SetStateAction<PurchaseOrder>>
) => {
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

// Function to delete a line item from the purchase order
export const deleteLineItem = (
  purchaseOrder: PurchaseOrder,
  setPurchaseOrder: React.Dispatch<React.SetStateAction<PurchaseOrder>>,
  index: number
) => {
  const lineItem = purchaseOrder.purchase_order_line_items[index];

  if (lineItem.action === 'new') {
    setPurchaseOrder((prev) => ({
      ...prev,
      purchase_order_line_items: prev.purchase_order_line_items.filter(
        (_, idx) => idx !== index
      ),
    }));
  } else {
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

// Function to save the purchase order
export const handleSave = async (
  purchaseOrder: PurchaseOrder,
  setSnackbar: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      message: string;
      severity: 'success' | 'error';
    }>
  >,
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>,
  setPurchaseOrder: React.Dispatch<React.SetStateAction<PurchaseOrder>>,
  isNewOrder: boolean,
  router: ReturnType<typeof useRouter>
) => {
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

  const po = await response.json();
  if (isNewOrder) {
    setPurchaseOrder(defaultOrder);
    router.push(`/purchase-orders/${po.id}`);
  }
  setPurchaseOrder(po);
};

// Function to delete the purchase order
export const handleDelete = async (
  purchaseOrder: PurchaseOrder,
  setSnackbar: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      message: string;
      severity: 'success' | 'error';
    }>
  >,
  setPurchaseOrder: React.Dispatch<React.SetStateAction<PurchaseOrder>>,
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>
) => {
  const url = `http://localhost:3100/api/purchase-orders/${purchaseOrder.id}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    setSnackbar({
      open: true,
      message: 'Failed to delete purchase order',
      severity: 'error',
    });
    return;
  }

  setSnackbar({
    open: true,
    message: 'Purchase Order Deleted Successfully',
    severity: 'success',
  });
  setPurchaseOrder(defaultOrder);
  setEditMode(false);
  router.push('/purchase-orders');
};
