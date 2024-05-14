'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import { Box, Typography } from '@mui/material';

interface PaginationButtonProps {
  page: number;
  hasNextPage: boolean;
  totalPages: number;
}

// Pagination controls
const PaginationButton: React.FC<PaginationButtonProps> = ({
  page,
  hasNextPage,
  totalPages,
}) => {
  const router = useRouter();

  const handlePreviousPage = () => {
    if (page > 1) {
      router.push(`/purchase-orders?page=${page - 1}`);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      router.push(`/purchase-orders?page=${page + 1}`);
    }
  };

  return (
    <div className="flex space-x-6 m-4">
      <Box>
        <Button
          variant="contained"
          disabled={page <= 1}
          onClick={handlePreviousPage}
          className="bg-gray-100 text-gray-800"
        >
          Previous
        </Button>
        <Button
          variant="contained"
          disabled={!hasNextPage}
          onClick={handleNextPage}
          className="bg-gray-100 text-gray-800"
        >
          Next
        </Button>
        <Box>
          <Typography variant="body1">
            Page {page} of {totalPages}
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default PaginationButton;
