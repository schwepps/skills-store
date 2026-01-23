'use client';

import { useState, useEffect } from 'react';
import { Database, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SyncStatusData {
  configured: boolean;
  stats?: {
    repoCount: number;
    skillCount: number;
    lastSync: string | null;
  };
  repositories?: Array<{
    owner: string;
    repo: string;
    status: string;
    lastSyncedAt: string | null;
    error: string | null;
  }>;
  error?: string;
  message?: string;
}

export function SyncStatus() {
  const [status, setStatus] = useState<SyncStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/sync/status');
        const data = await res.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch sync status:', error);
        setStatus({ configured: false, message: 'Failed to fetch status' });
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  // Not using Supabase - show GitHub mode
  if (!status.configured) {
    return (
      <div
        className="flex items-center gap-2 text-sm text-muted-foreground"
        title="Data fetched directly from GitHub"
      >
        <Database className="w-3 h-3" />
        <span>GitHub API</span>
      </div>
    );
  }

  // Using Supabase
  const hasErrors = status.repositories?.some((r) => r.status === 'error');
  const lastSync = status.stats?.lastSync
    ? new Date(status.stats.lastSync)
    : null;

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const tooltipText = [
    `${status.stats?.repoCount || 0} repos, ${status.stats?.skillCount || 0} skills`,
    lastSync ? `Last sync: ${lastSync.toLocaleString()}` : null,
    hasErrors ? 'Some repos have sync errors' : null,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div
      className="flex items-center gap-2 text-sm text-muted-foreground"
      title={tooltipText}
    >
      {hasErrors ? (
        <AlertCircle className="w-3 h-3 text-destructive" />
      ) : (
        <CheckCircle2 className="w-3 h-3 text-green-500" />
      )}
      <span>{status.stats?.skillCount || 0} skills</span>
      {lastSync && (
        <Badge variant="outline" className="text-xs">
          {formatRelativeTime(lastSync)}
        </Badge>
      )}
    </div>
  );
}
