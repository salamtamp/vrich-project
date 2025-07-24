import React from 'react';

import OrderDetailsClient from './OrderDetailsClient';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  return <OrderDetailsClient id={params.id} />;
}
