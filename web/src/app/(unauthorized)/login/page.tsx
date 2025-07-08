'use client';

import { useCallback, useState } from 'react';

import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const res = await signIn('credentials', { redirect: false, email, password });
      if (!res?.ok) {
        // setError email
        // setError password
      }
    },
    [email, password]
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
            <form
              onSubmit={(e) => {
                void handleSubmit(e);
              }}
            >
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
                      required
                      className='h-11 border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500'
                      id='email'
                      placeholder='Enter your email'
                      type='email'
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                    />
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
                      required
                      className='h-11 border-gray-300 px-10 focus:border-blue-500 focus:ring-blue-500'
                      id='password'
                      placeholder='Enter your password'
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
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
