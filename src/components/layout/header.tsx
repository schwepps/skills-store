import Link from 'next/link';
import { Github, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubmitRepoDialog } from '@/components/repo/submit-repo-dialog';
import { RequestSkillDialog } from '@/components/skill/request-skill-dialog';

export function Header() {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container-page flex h-14 items-center justify-between">
        <Link href="/" className="flex shrink-0 items-center text-xl font-bold">
          Skills Store
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <SubmitRepoDialog />
          {/* Free tier: Suggest a skill (community backlog) */}
          <RequestSkillDialog />
          {/* Paid tier: Custom Development */}
          <Button size="sm" asChild>
            <Link href="/custom">
              <Sparkles className="h-4 w-4 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Custom Development</span>
            </Link>
          </Button>
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
