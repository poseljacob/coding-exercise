'use client';

import React, { useState } from 'react';
import {
  TextField,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { PurchaseOrder } from '../../types';

interface FileUploadProps {
  onFileProcessed: (data: PurchaseOrder) => void;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setSnackbar({
        open: true,
        message: 'No file selected',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        'http://localhost:3100/api/purchase-orders/convert-file',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data: PurchaseOrder = await response.json();
      onFileProcessed(data);
      setSnackbar({
        open: true,
        message: 'File uploaded and processed successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'File upload failed',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2}>
        <input
          accept="*"
          style={{ display: 'none' }}
          id="upload-file"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="upload-file">
          <Button variant="contained" component="span">
            Create with AI
          </Button>
        </label>
        {file && (
          <TextField
            value={file.name}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
            sx={{ width: '300px' }}
          />
        )}
        {file && (
          <Button onClick={handleUpload} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Upload'}
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

export default FileUpload;
