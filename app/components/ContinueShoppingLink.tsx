import Link from 'next/link';

interface ContinueShoppingLinkProps {
  variant?: 'button' | 'text';
  className?: string;
}

export default function ContinueShoppingLink({
  variant = 'button',
  className = '',
}: ContinueShoppingLinkProps) {
  return (
    <Link
      href='/shop'
      className={`${
        variant === 'button'
          ? 'w-full sm:text-lg font-normal btn rounded-[0.625rem] sm:py-4 py-3 disabled:opacity-60 cursor-pointer inline-flex items-center justify-center'
          : 'sm:text-lg link-class-underline cursor-pointer'
      } ${className}`}
    >
      Continue Shopping
    </Link>
  );
}
