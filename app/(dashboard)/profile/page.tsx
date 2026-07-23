'use client';

import MobileDrawer from '@/components/layout/drawer/MobileDrawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { gradientAvatarClasses } from '@/constants/avatar-colors';
import { useWindowWidth } from '@/hooks/app/use-window-width';
import { useUpdateAvatar, useUpdateProfile } from '@/hooks/data/use-users';
import { usersService } from '@/api/users';
import { compressImageToTarget, dataUrlToFile } from '@/lib/image-compress';
import { useAuthStore } from '@/stores/auth-store';
import { Camera, ImagePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { isXs } = useWindowWidth();
  const t = useTranslations('ProfilePage');
  const user = useAuthStore((state) => state.user);
  const updateAvatar = useUpdateAvatar();
  const updateProfile = useUpdateProfile();
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [biography, setBiography] = useState('');

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName ?? '');
    setUsername(user.username);
    setBiography(user.biography ?? '');
  }, [user]);

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
        targetKB: 350,
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

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUsername = username.trim().toLowerCase();

    if (!firstName.trim() || firstName.trim().length > 24) return toast.error(t('invalid_first_name'));
    if (lastName.trim().length > 24) return toast.error(t('invalid_last_name'));
    if (!/^[a-z][a-z0-9_]{2,11}$/.test(normalizedUsername)) return toast.error(t('invalid_username'));
    if (biography.trim().length > 128) return toast.error(t('invalid_biography'));

    try {
      if (normalizedUsername !== user?.username && !(await usersService.checkUsername(normalizedUsername))) {
        toast.error(t('username_taken'));
        return;
      }

      await updateProfile.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
        username: normalizedUsername,
        biography: biography.trim() || null,
      });
      toast.success(t('profile_saved'));
    } catch {
      toast.error(t('profile_save_failed'));
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
    <div className="xs:ms-14 xs:w-[calc(100%-3.5rem)] flex h-full w-full items-start gap-2 overflow-y-auto bg-zinc-100 p-2 md:m-0 md:w-full dark:bg-zinc-950">
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

        <form className="bg-card grid gap-5 rounded-2xl border p-6 shadow-sm" onSubmit={saveProfile}>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="profile-first-name">{t('first_name')}</Label>
              <Input
                id="profile-first-name"
                value={firstName}
                maxLength={24}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-last-name">{t('last_name')}</Label>
              <Input
                id="profile-last-name"
                value={lastName}
                maxLength={24}
                placeholder={t('optional')}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="profile-username">{t('username')}</Label>
            <Input
              id="profile-username"
              value={username}
              maxLength={12}
              autoCapitalize="none"
              spellCheck={false}
              onChange={(event) => setUsername(event.target.value.toLowerCase())}
              required
            />
            <p className="text-muted-foreground text-xs">{t('username_help')}</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="profile-biography">{t('biography')}</Label>
            <Textarea
              id="profile-biography"
              className="min-h-32 resize-y"
              value={biography}
              maxLength={128}
              placeholder={t('biography_placeholder')}
              onChange={(event) => setBiography(event.target.value)}
            />
            <span className="text-muted-foreground text-end text-xs">{biography.length}/128</span>
          </div>

          <Button className="justify-self-end" type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? t('saving_profile') : t('save_profile')}
          </Button>
        </form>
      </main>
    </div>
  );
}
