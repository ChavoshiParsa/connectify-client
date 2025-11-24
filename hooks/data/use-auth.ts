import { authService } from '@/api/auth';
import { RegistrationFormType, TranslatedSchemaType } from '@/schemas/schemas';
import { LoginResponse, RegisterResponse, ValidateResponse } from '@/types/auth';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useValidate(setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>) {
  const t = useTranslations('LoginPage');

  return useMutation<ValidateResponse, unknown, TranslatedSchemaType>({
    mutationFn: ({ email, password }) => authService.validateEmailPass(email, password),
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
}

export function useLogin() {
  const t = useTranslations('LoginPage');
  const router = useRouter();

  return useMutation<LoginResponse, unknown, TranslatedSchemaType>({
    mutationFn: ({ email, password }) => authService.login(email, password),
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
}

export function useRegister(
  email: string,
  password: string,
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const t = useTranslations('RegistrationModal');
  const router = useRouter();

  return useMutation<RegisterResponse, unknown, RegistrationFormType>({
    mutationFn: ({ firstName, lastName, avatarBase64 }) =>
      authService.register(email, password, firstName, lastName, avatarBase64),
    onSuccess: () => {
      toast.success(t('success_sign_up'));
      setIsModalOpen(false);
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
}
