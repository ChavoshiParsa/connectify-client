'use client';

import { register } from '@/api/auth';
import IconInput from '@/components/common/IconInput';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { compressImageToTarget } from '@/lib/image-compress';
import { RegistrationFormType, RegistrationSchemaWithTranslation } from '@/schemas/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { ImageMinus, ImagePlus, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  setOpenAction: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
  password: string;
};

export default function SignUpModal({ open, setOpenAction: setOpen, email, password }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const router = useRouter();
  const t = useTranslations('RegistrationModal');

  const form = useForm<RegistrationFormType>({
    resolver: zodResolver(RegistrationSchemaWithTranslation(t)),
    defaultValues: {
      firstName: '',
      lastName: '',
      profilePhoto: undefined,
      avatarBase64: undefined,
    },
  });

  const registerMutation = useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: async (values: RegistrationFormType) => {
      const { firstName, lastName, avatarBase64 } = values;
      return await register(email, password, firstName, lastName, avatarBase64);
    },
    onSuccess: () => {
      toast.success(t('success_sign_up'));
      setOpen(false);
      router.replace('/home');
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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = /^image\//.test(file.type);
      if (!isImage) {
        toast.error(t('error_invalid_image_type'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('error_image_too_large')); // >5MB raw
        return;
      }

      try {
        const { dataUrl } = await compressImageToTarget(file, {
          targetKB: 50,
          maxWidth: 512,
          maxHeight: 512,
        });

        form.setValue('profilePhoto', file);
        form.setValue('avatarBase64', dataUrl, { shouldValidate: true });
        setPreview(dataUrl);
      } catch (err) {
        console.error(err);
        toast.error(t('error_compress_failed'));
      }
    }
  };

  const onSubmit = (values: RegistrationFormType) => {
    registerMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="xs:p-6 rounded-2xl p-4 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold md:text-3xl">{t('title')}</DialogTitle>
          <DialogDescription className="mb-4 text-center text-sm text-gray-400 md:text-base">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex w-full items-center justify-center"
          id="register-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="profilePhoto"
              control={form.control}
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <label
                    htmlFor="profilePhoto"
                    className="group relative flex max-h-40 min-h-40 max-w-40 min-w-40 cursor-pointer items-center justify-center self-center overflow-hidden rounded-4xl border-2 border-dashed border-zinc-400 transition-all hover:border-3 hover:border-sky-500 dark:border-zinc-600 dark:hover:border-sky-600"
                  >
                    {!preview ? (
                      <ImagePlus className="size-10 transition-transform group-hover:scale-120" />
                    ) : (
                      <Image
                        className="absolute h-full w-full object-cover object-center"
                        fill
                        src={preview}
                        alt="Profile Preview"
                        sizes="(max-width: 768px) 100vw, 58.33vw"
                        priority
                      />
                    )}
                    {preview && (
                      <Button
                        className="bg-secondary/60 invisible z-10 w-full cursor-pointer self-end rounded-none group-hover:visible"
                        variant="secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          form.setValue('profilePhoto', undefined);
                          setPreview(null);
                        }}
                      >
                        <ImageMinus className="text-destructive size-8" />
                      </Button>
                    )}
                  </label>
                  <input
                    id="profilePhoto"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="my-4 space-y-4">
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <IconInput
                      id="first-name-input"
                      type="text"
                      icon={User}
                      placeholder={t('first_name_placeholder')}
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <IconInput
                      id="last-name-input"
                      type="text"
                      icon={User}
                      placeholder={t('last_name_placeholder')}
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
              className="w-full bg-sky-500 py-6 text-lg font-bold text-white transition hover:bg-sky-600 active:scale-[.97] dark:bg-sky-600 dark:hover:bg-sky-700"
              type="submit"
              form="register-form"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <Spinner className="size-6 text-zinc-800 dark:text-zinc-200" />
              ) : (
                t('continue_button')
              )}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
