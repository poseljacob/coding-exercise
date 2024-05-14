import { PurchaseOrders } from '@prisma/client';

export interface PurchaseOrderWithTotals extends PurchaseOrders {
  totalQuantity: number;
  totalUnitCost: number;
}

export interface PaginationResult {
  data: PurchaseOrderWithTotals[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
}
