export interface Item {
  id: number;
  name: string;
  sku: string;
}

export interface ParentItem {
  id: number;
  name: string;
  items: Item[];
}

export interface PurchaseOrderLineItem {
  id?: number;
  quantity: number;
  unit_cost: number;
  item?: Item;
  item_id: number;
  action?: string;
}

export interface PurchaseOrder {
  id: number;
  vendor_name: string;
  order_date: string;
  expected_delivery_date: string;
  totalQuantity?: number;
  totalUnitCost?: number;
  createInWMS?: boolean;
  purchase_order_line_items: PurchaseOrderLineItem[];
}

export interface PurchaseOrdersResponse {
  data: PurchaseOrder[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
}
