'use client';

import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InstallCommandProps {
  owner: string;
  repo: string;
  skillName: string;
  /** Compact mode for card display */
  compact?: boolean;
  className?: string;
}

export function InstallCommand({
  owner,
  repo,
  skillName,
  compact = false,
  className,
}: InstallCommandProps) {
  const [copied, setCopied] = useState(false);

  const command = `npx skills add ${owner}/${repo} --skill ${skillName}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          'group flex items-center gap-2 text-xs font-mono w-full',
          'bg-muted/50 hover:bg-muted px-3 py-2 rounded-md',
          'transition-colors cursor-pointer text-left',
          className
        )}
        title="Copy install command"
        aria-label="Copy install command"
      >
        <Terminal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground truncate flex-1">
          npx skills add {owner}/{repo}
        </span>
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        )}
      </button>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          Install via skills.sh
        </span>
        <a
          href="https://skills.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Learn more &rarr;
        </a>
      </div>
      <div className="group relative">
        <pre className="bg-muted rounded-lg p-4 pr-12 text-sm font-mono overflow-x-auto">
          <code>{command}</code>
        </pre>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
          aria-label="Copy install command"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
