'use client';

import { AuthPageMode } from '@/app/auth/page';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { schemaWithTranslation, TranslatedSchemaType } from '@/schemas/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Lock, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import IconInput from '../../common/IconInput';
import SignUpModal from './SignUpModal';
import { authService } from '@/api/auth';

export default function LoginForm({ pageMode }: { pageMode: AuthPageMode }) {
  const isSignInForm = pageMode === 'sign-in';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const router = useRouter();
  const t = useTranslations('LoginPage');

  const form = useForm<TranslatedSchemaType>({
    resolver: zodResolver(schemaWithTranslation(t)),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async (values: TranslatedSchemaType) => {
      const { email, password } = values;
      return await authService.login(email, password);
    },
    onSuccess: () => {
      router.replace('/home');
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

  const validateMutation = useMutation({
    mutationKey: ['auth', 'validate'],
    mutationFn: async (values: TranslatedSchemaType) => {
      const { email, password } = values;
      return await authService.validateEmailPass(email, password);
    },
    onSuccess: (data) => {
      const { email, password } = data;
      if (email.ok && password.ok) {
        setIsModalOpen(true);
      } else {
        if (email?.reason) toast.warning(t(email?.reason));
        if (password?.issues?.length > 0) password?.issues?.map((p: string) => toast.warning(t(p)));
      }
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

  const onSubmit = (values: TranslatedSchemaType) => {
    if (isSignInForm) {
      loginMutation.mutate(values);
    } else {
      setTempEmail(values.email);
      setTempPassword(values.password);
      validateMutation.mutate(values);
    }
  };

  return (
    <>
      <form className="w-full" id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="space-y-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <IconInput
                    id="email-input"
                    type="email"
                    icon={Mail}
                    placeholder={t('email')}
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <IconInput
                    id="password-input"
                    type="password"
                    icon={Lock}
                    placeholder={t('password')}
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
          <Button
            className="mt-8 w-full bg-sky-500 py-6 text-lg font-bold text-white transition hover:bg-sky-600 active:scale-[.97] dark:bg-sky-600 dark:hover:bg-sky-700"
            type="submit"
            form="login-form"
            disabled={loginMutation.isPending || validateMutation.isPending}
          >
            {loginMutation.isPending || validateMutation.isPending ? (
              <Spinner className="size-6 text-zinc-800 dark:text-zinc-200" />
            ) : (
              t(isSignInForm ? 'sign_in' : 'sign_up')
            )}
          </Button>
        </FieldGroup>
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
      <SignUpModal open={isModalOpen} setOpenAction={setIsModalOpen} email={tempEmail} password={tempPassword} />
    </>
  );
}
