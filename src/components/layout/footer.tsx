import Link from 'next/link';
import { Heart, Sparkles } from 'lucide-react';
import { SyncStatus } from '@/components/sync/sync-status';

export function Footer() {
  return (
    <footer className="mt-16 border-t py-8">
      <div className="container-page">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              Made with <Heart className="h-4 w-4 text-red-500" aria-hidden="true" /> for the Claude
              community
            </p>
            <SyncStatus />
          </div>
          <Link
            href="/custom"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Need a custom skill?
          </Link>
        </div>
      </div>
    </footer>
  );
}
