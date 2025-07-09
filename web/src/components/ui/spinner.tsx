'use client';

import React from 'react';

import styles from './spinner.module.scss';

const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${styles.loader} ${className}`} />
);

export default Spinner;
