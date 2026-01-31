import { Heart, MessageSquare } from 'lucide-react';
import { SyncStatus } from '@/components/sync/sync-status';

const CUSTOM_SKILL_URL = 'https://github.com/schwepps/skills-store/discussions/1';

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
          <a
            href={CUSTOM_SKILL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Need a custom skill?
          </a>
        </div>
      </div>
    </footer>
  );
}
