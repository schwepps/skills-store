import Link from 'next/link';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubmitRepoDialog } from '@/components/repo/submit-repo-dialog';
import { RequestSkillDialog } from '@/components/skill/request-skill-dialog';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container-page flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center shrink-0 font-bold text-xl">
          Skills Store
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <SubmitRepoDialog />
          <RequestSkillDialog />
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com/schwepps/skills-store"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
