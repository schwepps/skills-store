'use client';

import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onSelect: (categoryId: string) => void;
  className?: string;
}

// Type for lucide-react icon names
type IconName = keyof typeof Icons;

// Dynamic icon component with proper typing
function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = Icons[name as IconName] as LucideIcon | undefined;
  if (!Icon) return null;
  return <Icon className={className} aria-hidden="true" />;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
  className,
}: CategoryFilterProps) {
  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      role="group"
      aria-label="Filter by category"
    >
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selected === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(category.id)}
          className="gap-2"
          aria-pressed={selected === category.id}
        >
          <CategoryIcon name={category.icon} className="h-4 w-4" />
          <span>{category.label}</span>
          {category.count !== undefined && (
            <span className="text-xs opacity-70">({category.count})</span>
          )}
        </Button>
      ))}
    </div>
  );
}
