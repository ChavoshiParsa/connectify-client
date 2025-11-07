import { z } from 'zod';

export const schemaWithTranslation = (t: (key: string) => string) =>
  z.object({
    email: z.email(t('invalid_email')).min(1, t('email_required')),
    password: z.string().min(1, t('password_required')).min(8, t('password_min_length')),
  });

const dataUrlRegex = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/;

export const RegistrationSchemaWithTranslation = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().min(2, t('first_name_required')),
    lastName: z.string().optional(),
    profilePhoto: z.instanceof(File).optional(), // you keep it if you want
    avatarBase64: z.string().regex(dataUrlRegex, 'INVALID_IMAGE').optional(),
  });

export type RegistrationFormType = z.infer<ReturnType<typeof RegistrationSchemaWithTranslation>>;
export type TranslatedSchemaType = z.infer<ReturnType<typeof schemaWithTranslation>>;
