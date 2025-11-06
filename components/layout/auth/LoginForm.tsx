'use client';

import { login } from '@/api/auth';
import { AuthPageMode } from '@/app/auth/page';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { FormSchema, schemaWithTranslation } from '@/schemas/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { LoaderCircle, Lock, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import IconInput from '../../common/IconInput';
import SignUpModal from './SignUpModal';

export default function LoginForm({ pageMode }: { pageMode: AuthPageMode }) {
  const isSignInForm = pageMode === 'sign-in';

  const t = useTranslations('LoginPage');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(schemaWithTranslation(t)),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async (values: z.infer<typeof FormSchema>) => {
      const { email, password } = values;
      return await login(email, password);
    },
    onSuccess: () => {
      toast.success(t('success_sign_in'));
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        toast.error(typeof msg === 'string' ? t(msg) : t('error_generic'));
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error(t('error_generic'));
      }
    },
  });

  const onSubmit = (values: z.infer<typeof FormSchema>) => {
    if (isSignInForm) {
      mutate(values);
    } else {
      setTempEmail(values.email);
      setTempPassword(values.password);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <SignUpModal open={isModalOpen} setOpen={setIsModalOpen} email={tempEmail} password={tempPassword} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <IconInput icon={Mail} type="email" placeholder={t('email')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <IconInput icon={Lock} type="password" placeholder={t('password')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            className="mt-8 w-full bg-sky-500 py-6 text-lg font-bold text-white transition hover:bg-sky-600 active:scale-[.97] dark:bg-sky-600 dark:hover:bg-sky-700"
            type="submit"
            disabled={isPending}
          >
            {!isPending ? (
              t(isSignInForm ? 'sign_in' : 'sign_up')
            ) : (
              <LoaderCircle className="max-h-6 min-h-6 max-w-6 min-w-6 animate-spin text-zinc-800 dark:text-zinc-200" />
            )}
          </Button>
        </form>
        <p className="mt-2 text-sm text-zinc-500">
          {t(isSignInForm ? 'no_account' : 'already_account')}{' '}
          <Link
            className="cursor-pointer bg-transparent font-bold text-sky-500 hover:underline"
            href={`/auth?page=${!isSignInForm ? 'sign-in' : 'sign-up'}`}
          >
            {t(!isSignInForm ? 'sign_in' : 'sign_up')}
          </Link>
        </p>
      </Form>
    </>
  );
}
