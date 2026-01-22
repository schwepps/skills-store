'use client';

import { useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher une skill...',
  className,
}: SearchBarProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (newValue: string) => {
    // Use transition for non-urgent updates (React 19 pattern)
    startTransition(() => {
      onChange(newValue);
    });
  };

  return (
    <div className={cn('relative', className)}>
      <Search
        className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
          isPending && 'animate-pulse'
        )}
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-10 pr-10"
        aria-label="Rechercher des skills"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={() => handleChange('')}
          aria-label="Effacer la recherche"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
