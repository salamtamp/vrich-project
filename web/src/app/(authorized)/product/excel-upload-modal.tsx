'use client';

import React from 'react';

import { Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import useModalContext from '@/hooks/useContext/useModalContext';

import ExcelUploadContent from './excel-upload-content';

import styles from './excel-upload-modal.module.scss';

type ExcelUploadModalProps = {
  onSuccess?: () => void;
};

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ onSuccess }) => {
  const { open, close } = useModalContext();

  const handleOpenUploadModal = () => {
    open({
      content: (
        <ExcelUploadContent
          onClose={close}
          onSuccess={onSuccess}
        />
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
