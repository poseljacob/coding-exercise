'use client';
import React from 'react';
import Link from 'next/link';
import Button from '@mui/material/Button';

interface PaginationButtonProps {
  page: number;
  hasNextPage: boolean;
}

// Pagination controls for server-side pagination
export const PaginationButton = ({
  page,
  hasNextPage,
}: PaginationButtonProps) => {
  return (
    <div className="flex space-x-6">
      <Link
        href={{
          pathname: '/purchase-orders',
          query: { page: page > 1 ? page - 1 : 1 },
        }}
        passHref
      >
        <Button
          variant="contained"
          disabled={page <= 1}
          className="bg-gray-100 text-gray-800"
        >
          Previous
        </Button>
      </Link>
      <Link
        href={{
          pathname: '/purchase-orders',
          query: { page: hasNextPage ? page + 1 : page },
        }}
        passHref
      >
        <Button
          variant="contained"
          disabled={!hasNextPage}
          className="bg-gray-100 text-gray-800"
        >
          Next
        </Button>
      </Link>
    </div>
  );
};
