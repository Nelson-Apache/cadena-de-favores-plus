import type { AidStatus, PriorityLevel } from '@/domain/types'
import { PRIORITY_LABEL, STATUS_LABEL } from '@/lib/labels'
import { Icon } from './Icon'

const STATUS_STYLE: Record<AidStatus, string> = {
  sin_ayuda: 'bg-need-none-soft text-need-none',
  en_camino: 'bg-need-transit-soft text-[#8A6300]',
  atendida: 'bg-need-done-soft text-need-done',
}
const STATUS_DOT: Record<AidStatus, string> = {
  sin_ayuda: 'bg-need-none',
  en_camino: 'bg-need-transit',
  atendida: 'bg-need-done',
}

export function StatusBadge({ status }: { status: AidStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}
    >
      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  )
}

const PRIORITY_STYLE: Record<PriorityLevel, string> = {
  alta: 'bg-need-none text-white',
  media: 'border border-need-transit text-[#8A6300]',
  baja: 'bg-surface-high text-ink-soft',
}

export function PriorityBadge({ level }: { level: PriorityLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY_STYLE[level]}`}
    >
      {PRIORITY_LABEL[level]}
    </span>
  )
}

/** Sello circular estilo tinta para viviendas solidarias. */
export function SolidaritySeal({ label = 'Arriendo solidario', size = 'md' }: { label?: string; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-14 w-14 text-[8px]' : 'h-20 w-20 text-[10px]'
  return (
    <span
      className={`inline-flex ${s} -rotate-12 flex-col items-center justify-center rounded-full border-[3px] border-double border-housing bg-white/90 text-center font-bold uppercase leading-tight tracking-wide text-housing`}
      title={label}
    >
      <Icon name="volunteer_activism" className="text-[18px]" />
      {label}
    </span>
  )
}
