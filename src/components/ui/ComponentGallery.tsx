import { useState } from 'react'
import { ShieldAlert, ShieldCheck } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  ChoiceCard,
  QuestionCard,
  RevealCard,
  RevealText,
  SectionTitle,
  ToolCard,
  type ChoiceState,
} from '@/components/ui'
import { useChoiceKeys } from '@/hooks/useChoiceKeys'
import { usePresentation } from '@/hooks/usePresentation'
import type { ToolDef } from '@/types'

/**
 * TEMPORARY. Every UI component in every state, for visual review.
 * Deleted along with the dev harness once real scenes land.
 */

// Fixture only — the real tool list comes from the deck into src/data/tools.ts.
const FIXTURE_TOOL: ToolDef = {
  id: 'fixture',
  name: 'ChatGPT',
  category: 'study',
  useCasesAr: ['اشرحلي درس معقّد بطريقة أبسط', 'اعمللي خطة مراجعة لأسبوع'],
  strengthsAr: ['شرح', 'تلخيص', 'أمثلة'],
  limitationsAr: ['ممكن يغلط', 'ما بيعرف كل شي', 'لازم تتأكد من المعلومة'],
}

const DEMO_CHOICES = ['نعم', 'أحياناً', 'أبداً', 'ما بعرف', 'أول مرة', 'كل يوم']

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-caption text-muted latin">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

export function ComponentGallery() {
  const { scene, beat } = usePresentation()
  const [selected, setSelected] = useState<number | null>(null)

  // Only live on scenes that actually have an interaction — a stray digit can
  // never fire anything on a normal scene.
  const choiceKeysEnabled = scene.interaction !== undefined
  useChoiceKeys(setSelected, {
    enabled: choiceKeysEnabled,
    count: DEMO_CHOICES.length,
  })

  const choiceState = (index: number): ChoiceState => {
    if (selected === null) return 'idle'
    return selected === index ? 'selected' : 'dimmed'
  }

  return (
    <section data-no-advance className="flex flex-col gap-10">
      <SectionTitle eyebrow="COMPONENT GALLERY" lead="كل عنصر بكل حالاته.">
        مكتبة الواجهة
      </SectionTitle>

      <Row label="Button — variants & sizes">
        <Button variant="primary">أساسي</Button>
        <Button variant="secondary">ثانوي</Button>
        <Button variant="ghost">شفاف</Button>
        <Button variant="primary" size="lg">
          كبير
        </Button>
        <Button variant="secondary" disabled>
          معطّل
        </Button>
      </Row>

      <Row label="Badge — tones (icon + label, never colour alone)">
        <Badge>محايد</Badge>
        <Badge tone="accent">مميّز</Badge>
        <Badge tone="safe" icon={<ShieldCheck className="size-4" />}>
          SAFE TO SHARE
        </Badge>
        <Badge tone="danger" icon={<ShieldAlert className="size-4" />}>
          DON&apos;T SHARE
        </Badge>
        <Badge tone="warning">تحذير</Badge>
      </Row>

      <Row label="Card — surfaces">
        <Card className="w-64">
          <p className="text-body text-soft">panel — الأساسي</p>
        </Card>
        <Card surface="glass" className="w-64">
          <p className="text-body text-soft">glass</p>
        </Card>
        <Card surface="outline" className="w-64">
          <p className="text-body text-soft">outline</p>
        </Card>
        <Card active className="w-64">
          <p className="text-body text-soft">active</p>
        </Card>
      </Row>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuestionCard
          question="هل استخدمت AI من قبل؟"
          hint={
            choiceKeysEnabled
              ? 'اضغط ١-٦ أو اختر بالماوس'
              : 'مفاتيح الأرقام معطّلة — هذا المشهد بلا interaction'
          }
        >
          <div className="flex flex-col gap-3">
            {DEMO_CHOICES.slice(0, 3).map((label, i) => (
              <ChoiceCard
                key={label}
                label={label}
                choiceKey={i + 1}
                state={choiceState(i)}
                onSelect={() => setSelected(i)}
              />
            ))}
          </div>
        </QuestionCard>

        <div className="flex flex-col gap-3">
          <span className="text-caption text-muted latin">
            ChoiceCard — verdict states
          </span>
          <ChoiceCard label="واجب مدرسي" state="correct" choiceKey={1} />
          <ChoiceCard label="Password" state="incorrect" choiceKey={2} />
          <ChoiceCard label="سؤال عام" state="selected" choiceKey={3} />
          <ChoiceCard label="خيار غير مختار" state="dimmed" choiceKey={4} />
          <ChoiceCard label="خيار عادي" state="idle" choiceKey={5} />
        </div>
      </div>

      <Row label="ToolCard — fixture data, not from src/data/tools.ts">
        <ToolCard tool={FIXTURE_TOOL} className="w-96" />
        <ToolCard tool={FIXTURE_TOOL} active className="w-96" />
      </Row>

      <div className="flex flex-col gap-3">
        <span className="text-caption text-muted latin">
          RevealText / RevealCard — bound to the live beat (currently {beat})
        </span>
        <RevealText step={1} emphasis="quiet">
          يظهر عند beat 1
        </RevealText>
        <RevealText step={2}>يظهر عند beat 2</RevealText>
        <RevealText step={3} emphasis="strong">
          يظهر عند beat 3
        </RevealText>
        <RevealCard step={4} className="w-96">
          <p className="text-body text-soft">RevealCard — يظهر عند beat 4</p>
        </RevealCard>
      </div>
    </section>
  )
}
