import { AlertTriangle, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { ToolDef, ToolCategory } from '@/types'

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  study: 'دراسة',
  research: 'بحث',
  writing: 'كتابة',
  creative: 'تصميم',
  coding: 'برمجة',
  startup: 'مشاريع',
}

interface ToolCardProps {
  tool: ToolDef
  active?: boolean
  className?: string
}

/**
 * A single AI tool.
 *
 * Limitations are shown alongside strengths, not hidden — the whole deck argues
 * that AI is not magic, so a tool card that only sells the tool would undercut
 * the lesson.
 */
export function ToolCard({ tool, active, className = '' }: ToolCardProps) {
  return (
    <Card surface="panel" active={active} className={className}>
      <div className="flex items-center justify-between gap-4">
        {/* Tool names stay in English and keep Inter's metrics. */}
        <h3 className="text-title font-semibold text-bright latin">
          {tool.name}
        </h3>
        <Badge tone="accent">{CATEGORY_LABELS[tool.category]}</Badge>
      </div>

      {tool.useCasesAr.length > 0 && (
        <ul className="text-body mt-5 space-y-2 text-soft">
          {tool.useCasesAr.map((useCase) => (
            <li key={useCase} className="flex gap-3">
              <span className="text-accent" aria-hidden>
                •
              </span>
              {useCase}
            </li>
          ))}
        </ul>
      )}

      {tool.strengthsAr.length > 0 && (
        <div className="mt-5 flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-safe" aria-hidden />
          <p className="text-caption text-soft">{tool.strengthsAr.join(' · ')}</p>
        </div>
      )}

      {tool.limitationsAr.length > 0 && (
        <div className="mt-3 flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-warning"
            aria-hidden
          />
          <p className="text-caption text-muted">
            {tool.limitationsAr.join(' · ')}
          </p>
        </div>
      )}
    </Card>
  )
}
