'use client';

import { useState } from 'react';
import { Copy, Check, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TIMING } from '@/lib/config/timing';
import type { ExamplePrompt } from '@/lib/types';

interface SkillExamplesProps {
  prompts: ExamplePrompt[];
}

export function SkillExamples({ prompts }: SkillExamplesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!prompts || prompts.length === 0) {
    return null;
  }

  const handleCopy = async (prompt: string, index: number) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), TIMING.CLIPBOARD_FEEDBACK_MS);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          Example Prompts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {prompts.map((example, index) => (
          <div
            key={index}
            className="group relative rounded-lg border bg-muted/50 p-4 hover:bg-muted/70 transition-colors"
          >
            {example.title && (
              <p className="mb-2 font-medium text-sm text-foreground">
                {example.title}
              </p>
            )}
            <p className="text-sm text-muted-foreground pr-12 whitespace-pre-wrap">
              {example.prompt}
            </p>
            {example.expectedOutcome && (
              <p className="mt-2 text-xs text-muted-foreground/70 italic">
                Expected: {example.expectedOutcome}
              </p>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleCopy(example.prompt, index)}
              aria-label="Copy prompt"
            >
              {copiedIndex === index ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
