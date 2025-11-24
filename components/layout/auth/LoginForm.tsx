'use client';

import { AuthPageMode } from '@/app/auth/page';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { useLogin, useValidate } from '@/hooks/data/use-auth';
import { schemaWithTranslation, TranslatedSchemaType } from '@/schemas/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import IconInput from '../../common/IconInput';
import SignUpModal from './SignUpModal';

export default function LoginForm({ pageMode }: { pageMode: AuthPageMode }) {
  const isSignInForm = pageMode === 'sign-in';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const t = useTranslations('LoginPage');

  const form = useForm<TranslatedSchemaType>({
    resolver: zodResolver(schemaWithTranslation(t)),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const validate = useValidate(setIsModalOpen);
  const login = useLogin();

  const onSubmit = (values: TranslatedSchemaType) => {
    if (isSignInForm) {
      login.mutate(values);
    } else {
      setTempEmail(values.email);
      setTempPassword(values.password);
      validate.mutate(values);
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
            disabled={login.isPending || validate.isPending}
          >
            {login.isPending || validate.isPending ? (
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
