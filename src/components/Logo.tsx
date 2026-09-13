import Link from 'next/link';
import { Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function Logo({ size = 'md', className }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center gap-3 group', className)}>
      <span
        className={cn(
          'flex items-center justify-center rounded-xl bg-gradient-to-br from-[#008CFF] to-[#147EFF] shadow-[0_0_20px_rgba(0,140,255,0.35)] transition-transform group-hover:scale-105',
          size === 'md' ? 'h-10 w-10' : 'h-9 w-9'
        )}
      >
        <Code2 size={size === 'md' ? 22 : 18} className="text-white" />
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            'font-bold text-white tracking-tight',
            size === 'md' ? 'text-lg' : 'text-base'
          )}
        >
          Sys<span className="text-[#00AAFF]">Dictionary</span>
        </span>
        <span className="text-[11px] text-[#8BA3BF]">Diccionario técnico · ISC</span>
      </span>
    </Link>
  );
}