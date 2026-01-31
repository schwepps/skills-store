'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SkillError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Skill page error:', error);
  }, [error]);

  return (
    <div className="container-narrow py-16 text-center">
      <div className="mx-auto max-w-md">
        <AlertTriangle className="text-destructive mx-auto mb-4 h-16 w-16" />
        <h2 className="mb-4 text-2xl font-semibold">Unable to load skill</h2>
        <p className="text-muted-foreground mb-8">
          We couldn&apos;t load this skill&apos;s details. This might be a temporary issue.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to store
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
