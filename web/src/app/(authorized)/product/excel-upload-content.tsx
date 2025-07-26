'use client';

import React, { useCallback, useState } from 'react';

import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';
import { API } from '@/constants/api.constant';
import useRequest from '@/hooks/request/useRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import type { ExcelUploadResponse } from '@/types/api/product';

import styles from './excel-upload-modal.module.scss';

type ExcelUploadContentProps = {
  onSuccess?: () => void;
  onClose: () => void;
};

const ExcelUploadContent: React.FC<ExcelUploadContentProps> = ({ onSuccess, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { handleRequest: handleUploadRequest, isLoading: isUploading } = useRequest<ExcelUploadResponse>({
    request: {
      url: API.PRODUCTS_UPLOAD_EXCEL,
      method: 'POST',
    },
  });

  const { open, close, clear } = useModalContext();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // Ensure we're using the actual File object
      const file = acceptedFiles[0];
      console.info('File object:', file);
      console.info('File type:', file.type);
      console.info('File name:', file.name);
      setSelectedFile(file);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileDialog,
  } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      console.info('=== FRONTEND DEBUG START ===');
      console.info('Selected file:', selectedFile);
      console.info('File type:', selectedFile.type);
      console.info('File name:', selectedFile.name);
      console.info('File size:', selectedFile.size);
      console.info('File instanceof File:', selectedFile instanceof File);

      const formData = new FormData();
      console.info('FormData created:', formData);

      // Ensure we're appending the actual File object
      formData.append('file', selectedFile);
      formData.append('skip_rows', '1');
      formData.append('batch_size', '100');

      // Debug: Log what we're sending
      console.info('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.info(`${key}:`, value);
        console.info(`${key} type:`, typeof value);
        if (value instanceof File) {
          console.info(`${key} is File:`, true);
          console.info(`${key} file type:`, value.type);
          console.info(`${key} file name:`, value.name);
          console.info(`${key} file size:`, value.size);
        }
      }

      console.info('=== FRONTEND DEBUG END ===');

      const result = await handleUploadRequest({
        data: formData,
      });

      // Success case
      open({
        content: (
          <div className={styles.resultModal}>
            <div className={styles.resultHeader}>
              <CheckCircle className={styles.successIcon} />
              <h3 className={styles.successTitle}>Upload Successful</h3>
            </div>
            <div className={styles.resultMessage}>{result.message}</div>
            <div className={styles.successStats}>
              <div>Total rows: {result.total_rows}</div>
              <div>Successfully imported: {result.successful_imports}</div>
            </div>
          </div>
        ),
        onClose: () => {
          clear();
        },
      });

      onSuccess?.();
      setSelectedFile(null);
    } catch (error: unknown) {
      console.error('Upload error:', error);

      // Handle HTTP 400 error with validation details
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: { message?: string; errors?: Array<{ row: number; errors: string[] }> };
          };
        };
        if (axiosError.response?.status === 400 && axiosError.response?.data) {
          const errorData = axiosError.response.data;

          open({
            content: (
              <div className={styles.resultModal}>
                <div className={styles.resultHeader}>
                  <AlertCircle className={styles.errorIcon} />
                  <h3 className={styles.errorTitle}>Upload Failed</h3>
                </div>
                <div className={styles.resultMessage}>{errorData.message}</div>
                <div className={styles.errorContainer}>
                  <div className={styles.errorTitle}>Error Details:</div>
                  {errorData.errors?.map((error: { row: number; errors: string[] }) => (
                    <div
                      key={crypto.randomUUID()}
                      className={styles.errorItem}
                    >
                      <div className={styles.errorRowTitle}>Row {error.row}:</div>
                      <ul className={styles.errorList}>
                        {error.errors?.map((err: string) => (
                          <li key={crypto.randomUUID()}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <Button
                  className={styles.closeButton}
                  onClick={() => {
                    close();
                  }}
                >
                  Close
                </Button>
              </div>
            ),
          });
        }
      }
    }
  }, [clear, close, handleUploadRequest, onSuccess, open, selectedFile]);

  return (
    <div className={styles.uploadModal}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Upload Products from Excel</h2>
      </div>

      <div className={styles.modalContent}>
        <div {...getRootProps({ className: styles.dropzone })}>
          <input {...getInputProps()} />
          <div className={styles.dropzoneContent}>
            {(() => {
              if (isDragActive) {
                return <div className={styles.dropzoneActive}>Drop the file here ...</div>;
              }
              if (selectedFile) {
                return (
                  <div className={styles.fileInfoImproved}>
                    <CheckCircle className={styles.fileValidIcon} />
                    <div className={styles.fileTextGroup}>
                      <span className={styles.fileLabel}>Selected file:</span>
                      <span className={styles.fileName}>{selectedFile.name}</span>
                    </div>
                    <Button
                      aria-label='Remove file'
                      className={styles.removeFileButtonImproved}
                      size='icon'
                      variant='ghost'
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <X className={styles.closeIcon} />
                    </Button>
                  </div>
                );
              }
              return (
                <div className={styles.dropzonePrompt}>
                  <Upload className={styles.fileIcon} />
                  <span>Drag & drop Excel file here, or </span>
                  <Button
                    className={styles.browseButton}
                    size='sm'
                    type='button'
                    variant='outline'
                    onClick={(e) => {
                      e.stopPropagation();
                      openFileDialog();
                    }}
                  >
                    Browse
                  </Button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <div className={styles.modalFooter}>
        <Button
          className={styles.cancelButton}
          variant='outline'
          onClick={() => {
            setSelectedFile(null);
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button
          className={styles.uploadButton}
          disabled={!selectedFile || isUploading}
          onClick={() => {
            void handleUpload();
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </div>
  );
};

export default ExcelUploadContent;
