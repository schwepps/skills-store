import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t py-8 mt-16">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with{' '}
            <Heart className="h-4 w-4 text-red-500" aria-hidden="true" /> for
            the Claude community
          </p>

          <nav className="flex gap-6">
            <a
              href="https://github.com/schwepps/skills-store/issues/new?template=add-repo.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Submit a repo
            </a>
            <a
              href="https://github.com/schwepps/skills-store"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contribute
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
