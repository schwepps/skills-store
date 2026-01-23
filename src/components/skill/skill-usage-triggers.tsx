import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkillUsageTriggersProps {
  triggers: string[];
}

export function SkillUsageTriggers({ triggers }: SkillUsageTriggersProps) {
  if (!triggers || triggers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          When to Use This Skill
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {triggers.map((trigger, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-muted-foreground"
            >
              <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
              <span>{trigger}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
