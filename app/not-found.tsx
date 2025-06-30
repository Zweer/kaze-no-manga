import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center space-y-4 text-center px-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-muted-foreground">
          Oops! The page you are looking for does not exist.
        </p>
        <Link href="/" className={cn(buttonVariants({ variant: 'default' }), 'mt-4')}>
          Go back home
        </Link>
      </main>
    </div>
  );
}
