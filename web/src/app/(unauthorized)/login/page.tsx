'use client';

import { useCallback, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoading } from '@/contexts';

type LoginFormInputs = {
  email: string;
  password: string;
};

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormInputs>({
    mode: 'onSubmit',
    resolver: yupResolver(schema),
  });
  const [showPassword, setShowPassword] = useState(false);

  const { openLoading, closeLoading } = useLoading();

  const handleFormSubmit = useCallback(
    async (data: LoginFormInputs) => {
      try {
        openLoading();
        clearErrors('root');
        const res = await signIn('credentials', {
          redirect: false,
          email: data.email,
          password: data.password,
        });
        if (!res?.ok) {
          setError('root', { type: 'manual', message: 'Invalid email or password' });
        }
      } catch (error) {
        console.error(error);
      } finally {
        closeLoading();
      }
    },
    [openLoading, clearErrors, setError, closeLoading]
  );

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4'>
      <div className='w-full max-w-md'>
        <Card className='rounded-2xl border-0 shadow-lg'>
          <CardHeader className='space-y-1 pb-6'>
            <CardTitle className='text-center text-2xl font-semibold'>Sign In</CardTitle>
            <CardDescription className='text-center'>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.root && typeof errors.root.message === 'string' ? (
              <div className='mb-4 text-center text-sm text-red-600'>{errors.root.message}</div>
            ) : null}
            <form onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    className='text-sm font-medium text-gray-700'
                    htmlFor='email'
                  >
                    Email Address
                  </Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 size-4 -translate-y-1/2 transform text-gray-400' />
                    <Input
                      className='h-11 border-gray-300 pl-10'
                      id='email'
                      placeholder='Enter your email'
                      type='email'
                      {...register('email')}
                    />
                    {errors.email && typeof errors.email.message === 'string' ? (
                      <span className='text-xs text-red-600'>{errors.email.message}</span>
                    ) : null}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    className='text-sm font-medium text-gray-700'
                    htmlFor='password'
                  >
                    Password
                  </Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 size-4 -translate-y-1/2 transform text-gray-400' />
                    <Input
                      className='h-11 border-gray-300 px-10'
                      id='password'
                      placeholder='Enter your password'
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                    />
                    <button
                      className='absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
                      type='button'
                      onClick={() => {
                        setShowPassword(!showPassword);
                      }}
                    >
                      {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                    </button>
                    {errors.password && typeof errors.password.message === 'string' ? (
                      <span className='text-xs text-red-600'>{errors.password.message}</span>
                    ) : null}
                  </div>
                </div>

                <Button
                  className='h-11 w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 font-medium text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl'
                  type='submit'
                >
                  Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className='mt-8 text-center text-xs text-gray-500'>
          <p>© 2024 VRICH. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
