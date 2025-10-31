import { z } from 'zod';

export const FormSchema = z.object({
  email: z.email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters long'),
});

export const schemaWithTranslation = (t: (key: string) => string) =>
  z.object({
    email: z.email(t('invalid_email')).min(1, t('email_required')),
    password: z.string().min(1, t('password_required')).min(8, t('password_min_length')),
  });
