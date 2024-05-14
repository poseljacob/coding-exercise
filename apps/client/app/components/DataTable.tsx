'use client';

import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
} from '@mui/material';

import { PaginationButton } from './PaginationButton';
import { useRouter } from 'next/navigation';
import { PurchaseOrder } from '../types';
import { formatDate } from '../utils';

interface DataTableProps {
  purchaseOrders: PurchaseOrder[];
  currentPage: number;
  hasNextPage: boolean;
}
// DataTable component that displays a table of purchase orders
const DataTable = ({
  purchaseOrders,
  currentPage,
  hasNextPage,
}: DataTableProps) => {
  const router = useRouter();

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Expected Delivery</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseOrders.map((order) => (
              <TableRow
                key={order.id}
                onClick={() => router.push(`/purchase-orders/${order.id}`)}
              >
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.vendor_name}</TableCell>
                <TableCell>{formatDate(order.order_date)}</TableCell>
                <TableCell>
                  {formatDate(order.expected_delivery_date)}
                </TableCell>
                <TableCell>{order.totalQuantity}</TableCell>
                <TableCell>${order.totalUnitCost}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationButton page={currentPage} hasNextPage={hasNextPage} />
      </TableContainer>
    </div>
  );
};

export default DataTable;
