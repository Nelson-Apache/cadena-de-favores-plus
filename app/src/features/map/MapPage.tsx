import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { PriorityBadge, SolidaritySeal, StatusBadge } from '@/components/ui/Badges'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { MUNICIPIOS, type AidStatus, type Municipio, type PriorityLevel, type Resource } from '@/domain/types'
import { formatCOP, formatWait } from '@/lib/format'
import { AVAILABILITY_LABEL, RESOURCE_ICON, RESOURCE_TYPE_LABEL } from '@/lib/labels'
import { housingIcon, needIcon, resourceIcon } from './markers'
import { useMapData, type Filters, type HousingView, type Layer, type NeedView } from './useMapData'

const QUINDIO_CENTER: [number, number] = [4.53, -75.7]

/**
 * Mapa de prioridades · spec: mapa-de-prioridades.
 * Referencia visual: docs/design/stitch/mapa-de-prioridades.
 */
export function MapPage() {
  const [params] = useSearchParams()
  const [filters, setFilters] = useState<Filters>({
    layer: 'todo',
    municipio: 'todos',
    status: 'todos',
    priority: 'todas',
    mostNeeded: params.get('vista') === 'mas-falta',
    query: '',
  })
  const [selected, setSelected] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'lista' | 'mapa'>('lista')
  const [alertOpen, setAlertOpen] = useState(true)
  const { needs, resources, housing, summary, loading } = useMapData(filters)
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters((f) => ({ ...f, [k]: v }))

  const selectedPos = useMemo(() => {
    const all = [...needs, ...resources, ...housing]
    const hit = all.find((x) => x.id === selected)
    return hit ? ([hit.location.lat, hit.location.lng] as [number, number]) : null
  }, [selected, needs, resources, housing])

  const total = needs.length + resources.length + housing.length

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Panel lateral */}
      <aside
        className={`${mobileView === 'lista' ? 'flex' : 'hidden'} w-full shrink-0 flex-col border-r border-line bg-surface lg:flex lg:w-[420px]`}
      >
        <div className="space-y-3 border-b border-line p-4">
          <label className="relative block">
            <span className="sr-only">Buscar municipio o barrio</span>
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-ink-muted"
            />
            <input
              value={filters.query}
              onChange={(e) => set('query', e.target.value)}
              placeholder="Buscar municipio o barrio"
              className="w-full rounded-full border-line bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-primary"
            />
          </label>
          <div
            className="grid grid-cols-4 gap-1 rounded-full bg-surface-mid p-1 text-xs font-semibold"
            role="tablist"
            aria-label="Capas del mapa"
          >
            {(['todo', 'necesidades', 'recursos', 'viviendas'] as Layer[]).map((l) => (
              <button
                key={l}
                role="tab"
                aria-selected={filters.layer === l}
                onClick={() => set('layer', l)}
                className={`rounded-full px-2 py-1.5 capitalize transition ${filters.layer === l ? 'bg-white text-primary-dark shadow-sm' : 'text-ink-soft hover:text-ink'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              label="Municipio"
              value={filters.municipio}
              onChange={(v) => set('municipio', v as Municipio | 'todos')}
              options={[['todos', 'Todos los municipios'], ...MUNICIPIOS.map((m) => [m, m] as [string, string])]}
            />
            <Select
              label="Estado"
              value={filters.status}
              onChange={(v) => set('status', v as AidStatus | 'todos')}
              options={[
                ['todos', 'Todo estado'],
                ['sin_ayuda', 'Sin ayuda'],
                ['en_camino', 'En camino'],
                ['atendida', 'Atendida'],
              ]}
            />
            <Select
              label="Prioridad"
              value={filters.priority}
              onChange={(v) => set('priority', v as PriorityLevel | 'todas')}
              options={[
                ['todas', 'Toda prioridad'],
                ['alta', 'Alta'],
                ['media', 'Media'],
                ['baja', 'Baja'],
              ]}
            />
          </div>
          <label
            className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 transition ${filters.mostNeeded ? 'border-need-none/30 bg-need-none-soft' : 'border-line bg-white'}`}
          >
            <span>
              <span className="block text-sm font-semibold text-ink">Dónde hace más falta</span>
              <span className="block text-xs text-ink-soft">Sin ayuda primero, por prioridad y días de espera</span>
            </span>
            <input
              type="checkbox"
              className="peer sr-only"
              checked={filters.mostNeeded}
              onChange={(e) => set('mostNeeded', e.target.checked)}
            />
            <span className="relative h-6 w-11 rounded-full bg-surface-high transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-primary peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
          <p className="text-xs font-medium text-ink-muted">{loading ? 'Cargando…' : `${total} resultados`}</p>
          {needs.map((n) => (
            <NeedCard key={n.id} need={n} active={selected === n.id} onSelect={() => setSelected(n.id)} />
          ))}
          {housing.map((h) => (
            <HousingCard key={h.id} offer={h} active={selected === h.id} onSelect={() => setSelected(h.id)} />
          ))}
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} active={selected === r.id} onSelect={() => setSelected(r.id)} />
          ))}
          {!loading && total === 0 && (
            <div className="rounded-card border border-dashed border-line p-6 text-center text-sm text-ink-soft">
              No hay resultados con estos filtros.
            </div>
          )}
        </div>
      </aside>

      {/* Mapa */}
      <section
        className={`${mobileView === 'mapa' ? 'block' : 'hidden'} relative flex-1 lg:block`}
        aria-label="Mapa del Quindío"
      >
        <MapContainer center={QUINDIO_CENTER} zoom={11} scrollWheelZoom className="h-full w-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyTo position={selectedPos} />
          {needs.map((n) => (
            <Marker
              key={n.id}
              position={[n.location.lat, n.location.lng]}
              icon={needIcon(n.status, selected === n.id)}
              eventHandlers={{ click: () => setSelected(n.id) }}
            >
              <Popup>
                <div className="w-56 space-y-2 font-body">
                  <StatusBadge status={n.status} />
                  <p className="font-display text-sm font-semibold text-ink">{n.title}</p>
                  <p className="text-xs text-ink-soft">
                    {n.location.municipio} · {n.location.barrio}
                  </p>
                  <ProgressBar value={n.progress.committed} max={n.progress.requested} status={n.status} />
                  <Link
                    to={`/necesidades/${n.id}`}
                    className="block rounded-full bg-primary px-3 py-1.5 text-center text-xs font-semibold !text-white"
                  >
                    Ver necesidad
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
          {resources.map((r) => (
            <Marker
              key={r.id}
              position={[r.location.lat, r.location.lng]}
              icon={resourceIcon()}
              eventHandlers={{ click: () => setSelected(r.id) }}
            >
              <Popup>
                <p className="font-body text-sm font-semibold">{r.title}</p>
                <p className="font-body text-xs">{r.location.municipio} · Disponible</p>
              </Popup>
            </Marker>
          ))}
          {housing.map((h) => (
            <Marker
              key={h.id}
              position={[h.location.lat, h.location.lng]}
              icon={housingIcon()}
              eventHandlers={{ click: () => setSelected(h.id) }}
            >
              <Popup>
                <p className="font-body text-sm font-semibold">{h.title}</p>
                <p className="font-body text-xs">
                  {h.location.municipio} · {h.monthlyPrice ? formatCOP(h.monthlyPrice) + '/mes' : 'Gratis'}
                </p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {summary && alertOpen && (
          <div className="absolute left-1/2 top-4 z-[500] flex w-[min(92%,460px)] -translate-x-1/2 items-start gap-3 rounded-card border border-need-none/20 bg-white p-3 shadow-lift">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-need-none-soft text-need-none">
              <Icon name="emergency" />
            </span>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-ink">
                {summary.municipio} tiene {summary.unassisted} necesidades sin ayuda
              </p>
              <button
                className="mt-1 text-xs font-semibold text-primary hover:underline"
                onClick={() => setFilters((f) => ({ ...f, municipio: summary.municipio, mostNeeded: true }))}
              >
                Ver dónde hace más falta
              </button>
            </div>
            <button
              aria-label="Cerrar aviso"
              onClick={() => setAlertOpen(false)}
              className="text-ink-muted hover:text-ink"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-[500] rounded-card border border-line bg-white/95 p-3 text-xs shadow-soft">
          <p className="mb-2 font-semibold text-ink">Convenciones</p>
          <ul className="space-y-1.5 text-ink-soft">
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-need-none" />
              Sin ayuda
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-need-transit" />
              Ayuda en camino
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-need-done" />
              Atendida
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[3px] bg-resource" />
              Recurso Red lista
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[3px] bg-housing" />
              Vivienda disponible
            </li>
          </ul>
        </div>
      </section>

      {/* Conmutador móvil lista/mapa */}
      <button
        onClick={() => setMobileView((v) => (v === 'lista' ? 'mapa' : 'lista'))}
        className="fixed bottom-5 left-1/2 z-[1001] inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lift lg:hidden"
      >
        <Icon name={mobileView === 'lista' ? 'map' : 'list'} className="text-[18px]" />
        {mobileView === 'lista' ? 'Ver mapa' : 'Ver lista'}
      </button>
    </div>
  )
}

function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 13), { duration: 0.6 })
  }, [position, map])
  return null
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: [string, string][]
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border-line bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-ink focus:border-primary focus:ring-primary"
      >
        {options.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  )
}

function cardClass(active: boolean, accent: string) {
  return `block w-full rounded-card border bg-white p-4 text-left shadow-soft transition hover:shadow-lift ${active ? 'ring-2 ring-primary' : ''} ${accent}`
}

function NeedCard({ need, active, onSelect }: { need: NeedView; active: boolean; onSelect: () => void }) {
  const first = need.items[0]
  const accent = need.status === 'sin_ayuda' ? 'border-need-none/30' : 'border-line'
  return (
    <article className={cardClass(active, accent)} onMouseEnter={onSelect}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={need.status} />
        <PriorityBadge level={need.priority.level} />
        <span className="ml-auto text-xs text-ink-muted">{formatWait(need.days)}</span>
      </div>
      <h3 className="mt-3 font-display text-[17px] font-semibold leading-snug text-ink">{need.title}</h3>
      <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
        <Icon name="location_on" className="text-[16px]" />
        {need.location.municipio} · {need.location.barrio}
      </p>
      {first && (
        <div className="mt-3">
          <ProgressBar
            value={need.progress.committed}
            max={need.progress.requested}
            status={need.status}
            label={
              need.items.length === 1
                ? `${first.committed} de ${first.requested} ${first.unit}`
                : `${need.items.length} ítems`
            }
          />
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <button onClick={onSelect} className="text-xs font-semibold text-primary hover:underline">
          Ver en el mapa
        </button>
        <Link
          to={`/necesidades/${need.id}`}
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
        >
          {need.status === 'atendida' ? 'Ver detalle' : 'Me comprometo'}
        </Link>
      </div>
    </article>
  )
}

function HousingCard({ offer, active, onSelect }: { offer: HousingView; active: boolean; onSelect: () => void }) {
  return (
    <article className={cardClass(active, 'border-housing/25')} onMouseEnter={onSelect}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-housing-soft px-2.5 py-1 text-xs font-semibold text-housing-dark">
            <Icon name="home" className="text-[14px]" /> Vivienda solidaria
          </span>
          <h3 className="mt-2 font-display text-[17px] font-semibold text-ink">{offer.title}</h3>
          <p className="mt-1 text-xs text-ink-soft">
            {offer.location.municipio} · {offer.location.barrio}
          </p>
        </div>
        {offer.seal && (
          <SolidaritySeal
            size="sm"
            label={offer.seal === 'arriendo_solidario' ? 'Arriendo solidario' : 'Alojamiento solidario'}
          />
        )}
      </div>
      <p className="mt-3 rounded-lg bg-housing-soft/50 px-3 py-2 text-xs font-medium text-housing-dark">
        {offer.monthlyPrice ? `${formatCOP(offer.monthlyPrice)}/mes` : 'Gratis'} · {offer.capacity.people} personas ·{' '}
        {AVAILABILITY_LABEL[offer.availability]}
      </p>
      <Link
        to={`/vivienda/${offer.id}`}
        className="mt-3 inline-block text-xs font-semibold text-housing hover:underline"
      >
        Ver ficha
      </Link>
    </article>
  )
}

function ResourceCard({ resource, active, onSelect }: { resource: Resource; active: boolean; onSelect: () => void }) {
  return (
    <article className={cardClass(active, 'border-resource/25')} onMouseEnter={onSelect}>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-resource-soft text-resource">
          <Icon name={RESOURCE_ICON[resource.type]} />
        </span>
        <div>
          <p className="text-xs font-semibold text-resource">Red lista · {RESOURCE_TYPE_LABEL[resource.type]}</p>
          <h3 className="font-display text-[15px] font-semibold text-ink">{resource.title}</h3>
          <p className="text-xs text-ink-soft">{resource.location.municipio} · Disponible</p>
        </div>
      </div>
    </article>
  )
}
