'use client';

import React, { useState } from 'react';

import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API } from '@/constants/api.constant';
import useRequest from '@/hooks/request/useRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import type { ExcelUploadResponse } from '@/types/api/product';

import styles from './excel-upload-modal.module.scss';

type ExcelUploadModalProps = {
  onSuccess?: () => void;
};

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadConfig, setUploadConfig] = useState({
    skipRows: 0,
    batchSize: 100,
  });

  const { handleRequest: handleUploadRequest, isLoading: isUploading } = useRequest<ExcelUploadResponse>({
    request: {
      url: API.PRODUCTS_UPLOAD_EXCEL,
      method: 'POST',
    },
  });

  const { open, close } = useModalContext();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isValidType =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.name.toLowerCase().endsWith('.xlsx') ||
        file.name.toLowerCase().endsWith('.xls');

      if (!isValidType) {
        alert('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('skip_rows', uploadConfig.skipRows.toString());
      formData.append('batch_size', uploadConfig.batchSize.toString());

      const result = await handleUploadRequest({ data: formData });

      if (result) {
        if (result.failed_imports > 0) {
          open({
            content: (
              <div className={styles.resultModal}>
                <div className={styles.resultHeader}>
                  <AlertCircle className={styles.errorIcon} />
                  <h3 className={styles.errorTitle}>Upload Failed</h3>
                </div>
                <div className={styles.resultMessage}>{result.message}</div>
                <div className={styles.errorContainer}>
                  <div className={styles.errorTitle}>Error Details:</div>
                  {result.errors.map((error) => (
                    <div
                      key={crypto.randomUUID()}
                      className={styles.errorItem}
                    >
                      <div className={styles.errorRowTitle}>Row {error.row}:</div>
                      <ul className={styles.errorList}>
                        {error.errors.map((err) => (
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
        } else {
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

        onSuccess?.();

        setSelectedFile(null);
        setUploadConfig({ skipRows: 0, batchSize: 100 });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const handleOpenUploadModal = () => {
    open({
      content: (
        <div className={styles.uploadModal}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Upload Products from Excel</h2>
            <Button
              className={styles.closeIconButton}
              size='sm'
              variant='ghost'
              onClick={() => {
                close();
              }}
            >
              <X className={styles.closeIcon} />
            </Button>
          </div>

          <div className={styles.modalContent}>
            <div className={styles.fileSection}>
              <label
                className={styles.fileLabel}
                htmlFor='file-input'
              >
                Select Excel File
              </label>
              <Input
                accept='.xlsx,.xls'
                className={styles.fileInput}
                id='file-input'
                type='file'
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className={styles.fileInfo}>
                  <Upload className={styles.fileIcon} />
                  <span>{selectedFile.name}</span>
                </div>
              ) : null}
            </div>

            <div className={styles.configSection}>
              <div className={styles.configGrid}>
                <div className={styles.configItem}>
                  <label
                    className={styles.configLabel}
                    htmlFor='skip-rows'
                  >
                    Skip Rows
                  </label>
                  <Input
                    className={styles.configInput}
                    id='skip-rows'
                    min='0'
                    type='number'
                    value={uploadConfig.skipRows}
                    onChange={(e) => {
                      setUploadConfig((prev) => ({ ...prev, skipRows: parseInt(e.target.value, 10) || 0 }));
                    }}
                  />
                </div>
                <div className={styles.configItem}>
                  <label
                    className={styles.configLabel}
                    htmlFor='batch-size'
                  >
                    Batch Size
                  </label>
                  <Input
                    className={styles.configInput}
                    id='batch-size'
                    max='1000'
                    min='1'
                    type='number'
                    value={uploadConfig.batchSize}
                    onChange={(e) => {
                      setUploadConfig((prev) => ({
                        ...prev,
                        batchSize: parseInt(e.target.value, 10) || 100,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <Button
              className={styles.cancelButton}
              variant='outline'
              onClick={() => {
                setSelectedFile(null);
                setUploadConfig({ skipRows: 0, batchSize: 100 });
                close();
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
      ),
    });
  };

  return (
    <Button
      className={styles.uploadTriggerButton}
      variant='outline'
      onClick={handleOpenUploadModal}
    >
      <Upload className={styles.uploadIcon} />
      Upload Excel
    </Button>
  );
};

export default ExcelUploadModal;
