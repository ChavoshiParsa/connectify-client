'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LucideProps } from 'lucide-react';
import { InputHTMLAttributes } from 'react';

interface EmailInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  inputClassname?: string;
}

export default function IconInput({ icon: Icon, type, placeholder, inputClassname, ...props }: EmailInputProps) {
  return (
    <div className="relative w-full">
      <Input className={cn('w-full px-12 py-6', inputClassname)} type={type} placeholder={placeholder} {...props} />
      <Icon className="absolute inset-s-4 top-1/2 max-h-6 min-h-6 max-w-6 min-w-6 -translate-y-1/2 transform text-zinc-800 dark:text-zinc-200" />
    </div>
  );
}
