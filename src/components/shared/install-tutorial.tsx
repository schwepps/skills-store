'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Folder, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    icon: Download,
    title: '1. Download',
    description:
      'Click "Download" to get the skill ZIP file.',
  },
  {
    icon: Folder,
    title: '2. Extract',
    description: 'Unzip to get the skill folder.',
  },
  {
    icon: Settings,
    title: '3. Install',
    description:
      'Copy the folder into your Claude capabilities (commands folder).',
  },
];

export function InstallTutorial() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mt-12">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            How to install a skill?
          </CardTitle>
          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          'grid gap-6 transition-all',
          isExpanded
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0 overflow-hidden'
        )}
      >
        <div className="grid gap-6 md:grid-cols-3 overflow-hidden">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="mb-4 p-3 rounded-full bg-primary/10">
                <step.icon
                  className="h-6 w-6 text-primary"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <a
              href="https://github.com/anthropics/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View official documentation →
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
