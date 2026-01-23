import type {
  SkillContent,
  ExamplePrompt,
  WorkflowPhase,
} from '@/lib/types';

/**
 * Section extracted from markdown
 */
interface MarkdownSection {
  /** Section header text */
  heading: string;
  /** Header level (2 = ##, 3 = ###) */
  level: number;
  /** Raw markdown content of section */
  content: string;
}

/**
 * Section header patterns to look for
 */
const SECTION_PATTERNS = {
  usageTriggers: [
    /^##?\s*(?:When to Use|Usage|Use Cases|Getting Started)/i,
    /^##?\s*(?:Quand utiliser|Cas d'usage)/i, // French support
  ],
  examples: [
    /^##?\s*(?:Examples?|Sample Prompts?|Try It|Example Usage)/i,
    /^##?\s*(?:Exemples?)/i, // French
  ],
  workflow: [
    /^##?\s*(?:Workflow|Process|Steps|Phases|How It Works|Methodology)/i,
    /^##?\s*(?:Processus|Étapes|Méthodologie)/i, // French
  ],
};

/**
 * Extract structured content from SKILL.md markdown body
 */
export function extractSkillContent(markdownBody: string): SkillContent {
  const content: SkillContent = {};

  if (!markdownBody || markdownBody.trim().length === 0) {
    return content;
  }

  // Extract all sections first
  const sections = extractSections(markdownBody);

  // Parse usage triggers
  const usageSection = findSection(sections, SECTION_PATTERNS.usageTriggers);
  if (usageSection) {
    const triggers = extractBulletPoints(usageSection.content);
    if (triggers.length > 0) {
      content.usageTriggers = triggers;
    }
  }

  // Parse example prompts
  const examplesSection = findSection(sections, SECTION_PATTERNS.examples);
  if (examplesSection) {
    const prompts = extractExamplePrompts(examplesSection.content);
    if (prompts.length > 0) {
      content.examplePrompts = prompts;
    }
  }

  // Parse workflow phases
  const workflowSection = findSection(sections, SECTION_PATTERNS.workflow);
  if (workflowSection) {
    const phases = extractWorkflowPhases(workflowSection.content);
    if (phases.length > 0) {
      content.workflowPhases = phases;
    }
  }

  return content;
}

/**
 * Extract all markdown sections by headers
 */
function extractSections(markdown: string): MarkdownSection[] {
  const lines = markdown.split('\n');
  const sections: MarkdownSection[] = [];
  let currentSection: MarkdownSection | null = null;
  let contentLines: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        currentSection.content = contentLines.join('\n').trim();
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        heading: headerMatch[2].trim(),
        level: headerMatch[1].length,
        content: '',
      };
      contentLines = [];
    } else if (currentSection) {
      contentLines.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.content = contentLines.join('\n').trim();
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Find a section matching any of the given patterns
 */
function findSection(
  sections: MarkdownSection[],
  patterns: RegExp[]
): MarkdownSection | undefined {
  return sections.find((s) => patterns.some((p) => p.test(s.heading)));
}

/**
 * Extract bullet points from markdown content
 */
function extractBulletPoints(content: string): string[] {
  const bullets: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Match bullet points: - item or * item
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      const text = bulletMatch[1].trim();
      // Skip very short items or items that look like headers
      if (text.length > 5 && !text.startsWith('#')) {
        bullets.push(text);
      }
    }
  }

  return bullets;
}

/**
 * Extract example prompts from various formats
 */
function extractExamplePrompts(content: string): ExamplePrompt[] {
  const prompts: ExamplePrompt[] = [];
  const seenPrompts = new Set<string>();

  // Pattern 1: Code blocks with prompts
  const codeBlockRegex = /```(?:text|prompt|markdown)?\n([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const prompt = match[1].trim();
    if (prompt && prompt.length > 10 && !seenPrompts.has(prompt)) {
      seenPrompts.add(prompt);
      prompts.push({ prompt });
    }
  }

  // Pattern 2: Quoted prompts (> "prompt text")
  const quoteRegex = /^>\s*["']?(.+?)["']?\s*$/gm;
  while ((match = quoteRegex.exec(content)) !== null) {
    const prompt = match[1].trim();
    if (prompt && prompt.length > 10 && !seenPrompts.has(prompt)) {
      seenPrompts.add(prompt);
      prompts.push({ prompt });
    }
  }

  // Pattern 3: Numbered prompts with titles
  // Example: 1. **Title**: Prompt text
  const numberedRegex = /^\d+\.\s*\*\*([^*]+)\*\*:?\s*(.+)/gm;
  while ((match = numberedRegex.exec(content)) !== null) {
    const title = match[1].trim();
    const prompt = match[2].trim();
    if (prompt && prompt.length > 10 && !seenPrompts.has(prompt)) {
      seenPrompts.add(prompt);
      prompts.push({ title, prompt });
    }
  }

  // Pattern 4: Bullet points that look like prompts
  // (longer text starting with action verbs or questions)
  const promptVerbs = [
    'analyze',
    'create',
    'generate',
    'write',
    'help',
    'explain',
    'review',
    'check',
    'find',
    'show',
    'give',
    'make',
  ];
  const lines = content.split('\n');
  for (const line of lines) {
    const bulletMatch = line.match(/^[-*]\s+["']?(.+?)["']?\s*$/);
    if (bulletMatch) {
      const text = bulletMatch[1].trim();
      const lowerText = text.toLowerCase();
      // Check if it starts with a prompt-like verb or is a question
      const looksLikePrompt =
        promptVerbs.some((verb) => lowerText.startsWith(verb)) ||
        text.endsWith('?') ||
        text.length > 50;
      if (looksLikePrompt && !seenPrompts.has(text)) {
        seenPrompts.add(text);
        prompts.push({ prompt: text });
      }
    }
  }

  return prompts;
}

/**
 * Extract workflow phases from markdown
 */
function extractWorkflowPhases(content: string): WorkflowPhase[] {
  const phases: WorkflowPhase[] = [];

  // Split by phase headers (### Phase or **Phase** or numbered headers)
  const phaseRegex =
    /(?:^###\s*|\*\*)(\d+\.?\s*[^*\n]+?)(?:\*\*)?(?:\n|:)/gm;
  const matches = [...content.matchAll(phaseRegex)];

  if (matches.length === 0) {
    // Try simpler numbered list format
    const numberedRegex = /^(\d+)\.\s*\*\*([^*]+)\*\*/gm;
    const numberedMatches = [...content.matchAll(numberedRegex)];

    for (const match of numberedMatches) {
      const name = `${match[1]}. ${match[2].trim()}`;
      const startIdx = (match.index || 0) + match[0].length;
      const endIdx = content.indexOf('\n\n', startIdx);
      const description = content
        .slice(startIdx, endIdx > 0 ? endIdx : undefined)
        .trim();

      if (name) {
        phases.push({
          name,
          description: description.split('\n')[0] || '',
          steps: extractBulletPoints(description),
        });
      }
    }

    return phases;
  }

  // Process matched phases
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const name = match[1].trim();
    const startIdx = (match.index || 0) + match[0].length;
    const endIdx =
      i < matches.length - 1
        ? matches[i + 1].index
        : content.length;

    const sectionContent = content.slice(startIdx, endIdx).trim();
    const lines = sectionContent.split('\n');

    // First non-empty line is description
    const description = lines.find((l) => l.trim() && !l.startsWith('-'))?.trim() || '';

    phases.push({
      name,
      description,
      steps: extractBulletPoints(sectionContent),
    });
  }

  return phases;
}
