# Contributing to Skills Store

Thank you for your interest in contributing to Skills Store! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository**

   ```bash
   gh repo fork anthropics/skills-store
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/skills-store.git
   cd skills-store
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Set up environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

| Prefix      | Purpose           | Example                   |
| ----------- | ----------------- | ------------------------- |
| `feature/`  | New features      | `feature/skill-search`    |
| `fix/`      | Bug fixes         | `fix/category-filter`     |
| `docs/`     | Documentation     | `docs/api-reference`      |
| `refactor/` | Code improvements | `refactor/parser-logic`   |
| `test/`     | Adding tests      | `test/frontmatter-parser` |
| `chore/`    | Maintenance       | `chore/update-deps`       |

### Commit Messages

We use [Conventional Commits](https://conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring (no feature change)
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**

```bash
feat: add category filter component
fix: resolve skill card overflow on mobile
docs: update installation instructions
refactor: simplify frontmatter parsing logic
test: add inference tests for SEO category
```

### Pull Request Process

1. **Create a feature branch from `main`**

   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow existing patterns in the codebase
   - Add tests for new functionality

3. **Run quality checks**

   ```bash
   pnpm test        # Run tests
   pnpm lint        # Check code style
   pnpm type-check  # Verify TypeScript types
   ```

4. **Commit your changes**
   - Pre-commit hooks will automatically run linting
   - Use conventional commit format

5. **Push and create PR**

   ```bash
   git push origin feature/your-feature
   gh pr create
   ```

6. **PR Requirements**
   - Clear description of changes
   - All tests passing
   - No TypeScript errors
   - Code reviewed and approved

## Code Style

### TypeScript

- Use strict mode (enabled by default)
- Prefer explicit types over `any`
- Use Zod for runtime validation at API boundaries

```typescript
// Good
function getSkill(id: string): Promise<Skill | null> {
  // ...
}

// Avoid
function getSkill(id: any): any {
  // ...
}
```

### React Components

- Server Components by default
- Use `'use client'` only when necessary
- Follow React 19 patterns (useActionState, useOptimistic)

```tsx
// Server Component (default)
export default async function SkillList() {
  const skills = await fetchSkills();
  return <div>{/* ... */}</div>;
}

// Client Component (when needed)
('use client');
export function SearchInput() {
  // Interactive logic
}
```

### Styling

- Use Tailwind CSS classes
- Use `cn()` utility for conditional classes
- Follow mobile-first responsive design

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes"
)}>
```

## Testing

### Running Tests

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run with coverage
pnpm test:coverage
```

### Writing Tests

- Place tests in `tests/` directory
- Mirror source structure: `src/lib/parser/` → `tests/lib/parser/`
- Use descriptive test names

```typescript
describe('parseSkillFrontmatter', () => {
  it('parses minimal Anthropic format', () => {
    const content = `---
name: my-skill
description: Does something
---`;
    expect(parseSkillFrontmatter(content)).toEqual({
      name: 'my-skill',
      description: 'Does something',
    });
  });
});
```

## Project Structure

```
skills-store/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/           # shadcn/ui (don't modify)
│   ├── skill/        # Skill-related components
│   └── shared/       # Shared components
├── lib/              # Core logic
│   ├── github/       # GitHub API integration
│   ├── parser/       # SKILL.md parsing
│   └── utils/        # Utilities
├── tests/            # Test files
└── config/           # Configuration
```

## Questions?

- Open an issue for discussion
- Check existing issues before creating new ones
- Be respectful and constructive

Thank you for contributing!
