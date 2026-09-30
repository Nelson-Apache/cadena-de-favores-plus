import { Link } from 'react-router-dom'

/** Logo: dos eslabones cruzados que forman un "+". */
export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#0F5563" />
      <rect x="16" y="7" width="8" height="26" rx="4" fill="none" stroke="#FAF7F2" strokeWidth="3" />
      <rect x="7" y="16" width="26" height="8" rx="4" fill="none" stroke="#94D0E0" strokeWidth="3" />
      <circle cx="20" cy="20" r="3.2" fill="#E0A100" />
    </svg>
  )
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Cadena de Favores+, inicio">
      <LogoMark />
      <span className="whitespace-nowrap leading-tight">
        <span className={`block font-display text-[17px] font-bold ${inverted ? 'text-white' : 'text-primary-dark'}`}>
          Cadena de Favores<span className="text-need-transit">+</span>
        </span>
        <span
          className={`block text-[11px] font-medium uppercase tracking-wider ${inverted ? 'text-white/60' : 'text-ink-muted'}`}
        >
          Red cívica del Quindío
        </span>
      </span>
    </Link>
  )
}
