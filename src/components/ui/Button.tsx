import { ButtonHTMLAttributes, forwardRef } from 'react';
import { classNames } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={[
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          variant === 'primary' ? 'bg-red-600 text-white hover:bg-red-700' : '',
          variant === 'secondary' ? 'bg-gray-600 text-white hover:bg-gray-700' : '',
          variant === 'outline' ? 'border border-gray-300 bg-white hover:bg-gray-50' : '',
          variant === 'ghost' ? 'hover:bg-gray-100' : '',
          size === 'sm' ? 'h-8 px-3 text-sm' : '',
          size === 'md' ? 'h-10 px-4' : '',
          size === 'lg' ? 'h-12 px-6 text-lg' : '',
          className || ''
        ].filter(Boolean).join(' ')}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
