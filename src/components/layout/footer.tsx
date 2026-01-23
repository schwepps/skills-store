import { Heart } from 'lucide-react';
import { SyncStatus } from '@/components/sync/sync-status';

export function Footer() {
  return (
    <footer className="border-t py-8 mt-16">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Made with{' '}
              <Heart className="h-4 w-4 text-red-500" aria-hidden="true" /> for
              the Claude community
            </p>
            <SyncStatus />
          </div>
        </div>
      </div>
    </footer>
  );
}
