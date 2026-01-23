'use client';

import { useState } from 'react';
import { Copy, Check, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TIMING } from '@/lib/config/timing';

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
      setTimeout(() => setCopied(false), TIMING.CLIPBOARD_FEEDBACK_MS);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          'group flex items-center gap-2 text-xs w-full',
          'bg-muted/50 hover:bg-muted',
          'border border-border/50 hover:border-border',
          'px-3 py-2 rounded-md',
          'transition-all duration-200 cursor-pointer text-left',
          copied && 'bg-green-500/10 border-green-500/30',
          className
        )}
        title={`Click to copy: ${command}`}
        aria-label="Copy install command to clipboard"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
        ) : (
          <Clipboard className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="flex-1 truncate font-mono text-muted-foreground">
          {copied ? (
            <span className="text-green-600 font-sans">Copied to clipboard!</span>
          ) : (
            <span className="opacity-70">npx skills add ... --skill {skillName}</span>
          )}
        </span>
        {!copied && (
          <span className="text-[10px] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors shrink-0">
            click to copy
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Install via skills.sh
        </span>
        <a
          href="https://skills.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          What&apos;s this? &rarr;
        </a>
      </div>
      <div
        className={cn(
          'group relative rounded-lg overflow-hidden',
          'bg-muted/50 border border-border',
          copied && 'bg-green-500/10 border-green-500/30'
        )}
      >
        <div className="p-4 pr-24">
          <p className="text-xs text-muted-foreground mb-2">
            Copy and paste in your terminal:
          </p>
          <code className="text-sm font-mono text-foreground break-all">
            {command}
          </code>
        </div>
        <Button
          variant={copied ? 'default' : 'secondary'}
          size="sm"
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'transition-all duration-200',
            copied && 'bg-green-600 hover:bg-green-600'
          )}
          onClick={handleCopy}
          aria-label="Copy command to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
