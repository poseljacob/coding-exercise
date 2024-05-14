import DataTable from '../components/DataTable';
import { PurchaseOrdersResponse } from '../types';
import Link from 'next/link';
import { Box } from '@mui/material';

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

const Index = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page =
    typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const limit =
    typeof searchParams.limit === 'string' ? Number(searchParams.limit) : 10;

  const response = await getPurchaseOrders({
    page: Number(page),
    limit: Number(limit),
  });

  const { data, currentPage, totalPages, hasNextPage } = response;

  return (
    <div>
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Link href="/purchase-orders/create">Create Purchase Order</Link>
      </Box>
      <DataTable
        purchaseOrders={data}
        currentPage={currentPage}
        hasNextPage={hasNextPage}
      />
    </div>
  );
};

export default Index;
