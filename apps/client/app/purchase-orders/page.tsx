import React from 'react';
import { Box, Paper } from '@mui/material';
import { PurchaseOrdersResponse } from '../types';
import Link from 'next/link';
import DataTable from '../components/purchase-orders/DataTable';
import PaginationButton from '../components/purchase-orders/PaginationButton';

// Function to fetch purchase orders
async function getPurchaseOrders({
  page = 1,
  limit = 10,
}: {
  page: number;
  limit: number;
}): Promise<PurchaseOrdersResponse> {
  const response = await fetch(
    `http://localhost:3100/api/purchase-orders?page=${page}&limit=${limit}`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

// Server component for the purchase orders page
export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get the page and limit from the search parameters
  const page =
    typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const limit =
    typeof searchParams.limit === 'string' ? Number(searchParams.limit) : 10;

  const response = await getPurchaseOrders({ page, limit });
  const { data, currentPage, totalPages, hasNextPage } = response;

  return (
    <div>
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Link href="/purchase-orders/create">Create Purchase Order</Link>
      </Box>
      <Box component={Paper}>
        <DataTable
          purchaseOrders={data}
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          totalPages={totalPages}
        />
        <PaginationButton
          page={currentPage}
          hasNextPage={hasNextPage}
          totalPages={totalPages}
        />
      </Box>
    </div>
  );
}
