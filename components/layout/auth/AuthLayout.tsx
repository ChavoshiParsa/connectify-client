'use client';

import { AuthPageMode } from '@/app/auth/page';
import { useApp } from '@/hooks/app/use-app';
import { withBasePath } from '@/lib/app-path';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import Image from 'next/image';
import LoginForm from './LoginForm';
import LoginNavbar from './LoginNavbar';

export default function AuthLayout({ initialPage }: { initialPage: AuthPageMode }) {
  const isSignInPage = initialPage === 'sign-in';
  const pageKey = isSignInPage ? 'sign_in' : 'sign_up';
  const { isRtl } = useApp();
  const f = isRtl ? 1 : -1;

  return (
    <main
      key={isSignInPage ? 'sign-in' : 'sign-up'}
      className={cn('flex size-full items-center', isSignInPage ? 'flex-row' : 'flex-row-reverse')}
    >
      <motion.aside
        className="z-10 h-full w-0 md:w-1/2"
        initial={{ x: isSignInPage ? `${f * 100}%` : `${f * -100}%`, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: isSignInPage ? `${f * -100}%` : `${f * 100}%`, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        <div className="relative size-full">
          <Image
            className="object-cover object-center"
            fill
            src={withBasePath(isSignInPage ? '/images/city.jpg' : '/images/mountain.jpg')}
            alt={isSignInPage ? 'City view' : 'Mountain view'}
            sizes="(max-width: 768px) 100vw, 58.33vw"
            priority
          />
        </div>
      </motion.aside>
      <motion.section
        className="flex size-full flex-col items-center justify-start space-y-24 p-2 md:w-1/2 md:p-6"
        initial={{ x: isSignInPage ? `${f * -100}%` : `${f * 100}%`, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: isSignInPage ? `${f * 100}%` : `${f * -100}%`, opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        <LoginNavbar page={pageKey} />
        <div className="flex size-full flex-col items-center space-y-5 md:items-start">
          <LoginForm pageMode={isSignInPage ? 'sign-in' : 'sign-up'} />
        </div>
      </motion.section>
    </main>
  );
}
