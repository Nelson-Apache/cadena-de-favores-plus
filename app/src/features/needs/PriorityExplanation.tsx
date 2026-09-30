import { PriorityBadge } from '@/components/ui/Badges'
import { Icon } from '@/components/ui/Icon'
import type { PriorityBreakdown } from '@/domain/priority'
import type { Need } from '@/domain/types'
import { formatNumber, formatWait } from '@/lib/format'
import { NEED_TYPE_LABEL, VULNERABILITY_LABEL } from '@/lib/labels'

interface Props {
  need: Pick<Need, 'type' | 'peopleAffected' | 'vulnerabilities'>
  priority: PriorityBreakdown
  days: number
}

const MAX_POINTS = 3

/** Por qué esta prioridad: aporte de cada uno de los 4 criterios (0 a 3 puntos, máximo 12). */
export function PriorityExplanation({ need, priority, days }: Props) {
  const vulnerabilities = [...new Set(need.vulnerabilities)]
  const criteria = [
    {
      icon: 'emergency_home',
      title: 'Tipo de necesidad',
      points: priority.type,
      text: `${NEED_TYPE_LABEL[need.type]}: ${priority.type >= 3 ? 'es una necesidad vital.' : 'pesa según lo urgente que es.'}`,
    },
    {
      icon: 'family_restroom',
      title: `${formatNumber(need.peopleAffected)} ${need.peopleAffected === 1 ? 'persona afectada' : 'personas afectadas'}`,
      points: priority.people,
      text: 'A más personas afectadas, más urgente es llegar.',
    },
    {
      icon: 'person',
      title: 'Vulnerabilidad',
      points: priority.vulnerability,
      text: vulnerabilities.length
        ? `Hay ${vulnerabilities.map((v) => VULNERABILITY_LABEL[v].toLowerCase()).join(', ')}.`
        : 'No se reportaron personas con mayor riesgo.',
    },
    {
      icon: 'schedule',
      title: days === 1 ? '1 día de espera' : `${days} días de espera`,
      points: priority.wait,
      text: `${formatWait(days)} sin ser atendida: mientras más espera, sube la prioridad.`,
    },
  ]
  return (
    <section
      className="rounded-card border border-line bg-white p-5 shadow-soft md:p-6"
      aria-labelledby="por-que-prioridad"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="por-que-prioridad" className="font-display text-headline-sm text-ink">
            {priority.level === 'alta' ? 'Por qué es prioridad alta' : 'Por qué esta prioridad'}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">Así la calculamos: 4 criterios, cada uno de 0 a 3 puntos.</p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge level={priority.level} />
          <span className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-ink">
            {priority.total} / {MAX_POINTS * 4} puntos
          </span>
        </div>
      </div>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {criteria.map((c) => (
          <li key={c.icon} className="rounded-xl border border-line bg-surface-low p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Icon name={c.icon} className="text-[18px] text-primary" />
                {c.title}
              </p>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary-dark">
                {c.points} de {MAX_POINTS}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
