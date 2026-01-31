'use client';

import { useState, useActionState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Loader2, ExternalLink, XCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { requestSkillAction, type RequestSkillState } from '@/lib/actions/request-skill';
import { SKILL_REQUEST_CATEGORIES } from '@/lib/categories';

export function SuggestSkillLink() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    examplePrompts: '',
  });

  const [state, action, isPending] = useActionState<RequestSkillState, FormData>(
    requestSkillAction,
    { status: 'idle' }
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setFormData({ name: '', category: '', description: '', examplePrompts: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="text-primary hover:underline">suggest a skill</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Suggest a New Skill</DialogTitle>
          <DialogDescription>
            Suggest a skill for the community backlog. Community suggestions are reviewed but not
            guaranteed to be built.
          </DialogDescription>
        </DialogHeader>

        {state.status === 'success' ? (
          <div className="py-6">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <p className="text-lg font-medium">Suggestion Submitted!</p>
              <p className="text-muted-foreground mt-2">
                Your skill suggestion has been added to the community backlog.
              </p>
              <a
                href={state.issueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary mt-4 inline-flex items-center gap-1 hover:underline"
              >
                View on GitHub <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Upsell to Custom Development */}
            <div className="mt-6 border-t pt-6">
              <p className="text-muted-foreground text-center text-sm">
                Community suggestions are reviewed but delivery is not guaranteed.
              </p>
              <div className="bg-muted/50 mt-4 rounded-lg border p-4 text-center">
                <p className="font-medium">Want guaranteed delivery?</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Get a custom skill built specifically for your workflow.
                </p>
                <Button asChild className="mt-3">
                  <Link href="/custom">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Custom Development
                  </Link>
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              className="mx-auto mt-4 block"
              onClick={() => handleOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="suggest-name"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Skill Name *
              </label>
              <Input
                id="suggest-name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Code Review Assistant"
                aria-invalid={!!state.fieldErrors?.name}
                required
              />
              {state.fieldErrors?.name && (
                <p className="text-destructive text-sm">{state.fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="suggest-category"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Category *
              </label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_REQUEST_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.fieldErrors?.category && (
                <p className="text-destructive text-sm">{state.fieldErrors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="suggest-description"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Description *
              </label>
              <Textarea
                id="suggest-description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="What should this skill do? Be specific about capabilities, use cases, and expected behavior..."
                rows={4}
                aria-invalid={!!state.fieldErrors?.description}
                required
              />
              {state.fieldErrors?.description && (
                <p className="text-destructive text-sm">{state.fieldErrors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="suggest-examplePrompts"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Example Prompts (optional)
              </label>
              <Textarea
                id="suggest-examplePrompts"
                name="examplePrompts"
                value={formData.examplePrompts}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, examplePrompts: e.target.value }))
                }
                placeholder="How would users interact with this skill? Add example prompts or commands..."
                rows={3}
              />
              {state.fieldErrors?.examplePrompts && (
                <p className="text-destructive text-sm">{state.fieldErrors.examplePrompts}</p>
              )}
            </div>

            {state.error && state.status === 'error' && !state.fieldErrors && (
              <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-start gap-2 rounded-md border p-3 text-sm">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
