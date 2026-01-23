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
import { Lightbulb, CheckCircle, Loader2, ExternalLink, XCircle } from 'lucide-react';
import {
  requestSkillAction,
  type RequestSkillState,
} from '@/lib/actions/request-skill';
import { SKILL_CATEGORIES } from '@/lib/constants/categories';

export function RequestSkillDialog() {
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

  // Reset form when dialog opens (fresh start)
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setFormData({ name: '', category: '', description: '', examplePrompts: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Lightbulb className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Request Skill</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a New Skill</DialogTitle>
          <DialogDescription>
            Describe the skill you&apos;d like to see. We&apos;ll review your request and
            consider adding it to the store.
          </DialogDescription>
        </DialogHeader>

        {state.status === 'success' ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium">Request Submitted!</p>
            <p className="text-muted-foreground mt-2">
              Your skill request has been created as an issue on GitHub.
            </p>
            <a
              href={state.issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary mt-4 hover:underline"
            >
              View on GitHub <ExternalLink className="w-4 h-4" />
            </a>
            <Button className="mt-4 block mx-auto" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Skill Name *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Code Review Assistant"
                aria-invalid={!!state.fieldErrors?.name}
                required
              />
              {state.fieldErrors?.name && (
                <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Category *
              </label>
              <Select
                name="category"
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.fieldErrors?.category && (
                <p className="text-sm text-destructive">{state.fieldErrors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Description *
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What should this skill do? Be specific about capabilities, use cases, and expected behavior..."
                rows={4}
                aria-invalid={!!state.fieldErrors?.description}
                required
              />
              {state.fieldErrors?.description && (
                <p className="text-sm text-destructive">{state.fieldErrors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="examplePrompts"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Example Prompts (optional)
              </label>
              <Textarea
                id="examplePrompts"
                name="examplePrompts"
                value={formData.examplePrompts}
                onChange={(e) => setFormData(prev => ({ ...prev, examplePrompts: e.target.value }))}
                placeholder="How would users interact with this skill? Add example prompts or commands..."
                rows={3}
              />
              {state.fieldErrors?.examplePrompts && (
                <p className="text-sm text-destructive">{state.fieldErrors.examplePrompts}</p>
              )}
            </div>

            {state.error && state.status === 'error' && !state.fieldErrors && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
