'use client';

import MobileDrawer from '@/components/layout/drawer/MobileDrawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { gradientAvatarClasses } from '@/constants/avatar-colors';
import { useWindowWidth } from '@/hooks/app/use-window-width';
import { useUpdateAvatar } from '@/hooks/data/use-users';
import { compressImageToTarget, dataUrlToFile } from '@/lib/image-compress';
import { useAuthStore } from '@/stores/auth-store';
import { Camera, ImagePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { isXs } = useWindowWidth();
  const t = useTranslations('ProfilePage');
  const user = useAuthStore((state) => state.user);
  const updateAvatar = useUpdateAvatar();
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fallback = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase();

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('invalid_type'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('too_large'));
      return;
    }

    try {
      const { dataUrl, mime } = await compressImageToTarget(file, {
        targetKB: 50,
        maxWidth: 512,
        maxHeight: 512,
      });
      const extension = mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1];
      setSelectedAvatar(dataUrlToFile(dataUrl, `avatar.${extension}`));
      setPreview(dataUrl);
    } catch {
      toast.error(t('compress_failed'));
    }
  };

  const saveAvatar = async () => {
    if (!selectedAvatar) return;
    try {
      await updateAvatar.mutateAsync(selectedAvatar);
      setSelectedAvatar(null);
      setPreview(null);
      toast.success(t('saved'));
    } catch {
      toast.error(t('save_failed'));
    }
  };

  return (
    <div className="xs:ms-14 xs:w-[calc(100%-3.5rem)] flex h-full w-full items-start gap-2 bg-zinc-100 p-2 md:m-0 md:w-full dark:bg-zinc-950">
      {!isXs && <MobileDrawer />}
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>
        </div>

        <section className="bg-card text-card-foreground flex flex-col items-center gap-5 rounded-2xl border p-6 shadow-sm sm:flex-row">
          <label className="group relative cursor-pointer" htmlFor="avatar-upload">
            <Avatar className="size-32 rounded-3xl">
              <AvatarImage
                className="rounded-3xl object-cover"
                src={preview ?? user?.avatarUrl ?? ''}
                alt={t('avatar_alt')}
              />
              <AvatarFallback
                className={`rounded-3xl text-3xl text-white ${gradientAvatarClasses[user?.avatarColor ?? 'SKY']}`}
              >
                {fallback || <ImagePlus className="size-8" />}
              </AvatarFallback>
            </Avatar>
            <span className="absolute right-2 bottom-2 grid size-9 place-items-center rounded-full bg-sky-600 text-white shadow-md transition-transform group-hover:scale-110">
              <Camera className="size-4" />
            </span>
          </label>
          <input
            id="avatar-upload"
            className="hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleAvatarChange}
          />

          <div className="flex flex-1 flex-col items-center gap-3 text-center sm:items-start sm:text-start">
            <div>
              <h2 className="text-lg font-semibold">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-muted-foreground text-sm">@{user?.username}</p>
            </div>
            <p className="text-muted-foreground text-sm">{t('photo_help')}</p>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <label className="cursor-pointer" htmlFor="avatar-upload">
                  {t('choose')}
                </label>
              </Button>
              <Button onClick={saveAvatar} disabled={!selectedAvatar || updateAvatar.isPending}>
                {updateAvatar.isPending ? t('saving') : t('save')}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
