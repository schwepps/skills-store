# Skills Store

A web application for discovering and installing Claude skills from GitHub repositories.

## Features

- Browse skills from registered GitHub repositories
- **Add any public GitHub repository** via the UI
- Filter by category (Development, Productivity, Marketing, etc.)
- Search skills by name and description
- **View example prompts** and usage triggers on skill detail pages
- One-click installation instructions
- Responsive design for all devices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript 5.9+

## Architecture

Skills Store uses a **Supabase-first architecture**:

- **Runtime**: All data is served from Supabase for fast, scalable queries
- **Sync**: A sync service fetches skills from GitHub and stores them in Supabase
- **Benefits**: Sub-100ms response times, full-text search, no GitHub rate limits

```
┌─────────────┐     Sync      ┌──────────────┐
│   GitHub    │ ─────────────→│   Supabase   │
│   Repos     │   (periodic)  │   Database   │
└─────────────┘               └──────────────┘
                                     │
                                     │ Runtime queries
                                     ▼
                              ┌──────────────┐
                              │  Skills Store │
                              │   Next.js    │
                              └──────────────┘
```

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- pnpm (recommended) or npm
- A Supabase account (free tier works)

### 1. Clone and Install

```bash
git clone https://github.com/schwepps/skills-store.git
cd skills-store
pnpm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose a name and generate a database password
4. Select a region close to your users
5. Wait for the project to initialize (~2 minutes)

### 3. Run Database Migration

1. Open the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL to create tables and indexes

### 4. Configure Environment Variables

Create your environment file:

```bash
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Use one of these key formats:
# New format (recommended)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx

# Or legacy format (still supported)
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...

# Sync Configuration
SYNC_SECRET=your-random-secret-here

# GitHub Token (Optional - increases sync rate limit)
GITHUB_TOKEN=ghp_your_token_here
```

Find your keys in: Supabase Dashboard > Settings > API

### 5. Initial Data Sync

Start the development server and sync skills from GitHub:

```bash
# Start the server
pnpm dev

# In another terminal, trigger the sync
curl -X POST http://localhost:3000/api/sync
```

### 6. Open the App

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Periodic Sync

Skills are synced from GitHub to Supabase. Set up periodic sync to keep data fresh:

### Option 1: Vercel Cron Jobs

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/sync",
    "schedule": "0 */6 * * *"
  }]
}
```

### Option 2: GitHub Actions

Create `.github/workflows/sync.yml`:

```yaml
name: Sync Skills
on:
  schedule:
    - cron: '0 */6 * * *'
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST ${{ secrets.APP_URL }}/api/sync \
            -H "Authorization: Bearer ${{ secrets.SYNC_SECRET }}"
```

### Option 3: Manual Sync

```bash
# Production (auth required)
curl -X POST https://your-domain.com/api/sync \
  -H "Authorization: Bearer your-sync-secret"
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/skills` | GET | Get all skills |
| `/api/repos/[owner]/[repo]` | GET | Get skills from a specific repo |
| `/api/categories` | GET | Get all categories with counts |
| `/api/sync` | POST | Trigger GitHub → Supabase sync |
| `/api/sync/status` | GET | Get sync status and stats |

## Adding a New Repository

### Option 1: Via the UI (Recommended)

1. Click the **"Add Repository"** button in the header
2. Paste the GitHub repository URL (e.g., `https://github.com/owner/repo`)
3. Preview the discovered skills
4. Click "Add" to sync the repository

### Option 2: Via Configuration

To permanently register a repository:

1. Edit `src/config/repos.ts`
2. Add a new entry to `registeredRepos`:

```typescript
{
  owner: 'username',
  repo: 'repo-name',
  branch: 'main',
  displayName: 'My Skills',
  description: 'Collection of useful skills',
  website: 'https://example.com',
  featured: false,
  config: {
    skillsPath: 'skills',           // Path to skills folder
    defaultCategory: 'productivity', // Default category
    categoryOverrides: {            // Override categories for specific skills
      'my-skill': 'development'
    },
    excludeFolders: ['_templates']  // Folders to exclude
  }
}
```

3. Run a sync to fetch the new skills:

```bash
curl -X POST http://localhost:3000/api/sync
```

## Project Structure

```
skills-store/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── repo/              # Repository detail pages
│   │   └── skill/             # Skill detail pages
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── skill/            # Skill-related components
│   │   └── layout/           # Layout components
│   ├── lib/                   # Utilities and services
│   │   ├── data/             # Data layer (Supabase queries)
│   │   ├── github/           # GitHub API client (for sync)
│   │   ├── supabase/         # Supabase client and queries
│   │   └── sync/             # Sync service (GitHub → Supabase)
│   └── config/               # Configuration files
├── supabase/
│   └── migrations/           # Database migrations
└── public/                   # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.
