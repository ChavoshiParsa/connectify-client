'use client';

import { pushNotificationsService } from '@/api/push-notifications';
import { Button } from '@/components/ui/button';
import { usePwa } from '@/components/providers/PwaProvider';
import { Bell, BellRing, Check, Download, LoaderCircle, Volume2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PwaSettings() {
  const t = useTranslations('PreferencesPage');
  const [testLoading, setTestLoading] = useState(false);
  const {
    isInstalled,
    canPromptInstall,
    installApp,
    notificationSupported,
    notificationPermission,
    notificationsEnabled,
    notificationLoading,
    enableNotifications,
    disableNotifications,
  } = usePwa();

  const handleInstall = async () => {
    if (!canPromptInstall) {
      toast.info(t('install_manual'));
      return;
    }

    await installApp();
  };

  const handleNotifications = async () => {
    try {
      if (notificationsEnabled) {
        await disableNotifications();
        toast.success(t('notifications_disabled'));
        return;
      }

      const enabled = await enableNotifications();
      if (enabled) {
        toast.success(t('notifications_enabled'));
      } else if (notificationPermission === 'denied' || Notification.permission === 'denied') {
        toast.error(t('notifications_blocked_help'));
      }
    } catch {
      toast.error(t('notifications_error'));
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    try {
      const result = await pushNotificationsService.sendTest();
      if (result.sent > 0) {
        toast.success(t('test_notification_sent'));
      } else {
        toast.error(t('test_notification_none'));
      }
    } catch {
      toast.error(t('notifications_error'));
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <section className="bg-card divide-y overflow-hidden rounded-2xl border shadow-sm">
      <div className="flex flex-col items-stretch gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-muted grid size-10 shrink-0 place-items-center rounded-xl">
            <Download className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-medium">{t('install_app')}</h2>
            <p className="text-muted-foreground text-sm">{isInstalled ? t('installed_help') : t('install_app_help')}</p>
          </div>
        </div>
        <Button
          className="w-full sm:w-auto"
          variant={isInstalled ? 'secondary' : 'outline'}
          onClick={handleInstall}
          disabled={isInstalled}
        >
          {isInstalled && <Check />}
          {isInstalled ? t('installed') : t('install')}
        </Button>
      </div>

      <div className="flex flex-col items-stretch gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-muted grid size-10 shrink-0 place-items-center rounded-xl">
            <Bell className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-medium">{t('message_notifications')}</h2>
            <p className="text-muted-foreground text-sm">
              {!notificationSupported
                ? t('notifications_unsupported')
                : notificationPermission === 'denied'
                  ? t('notifications_blocked_help')
                  : t('message_notifications_help')}
            </p>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          {notificationsEnabled && (
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              onClick={handleTestNotification}
              disabled={testLoading}
            >
              {testLoading ? <LoaderCircle className="animate-spin" /> : <BellRing />}
              {t('send_test')}
            </Button>
          )}
          <Button
            className="w-full sm:w-auto"
            variant={notificationsEnabled ? 'secondary' : 'outline'}
            onClick={handleNotifications}
            disabled={!notificationSupported || notificationLoading || notificationPermission === 'denied'}
          >
            {notificationLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : notificationsEnabled ? (
              <Check />
            ) : (
              <Bell />
            )}
            {notificationsEnabled ? t('enabled') : t('enable')}
          </Button>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3 p-5">
        <span className="bg-muted grid size-10 shrink-0 place-items-center rounded-xl">
          <Volume2 className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-medium">{t('notification_sound')}</h2>
          <p className="text-muted-foreground text-sm">{t('notification_sound_help')}</p>
        </div>
      </div>
    </section>
  );
}
