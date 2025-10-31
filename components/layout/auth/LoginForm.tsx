'use client';

import { AuthPageMode } from '@/app/auth/page';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { FormSchema, schemaWithTranslation } from '@/schemas/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { LoaderCircle, Lock, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import IconInput from '../../common/IconInput';
import SignUpModal from './SignUpModal';

export default function LoginForm({ pageMode }: { pageMode: AuthPageMode }) {
  const isSignInForm = pageMode === 'sign-in';
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('LoginPage');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    router.refresh();
  }, [router]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(schemaWithTranslation(t)),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // const onSubmit = async (values: z.infer<typeof FormSchema>) => {
  //   const { email, password } = values;
  //   setLoading(true);
  //   try {
  //     if (!isSignInForm) {
  //       setIsModalOpen(true);
  //       // await apiClient.post('register', { email, password });
  //     }
  //     const signInData = await signIn('credentials', {
  //       email,
  //       password,
  //       redirect: false,
  //     });
  //     if (signInData?.ok) {
  //       toast.success(t(isSignInForm ? 'success_sign_in' : 'success_sign_up'));
  //       router.push('/home');
  //     } else if (signInData?.error) {
  //       toast.error(t(signInData.error));
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       toast.error(t(error.response?.data.message));
  //     } else if (error instanceof Error) {
  //       toast.error(error.message);
  //     } else {
  //       toast.error(`${error}`);
  //     }
  //   }
  //   setLoading(false);
  // };

  return (
    <>
      <SignUpModal open={isModalOpen} setOpen={setIsModalOpen} />
      <Form {...form}>
        <form
          // onSubmit={form.handleSubmit(onSubmit)}
          className="w-full"
        >
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
            disabled={loading}
          >
            {!loading ? (
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
