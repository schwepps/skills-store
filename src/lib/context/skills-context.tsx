'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { Skill, RepoInfo } from '@/lib/types';

interface SkillsContextValue {
  skills: Skill[];
  repos: RepoInfo[];
  isHydrated: boolean;
}

const SkillsContext = createContext<SkillsContextValue | null>(null);

interface SkillsProviderProps {
  children: ReactNode;
}

export function SkillsProvider({ children }: SkillsProviderProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  return (
    <SkillsContext.Provider value={{ skills, repos, isHydrated }}>
      <SkillsHydratorContext.Provider
        value={{ setSkills, setRepos, setIsHydrated }}
      >
        {children}
      </SkillsHydratorContext.Provider>
    </SkillsContext.Provider>
  );
}

// Separate context for hydration to avoid re-renders
interface HydratorContextValue {
  setSkills: (skills: Skill[]) => void;
  setRepos: (repos: RepoInfo[]) => void;
  setIsHydrated: (hydrated: boolean) => void;
}

const SkillsHydratorContext = createContext<HydratorContextValue | null>(null);

export function useSkillsContext() {
  const context = useContext(SkillsContext);
  if (!context) {
    throw new Error('useSkillsContext must be used within SkillsProvider');
  }
  return context;
}

/**
 * Component to hydrate skills context from RSC data
 * Place this in page.tsx to populate context on first load
 */
interface SkillsHydratorProps {
  skills: Skill[];
  repos: RepoInfo[];
}

export function SkillsHydrator({ skills, repos }: SkillsHydratorProps) {
  const hydratorContext = useContext(SkillsHydratorContext);

  useEffect(() => {
    if (hydratorContext && skills.length > 0) {
      hydratorContext.setSkills(skills);
      hydratorContext.setRepos(repos);
      hydratorContext.setIsHydrated(true);
    }
  }, [skills, repos, hydratorContext]);

  return null;
}
