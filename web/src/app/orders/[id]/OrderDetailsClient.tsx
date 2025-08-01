'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';

import { LogoSmallIcon } from '@public/assets/icon';
import {
  Building2,
  Calendar,
  CreditCard,
  Edit3,
  MapPin,
  Package,
  Receipt,
  Save,
  User,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { API } from '@/constants/api.constant';
import { getStatusIcon, STATUS_COLORS, STATUS_LABELS } from '@/constants/order-status';
import useRequest from '@/hooks/request/useRequest';
import dayjs from '@/lib/dayjs';
import { cn, verifyPaymentSlip } from '@/lib/utils';
import type { Order, Payment } from '@/types/api/order';

const formatDate = (date?: string, includeTime = false) => {
  if (!date) {
    return 'Not set';
  }
  return dayjs(date).format(includeTime ? 'MMMM D, YYYY [at] h:mm A' : 'MMMM D, YYYY');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const TAX_RATE = 0;

const OrderDetailsClient = ({ id, isAdmin = false }: { id: string; isAdmin?: boolean }) => {
  const [contactForm, setContactForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    country: '',
    note: '',
  });

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  // Remove taxRate state
  // Initialize mockPayments with order.payments if available
  const [mockPayments, setMockPayments] = useState<Payment[]>(() => {
    // Try to get from SSR/initial order if available
    return [];
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileInputRef] = useState(() => React.createRef<HTMLInputElement>());

  const {
    data: order,
    error,
    handleRequest,
    isLoading,
  } = useRequest<Order>({
    request: { url: `${API.ORDER}/${id}`, method: 'GET' },
    defaultLoading: true,
  });

  // Add a useRequest for updating order status
  const { handleRequest: updateOrderStatus } = useRequest<Order>({
    request: {
      url: `${API.ORDER}/${id}`,
      method: 'PUT',
    },
    defaultLoading: false,
  });

  useEffect(() => {
    void handleRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-fill contact form if profile_contact exists
  useEffect(() => {
    if (order?.profile?.profile_contact) {
      const contact = order.profile.profile_contact;
      setContactForm({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        address: contact.address || '',
        postal_code: contact.postal_code ?? '',
        city: contact.city ?? '',
        country: contact.country ?? '',
        note: contact.note ?? '',
      });
    }
  }, [order]);

  const handleContactInputChange = (field: string, value: string) => {
    setContactForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveContact = async () => {
    setIsSavingContact(true);
    try {
      console.info('Saving contact:', contactForm);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsEditingContact(false);
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    if (order?.profile?.profile_contact) {
      const contact = order.profile.profile_contact;
      setContactForm({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        address: contact.address || '',
        postal_code: contact.postal_code ?? '',
        city: contact.city ?? '',
        country: contact.country ?? '',
        note: contact.note ?? '',
      });
    }
    setIsEditingContact(false);
  };

  // --- Payment slip logic ---
  // Use mockPayments if available, otherwise fallback to order.payments (if backend provides)
  let payments: Payment[] = [];
  if (mockPayments.length > 0) {
    payments = mockPayments;
  } else if (
    order &&
    typeof order === 'object' &&
    'payments' in order &&
    Array.isArray((order as { payments?: Payment[] }).payments)
  ) {
    const { payments: orderPayments } = order as { payments: Payment[] };
    payments = orderPayments;
  }
  const payment = payments?.[0] ?? null;
  const paymentSlipUrl = payment?.payment_slip ?? '';

  // Use useRequest for upload simulation
  const { handleRequest: uploadPaymentSlip } = useRequest<Payment>({
    request: {
      url: '/api/v1/payments',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    defaultLoading: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }
    setFileInput(file);
    setUploadError(null);
  };

  // Function to resize image and convert to base64
  const resizeImageAndConvertToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        // Set maximum dimensions for payment slip (smaller for base64 efficiency)
        const maxWidth = 600;
        const maxHeight = 800;

        let { width, height } = img;

        // Calculate new dimensions while maintaining aspect ratio
        // For payment slips, prioritize height (portrait orientation) with smaller file size
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        } else if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw resized image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64 with balanced quality for smaller file size
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      // Create object URL for the image
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  };

  const handleUploadSlip = async () => {
    if (!order) {
      return;
    }
    if (!fileInput) {
      setUploadError('Please select a file to upload.');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const base64Data = await resizeImageAndConvertToBase64(fileInput);
      const { data: verifyData, error } = await verifyPaymentSlip(base64Data);
      if (error) {
        setUploadError('สลิปไม่ถูกต้อง กรุณาตรวจสอบสลิปการโอนเงินอีกครั้งหรือติดต่อเจ้าหน้าที่');
        return;
      }

      const generatePaymentCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'PAY';
        for (let i = 0; i < 8; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      const slip_amount = verifyData?.amount ?? 0;
      const slip_purchase_date = verifyData?.date ? dayjs(verifyData.date).format('YYYY-MM-DD HH:mm:ss') : '';
      const purchase_date = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const mockPayment: Payment = {
        id: crypto.randomUUID(),
        payment_slip: base64Data, // Use base64 data instead of URL
        payment_code: payment?.payment_code ?? generatePaymentCode(),
        amount: slip_amount,
        payment_date: slip_purchase_date,
        method: payment?.method ?? 'bank_transfer',
        status: payment?.status ?? 'success',
        order_id: order.id,
        profile_id: order.profile_id,
      };
      await uploadPaymentSlip({ data: mockPayment });
      setMockPayments([mockPayment]);
      setFileInput(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await updateOrderStatus({ data: { status: 'paid', purchase_date } });
      void handleRequest();
    } catch (err) {
      setUploadError((err as { message?: string })?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <></>;
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='text-center'>
          <div className='mb-4 text-6xl'>⚠️</div>
          <h2 className='mb-2 text-2xl font-bold text-red-600'>Error Loading Order</h2>
          <p className='text-gray-600'>Failed to load order details. Please try again.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='text-center'>
          <div className='mb-4 text-6xl'>📋</div>
          <h2 className='mb-2 text-2xl font-bold text-gray-800'>Order Not Found</h2>
          <p className='text-gray-600'>The requested order could not be found.</p>
        </div>
      </div>
    );
  }

  const {
    code,
    status,
    created_at,
    profile,
    orders_products,
    note,
    purchase_date,
    shipping_date,
    delivery_date,
  } = order;

  // Calculations
  const totalItems = orders_products.length;
  const totalQuantity = orders_products.reduce((sum, op) => sum + (op.quantity || 0), 0);
  const subtotal = orders_products.reduce((sum, op) => {
    const price = op.campaign_product?.product?.selling_price ?? 0;
    return sum + price * (op.quantity || 1);
  }, 0);
  const totalShipping = orders_products.reduce((sum, op) => {
    const fee = op.campaign_product?.product?.shipping_fee ?? 0;
    return sum + fee * (op.quantity || 1);
  }, 0);
  const tax = subtotal * (TAX_RATE / 100);
  const grandTotal = subtotal + totalShipping + tax;

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden',
        !isAdmin && 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      )}
    >
      {/* Header */}
      {!isAdmin ? (
        <div className='border-b border-gray-200 bg-white shadow-sm'>
          <div className='mx-auto max-w-4xl px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div className='flex size-10 items-center justify-center rounded-lg bg-gray-300'>
                  <LogoSmallIcon className='size-6' />
                </div>

                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>Payment Information</h1>
                  <p className='text-sm text-gray-500'>Order #{code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={cn('mx-auto max-w-4xl flex-1 overflow-y-scroll', !isAdmin && 'px-6 py-8')}>
        {/* Status Banner */}
        {!isAdmin ? (
          <div
            className={`mb-8 rounded-xl border-2 p-6 ${STATUS_COLORS[status] || STATUS_COLORS.pending} backdrop-blur-sm`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div
                  className={`flex size-12 items-center justify-center rounded-full border ${STATUS_COLORS[status]} bg-white`}
                >
                  {getStatusIcon(status)}
                </div>
                <div>
                  <h2 className='text-xl font-bold'>{STATUS_LABELS[status] || status}</h2>
                  <p className='text-sm opacity-80'>{STATUS_LABELS[status] || status}</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-sm opacity-80'>Last Updated</p>
                <p className='font-semibold'>{formatDate(order.updated_at, true)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Remove Tax Rate Input */}

        {/* AIRCommerce Payment Information - FIRST */}
        {!isAdmin ? (
          <Card className='mb-8 border-0 bg-white/80 shadow-lg backdrop-blur-sm'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center text-xl text-gray-900'>
                <Building2 className='mr-2 size-5 text-green-600' />
                AIRCommerce - Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='rounded-lg bg-white/80 p-6 shadow-sm'>
                <div className='mb-4 text-center'>
                  <h3 className='text-lg font-bold text-gray-900'>Thank you for your order!</h3>
                  <p className='text-sm text-gray-600'>Please transfer the payment to the account below</p>
                </div>
                <div className='space-y-4'>
                  <div className='rounded-lg bg-green-50 p-4'>
                    <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                      <div>
                        <p className='text-sm font-medium text-gray-700'>Bank:</p>
                        <p className='text-lg font-bold text-green-700'>TDB (Test Development Bank)</p>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-700'>Account Number:</p>
                        <p className='font-mono text-lg font-bold text-green-700'>123-4-56789-123</p>
                      </div>
                    </div>
                    <div className='mt-3'>
                      <p className='text-sm font-medium text-gray-700'>Account Name:</p>
                      <p className='text-lg font-bold text-green-700'>Mr. FirstName LastName</p>
                    </div>
                  </div>
                  <div className='rounded-lg bg-blue-50 p-4'>
                    <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                      <div>
                        <p className='text-sm font-medium text-gray-700'>Total Amount:</p>
                        <p className='text-2xl font-bold text-blue-700'>{formatCurrency(grandTotal)}</p>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-700'>Order Code:</p>
                        <p className='font-mono text-lg font-bold text-blue-700'>#{code}</p>
                      </div>
                    </div>
                  </div>
                  <div className='rounded-lg bg-yellow-50 p-4'>
                    <h4 className='mb-2 font-semibold text-yellow-800'>Payment Instructions:</h4>
                    <ul className='space-y-1 text-sm text-yellow-700'>
                      <li>• Transfer the exact amount shown above</li>
                      <li>• Include your order code (#{code}) in the transfer reference</li>
                      <li>• Take a screenshot of the transfer confirmation</li>
                      <li>• Send the screenshot to our customer service</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Customer & Order Information - SECOND */}
        <Card className='mb-8 border-0 bg-white/80 shadow-lg backdrop-blur-sm'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center text-xl text-gray-900'>
              <User className='mr-2 size-5 text-blue-600' />
              Customer & Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-3'>
                <h4 className='border-b border-gray-200 pb-1 font-semibold text-gray-900'>
                  Customer Details
                </h4>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='text-gray-600'>Name:</span>{' '}
                    <span className='font-medium'>{profile?.name ?? 'N/A'}</span>
                  </div>
                  <div>
                    <span className='text-gray-600'>Facebook ID:</span>{' '}
                    <span className='rounded bg-gray-100 px-2 py-1 font-mono text-xs'>
                      {profile?.facebook_id ?? 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className='space-y-3'>
                <h4 className='border-b border-gray-200 pb-1 font-semibold text-gray-900'>Order Details</h4>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='text-gray-600'>Order Date:</span>{' '}
                    <span className='font-medium'>{formatDate(created_at)}</span>
                  </div>
                  <div>
                    <span className='text-gray-600'>Purchase Date:</span>{' '}
                    <span className='font-medium'>{formatDate(purchase_date)}</span>
                  </div>
                  <div>
                    <span className='text-gray-600'>Items:</span>{' '}
                    <span className='font-medium'>
                      {totalItems} products ({totalQuantity} qty)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary - THIRD */}
        <Card className='mb-8 border-0 bg-white/80 shadow-lg backdrop-blur-sm'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center text-xl text-gray-900'>
              <Receipt className='mr-2 size-5' />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-gray-700'>Subtotal:</span>
                <span className='font-semibold text-gray-900'>{formatCurrency(subtotal)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-700'>Shipping:</span>
                <span className='font-semibold text-gray-900'>{formatCurrency(totalShipping)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-700'>Tax ({TAX_RATE}%):</span>
                <span className='font-semibold text-gray-900'>{formatCurrency(tax)}</span>
              </div>
              <hr className='border-gray-300' />
              <div className='flex justify-between text-lg'>
                <span className='font-bold text-gray-900'>Grand Total:</span>
                <span className='font-bold text-gray-900'>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
            <div className='space-y-2 border-t border-gray-300 pt-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-700'>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-700'>Total Quantity:</span>
                <span>{totalQuantity}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items - FOURTH */}
        <Card className='mb-8 border-0 bg-white/80 shadow-lg backdrop-blur-sm'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center text-xl text-gray-900'>
              <Package className='mr-2 size-5 text-blue-600' />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b-2 border-gray-200'>
                    <th className='px-2 py-3 text-left font-semibold text-gray-900'>Product</th>
                    <th className='px-2 py-3 text-center font-semibold text-gray-900'>Qty</th>
                    <th className='px-2 py-3 text-right font-semibold text-gray-900'>Unit Price</th>
                    <th className='px-2 py-3 text-right font-semibold text-gray-900'>Shipping</th>
                    <th className='px-2 py-3 text-right font-semibold text-gray-900'>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders_products.map((op) => {
                    const product = op.campaign_product?.product;
                    if (!product) {
                      return null;
                    }
                    const price = product.selling_price || 0;
                    const shipping = product.shipping_fee || 0;
                    const lineTotal = (price + shipping) * (op.quantity || 1);
                    return (
                      <tr
                        key={op.id}
                        className='border-b border-gray-100 transition-colors hover:bg-gray-50/50'
                      >
                        <td className='px-2 py-4'>
                          <div className='flex items-center space-x-3'>
                            <div>
                              <p className='font-medium text-gray-900'>{product.name}</p>
                              <p className='text-sm text-gray-500'>Code: {product.code}</p>
                              {op.campaign_product?.keyword ? (
                                <span className='mt-1 inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-800'>
                                  {op.campaign_product.keyword}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className='px-2 py-4 text-center'>
                          <span className='inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium'>
                            {op.quantity}
                          </span>
                        </td>
                        <td className='px-2 py-4 text-right font-medium'>{formatCurrency(price)}</td>
                        <td className='px-2 py-4 text-right text-sm text-gray-600'>
                          {formatCurrency(shipping)}
                        </td>
                        <td className='px-2 py-4 text-right font-bold text-gray-900'>
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Shipping Information - FIFTH */}
        <Card className='mb-8 border-0 bg-white/80 shadow-lg backdrop-blur-sm'>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center text-xl text-gray-900'>
                <MapPin className='mr-2 size-5 text-blue-600' />
                Contact & Shipping Information
              </CardTitle>
              {!isEditingContact ? (
                <>
                  {!isAdmin && (
                    <Button
                      className='flex items-center gap-2'
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setIsEditingContact(true);
                      }}
                    >
                      <Edit3 className='size-4' />
                      Edit
                    </Button>
                  )}
                </>
              ) : (
                <div className='flex gap-2'>
                  <Button
                    className='flex items-center gap-2'
                    disabled={isSavingContact}
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      void handleSaveContact();
                    }}
                  >
                    <Save className='size-4' />
                    {isSavingContact ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    className='flex items-center gap-2'
                    size='sm'
                    variant='outline'
                    onClick={handleCancelEdit}
                  >
                    <X className='size-4' />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isEditingContact ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>First Name:</p>
                    <p className='text-gray-900'>{contactForm.first_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>Last Name:</p>
                    <p className='text-gray-900'>{contactForm.last_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>Email:</p>
                    <p className='text-gray-900'>{contactForm.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>Phone:</p>
                    <p className='text-gray-900'>{contactForm.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className='space-y-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>City:</p>
                    <p className='text-gray-900'>{contactForm.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>Postal Code:</p>
                    <p className='text-gray-900'>{contactForm.postal_code || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>Country:</p>
                    <p className='text-gray-900'>{contactForm.country || 'Not provided'}</p>
                  </div>
                </div>
                {contactForm.address ? (
                  <div className='md:col-span-2'>
                    <p className='text-sm font-medium text-gray-700'>Address:</p>
                    <p className='rounded-lg bg-gray-50 p-3 text-gray-900'>{contactForm.address}</p>
                  </div>
                ) : null}
                {contactForm.note ? (
                  <div className='md:col-span-2'>
                    <p className='text-sm font-medium text-gray-700'>Note:</p>
                    <p className='rounded-lg bg-gray-50 p-3 text-gray-900'>{contactForm.note}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <p className='mb-1 block text-sm font-medium text-gray-700'>First Name</p>
                    <Input
                      placeholder='Enter first name'
                      value={contactForm.first_name}
                      onChange={(e) => {
                        handleContactInputChange('first_name', e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <p className='mb-1 block text-sm font-medium text-gray-700'>Last Name</p>
                    <Input
                      placeholder='Enter last name'
                      value={contactForm.last_name}
                      onChange={(e) => {
                        handleContactInputChange('last_name', e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <p className='mb-1 block text-sm font-medium text-gray-700'>Email</p>
                    <Input
                      placeholder='Enter email address'
                      type='email'
                      value={contactForm.email}
                      onChange={(e) => {
                        handleContactInputChange('email', e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <p className='mb-1 block text-sm font-medium text-gray-700'>Phone</p>
                    <Input
                      placeholder='Enter phone number'
                      value={contactForm.phone}
                      onChange={(e) => {
                        handleContactInputChange('phone', e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <p className='mb-1 block text-sm font-medium text-gray-700'>City</p>
                    <Input
                      placeholder='Enter city'
                      value={contactForm.city}
                      onChange={(e) => {
                        handleContactInputChange('city', e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <p className='mb-1 block text-sm font-medium text-gray-700'>Postal Code</p>
                    <Input
                      placeholder='Enter postal code'
                      value={contactForm.postal_code}
                      onChange={(e) => {
                        handleContactInputChange('postal_code', e.target.value);
                      }}
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <p className='mb-1 block text-sm font-medium text-gray-700'>Country</p>
                    <Input
                      placeholder='Enter country'
                      value={contactForm.country}
                      onChange={(e) => {
                        handleContactInputChange('country', e.target.value);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p className='mb-1 block text-sm font-medium text-gray-700'>Address</p>
                  <Textarea
                    placeholder='Enter full address'
                    rows={3}
                    value={contactForm.address}
                    onChange={(e) => {
                      handleContactInputChange('address', e.target.value);
                    }}
                  />
                </div>
                <div>
                  <p className='mb-1 block text-sm font-medium text-gray-700'>Note</p>
                  <Textarea
                    placeholder='Enter any additional notes'
                    rows={2}
                    value={contactForm.note}
                    onChange={(e) => {
                      handleContactInputChange('note', e.target.value);
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Timeline (if any) */}
        {purchase_date || shipping_date || delivery_date ? (
          <Card className='mb-8 border-0 bg-white/80 shadow-lg backdrop-blur-sm'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center text-xl text-gray-900'>
                <Calendar className='mr-2 size-5 text-blue-600' />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[
                  {
                    date: purchase_date,
                    p: 'Purchase Date',
                    icon: CreditCard,
                    color: 'text-blue-600',
                  },
                  {
                    date: shipping_date,
                    p: 'Shipping Date',
                    icon: Package,
                    color: 'text-orange-600',
                  },
                  { date: delivery_date, p: 'Delivery Date', icon: MapPin, color: 'text-green-600' },
                ]
                  .filter((item) => item.date)
                  .map((item) => {
                    const Icon = item.icon;
                    const { color } = item;
                    const { p } = item;
                    const { date } = item;
                    return (
                      <div
                        key={crypto.randomUUID()}
                        className='flex items-center space-x-4 rounded-lg bg-gray-50 p-3'
                      >
                        <div
                          className={[
                            'flex size-10 items-center justify-center rounded-full bg-white',
                            color,
                          ].join(' ')}
                        >
                          <Icon className='size-5' />
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>{p}</p>
                          <p className='text-sm text-gray-600'>{formatDate(date, true)}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Notes */}
        {note ? (
          <Card className='mb-8 border-0 bg-white/80 shadow-lg backdrop-blur-sm'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-xl text-gray-900'>Special Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='rounded-r-lg border-l-4 border-blue-400 bg-blue-50 p-4'>
                <p className='whitespace-pre-line text-gray-700'>{note}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Payment Slip Upload Section */}
        <Card className='mb-8 border-0 bg-white/80 shadow-lg backdrop-blur-sm'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center text-xl text-gray-900'>
              <CreditCard className='mr-2 size-5 text-blue-600' />
              Payment Slip
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentSlipUrl ? (
              <div className='mb-4 flex w-full justify-center'>
                <Image
                  alt='Payment Slip'
                  className='max-h-64 rounded-lg border border-gray-200 shadow-sm'
                  height={240}
                  src={paymentSlipUrl}
                  width={200}
                />
              </div>
            ) : (
              <p className='mb-4 text-sm text-gray-500'>No payment slip uploaded yet.</p>
            )}
            {/* Only allow upload if not admin */}
            {!isAdmin && !paymentSlipUrl && (
              <div className='flex flex-col gap-2 md:flex-row md:items-center'>
                <input
                  ref={fileInputRef}
                  accept='image/*'
                  className='mb-2 flex-1 rounded border border-gray-300 px-3 py-2 text-base md:mb-0'
                  disabled={uploading}
                  type='file'
                  onChange={handleFileChange}
                />
                <Button
                  className='ml-0 md:ml-4'
                  disabled={uploading || !fileInput}
                  variant='outline'
                  onClick={() => {
                    void handleUploadSlip();
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload Payment Slip'}
                </Button>
              </div>
            )}
            {uploadError ? <p className='mt-2 text-sm text-red-600'>{uploadError}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetailsClient;
