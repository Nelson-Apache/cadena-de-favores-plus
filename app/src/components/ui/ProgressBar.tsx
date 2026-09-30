import type { AidStatus } from '@/domain/types'

const COLOR: Record<AidStatus, string> = {
  sin_ayuda: 'bg-need-none',
  en_camino: 'bg-need-transit',
  atendida: 'bg-need-done',
}

interface Props {
  value: number
  max: number
  status: AidStatus
  label?: string
}

/** Barra de avance "cantidad comprometida frente a cantidad pedida". */
export function ProgressBar({ value, max, status, label }: Props) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between text-xs font-medium text-ink-soft">
          <span>{label}</span>
          <span className="tabular-nums">{pct}% cubierto</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-high"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full ${COLOR[status]}`}
          style={{ width: `${Math.max(pct, status === 'sin_ayuda' ? 0 : 4)}%` }}
        />
      </div>
    </div>
  )
}
