import type { ReactNode } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SolidaritySeal } from '@/components/ui/Badges'
import { repository } from '@/data'
import { aidStatus } from '@/domain/status'
import { MUNICIPIOS } from '@/domain/types'
import { formatNumber } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'

/** Inicio · spec: plataforma-web (requisito "Página de inicio"). Referencia: docs/design/stitch/inicio. */
export function LandingPage() {
  const { data } = useAsync(async () => {
    const [needs, resources, housing] = await Promise.all([
      repository.listNeeds(),
      repository.listResources(),
      repository.listHousing(),
    ])
    return {
      resources: resources.length,
      housing: housing.filter((h) => h.offerType !== 'arriendo_normal').length,
      unassisted: needs.filter((n) => aidStatus(n) === 'sin_ayuda').length,
    }
  })

  return (
    <>
      <Hero />
      <Metrics
        items={[
          { icon: 'shield', value: data?.resources, label: 'recursos en la Red lista', tone: 'text-resource' },
          { icon: 'home', value: data?.housing, label: 'viviendas solidarias', tone: 'text-housing' },
          { icon: 'emergency', value: data?.unassisted, label: 'necesidades sin ayuda', tone: 'text-need-none' },
          { icon: 'location_city', value: MUNICIPIOS.length, label: 'municipios conectados', tone: 'text-primary' },
        ]}
      />
      <Timeline />
      <Features />
      <Profiles />
      <Trust />
    </>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary/40 blur-3xl" />
      <div className="relative mx-auto grid max-w-content items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2 lg:px-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            <span className="h-2 w-2 rounded-full bg-need-done" /> Red activa en los 12 municipios del Quindío
          </span>
          <h1 className="mt-6 font-display text-[40px] font-bold leading-[1.08] tracking-tight md:text-display-lg">
            La ayuda lista antes de que la necesites.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            Empresas y vecinos registran desde hoy lo que pueden prestar. Cuando llegue una emergencia, recursos,
            viviendas solidarias y necesidades ya están en un solo mapa, y la ayuda llega a quien más espera.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/mapa" variant="light">
              <Icon name="map" className="text-[18px]" /> Explorar el mapa
            </ButtonLink>
            <ButtonLink to="/red-lista/registrar" className="bg-white/10 hover:bg-white/20">
              <Icon name="shield" className="text-[18px]" /> Registrar lo que puedo prestar
            </ButtonLink>
          </div>
        </div>
        <MapPreview />
      </div>
    </section>
  )
}

/** Ilustración del mapa: verde amontonado en Armenia, rojo en Quimbaya. */
function MapPreview() {
  const pin = (x: number, y: number, color: string, key: string) => (
    <g key={key} transform={`translate(${x} ${y})`}>
      <circle r="9" fill={color} stroke="#fff" strokeWidth="2.5" />
    </g>
  )
  const green = [
    [262, 208],
    [276, 220],
    [250, 224],
    [268, 236],
    [284, 206],
    [256, 244],
    [240, 212],
    [290, 230],
  ]
  const red = [
    [118, 96],
    [140, 110],
    [104, 124],
    [132, 136],
    [152, 90],
  ]
  return (
    <div className="relative rounded-[20px] border border-white/10 bg-white/5 p-3 shadow-lift">
      <div className="flex items-center justify-between px-2 pb-3 pt-1 text-xs text-white/70">
        <span className="font-semibold text-white">Mapa de prioridades · Quindío</span>
        <span className="rounded-full bg-need-none/20 px-2 py-0.5 text-[#FF9C9C]">Quimbaya se está quedando atrás</span>
      </div>
      <svg
        viewBox="0 0 400 300"
        className="w-full rounded-xl bg-[#1C353B]"
        role="img"
        aria-label="Vista previa del mapa: ayuda concentrada en Armenia y necesidades sin ayuda en Quimbaya"
      >
        <path
          d="M0 250 C 90 230, 150 270, 230 250 S 360 210, 400 230"
          stroke="#3B6FD8"
          strokeOpacity=".5"
          strokeWidth="6"
          fill="none"
        />
        <path
          d="M60 20 L 200 160 L 340 60 M200 160 L 180 300"
          stroke="#fff"
          strokeOpacity=".12"
          strokeWidth="3"
          strokeDasharray="8 6"
          fill="none"
        />
        {[
          ['Quimbaya', 100, 70],
          ['Circasia', 300, 70],
          ['Montenegro', 60, 170],
          ['Armenia', 240, 268],
          ['Calarcá', 330, 180],
        ].map(([t, x, y]) => (
          <text
            key={t as string}
            x={x as number}
            y={y as number}
            fill="#fff"
            fillOpacity=".55"
            fontSize="11"
            fontFamily="DM Sans"
          >
            {t}
          </text>
        ))}
        {green.map(([x, y], i) => pin(x, y, '#2E9E5B', `g${i}`))}
        {red.map(([x, y], i) => pin(x, y, '#D64545', `r${i}`))}
        {pin(90, 190, '#E0A100', 'y1')}
        {pin(320, 110, '#E0A100', 'y2')}
        {[
          [350, 150],
          [200, 60],
          [180, 200],
        ].map(([x, y], i) => (
          <rect
            key={`b${i}`}
            x={x - 8}
            y={y - 8}
            width="16"
            height="16"
            rx="4"
            fill="#3B6FD8"
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
        {[
          [310, 240],
          [60, 120],
        ].map(([x, y], i) => (
          <path
            key={`h${i}`}
            d={`M${x - 9} ${y + 8} V${y - 1} L${x} ${y - 9} L${x + 9} ${y - 1} V${y + 8} Z`}
            fill="#7B5EA7"
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-2 pb-1 pt-3 text-[11px] text-white/70">
        <Legend color="bg-need-none" label="Sin ayuda" />
        <Legend color="bg-need-transit" label="En camino" />
        <Legend color="bg-need-done" label="Atendida" />
        <Legend color="bg-resource rounded-[3px]" label="Recurso Red lista" />
        <Legend color="bg-housing" label="Vivienda" />
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  )
}

function Metrics({ items }: { items: { icon: string; value?: number; label: string; tone: string }[] }) {
  return (
    <section className="relative z-10 mx-auto -mt-10 max-w-content px-4 lg:px-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line shadow-soft md:grid-cols-4">
        {items.map((m) => (
          <div key={m.label} className="bg-white p-5 md:p-6">
            <Icon name={m.icon} className={`${m.tone} text-[22px]`} />
            <p className="mt-2 font-display text-3xl font-bold tabular-nums text-ink">
              {m.value === undefined ? '—' : formatNumber(m.value)}
            </p>
            <p className="text-sm text-ink-soft">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-light">{eyebrow}</p>
      <h2 className="mt-2 font-display text-[28px] font-bold leading-tight text-ink md:text-headline-lg">{title}</h2>
      {text && <p className="mt-3 text-ink-soft">{text}</p>}
    </div>
  )
}

function Timeline() {
  const steps = [
    {
      tag: 'Antes',
      icon: 'inventory_2',
      title: 'La red se arma en calma',
      text: 'Empresas y personas registran bodegas, camiones, plantas eléctricas, horas profesionales y viviendas. Cada 6 meses confirman que siguen disponibles.',
    },
    {
      tag: 'Durante',
      icon: 'emergency_home',
      title: 'La ayuda sale en horas',
      text: 'Negocios y familias publican lo que necesitan. La plataforma calcula la prioridad y muestra primero lo que nadie ha atendido.',
    },
    {
      tag: 'Después',
      icon: 'handshake',
      title: 'Nadie se queda atrás',
      text: 'Las barras de avance cierran lo que ya está cubierto y redirigen la ayuda a los puntos rojos más cercanos.',
    },
  ]
  return (
    <section className="mx-auto max-w-content px-4 py-20 lg:px-6">
      <SectionTitle
        eyebrow="Antes · Durante · Después"
        title="Preparación, no improvisación"
        text="Cuando ocurrió el sismo de 2026 la ayuda existía, pero tardó días en organizarse. Cadena de Favores+ adelanta ese trabajo."
      />
      <ol className="relative mt-12 grid gap-6 md:grid-cols-3">
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block" aria-hidden="true" />
        {steps.map((s, i) => (
          <li key={s.tag} className="relative">
            <span
              className={`relative inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-surface ${i === 0 ? 'bg-resource' : i === 1 ? 'bg-need-none' : 'bg-need-done'} text-white`}
            >
              <Icon name={s.icon} />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">{s.tag}</p>
            <h3 className="mt-1 font-display text-headline-sm text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Features() {
  return (
    <section className="bg-surface-low py-20">
      <div className="mx-auto max-w-content px-4 lg:px-6">
        <SectionTitle eyebrow="Lo que agrega el +" title="Tres funciones sobre el mapa que ya existe" />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <FeatureCard
            icon="shield"
            accent="bg-resource"
            tag="Resuelve el antes"
            title="Red lista"
            to="/red-lista/registrar"
            cta="Registrar un recurso"
            text="Registra desde ahora lo que podrías prestar en una emergencia. Aparece en el mapa como disponible."
          >
            <ul className="space-y-2 text-sm">
              {[
                'Bodega 200 m² · Calarcá',
                'Camión 3,5 t con conductor · Armenia',
                'Ingeniera civil · 20 horas · Circasia',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2 rounded-lg bg-resource-soft/60 px-3 py-2 text-ink">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-resource" />
                  {t}
                </li>
              ))}
            </ul>
          </FeatureCard>
          <FeatureCard
            icon="home"
            accent="bg-housing"
            tag="Resuelve el a quién"
            title="Vivienda solidaria"
            to="/vivienda/ofrecer"
            cta="Ofrecer una vivienda"
            text="Casas y habitaciones para familias que perdieron su hogar, con precio de referencia para frenar el alza de arriendos."
          >
            <div className="flex items-center gap-4 rounded-lg bg-housing-soft/60 p-3">
              <SolidaritySeal size="sm" />
              <div className="text-sm text-ink">
                <p className="font-semibold">$450.000 / mes</p>
                <p className="text-ink-soft">27 % bajo la referencia de la zona</p>
              </div>
            </div>
          </FeatureCard>
          <FeatureCard
            icon="traffic"
            accent="bg-primary"
            tag="Resuelve el dónde"
            title="Mapa de prioridades"
            to="/mapa"
            cta="Ver el mapa"
            text="Cada necesidad muestra su estado y prioridad. Lo que está cubierto se cierra y la ayuda se redirige."
          >
            <div className="space-y-2 rounded-lg bg-surface-mid p-3 text-sm">
              <div className="flex justify-between text-ink">
                <span>Carpas · Quimbaya</span>
                <span className="tabular-nums text-ink-soft">2 de 5</span>
              </div>
              <div className="h-2 rounded-full bg-surface-high">
                <div className="h-2 w-2/5 rounded-full bg-need-transit" />
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  )
}

function FeatureCard(props: {
  icon: string
  accent: string
  tag: string
  title: string
  text: string
  to: string
  cta: string
  children: ReactNode
}) {
  return (
    <article className="flex flex-col rounded-card border border-line bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-white ${props.accent}`}>
          <Icon name={props.icon} />
        </span>
        <span className="text-xs font-medium text-ink-muted">{props.tag}</span>
      </div>
      <h3 className="mt-5 font-display text-headline-sm text-ink">{props.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{props.text}</p>
      <div className="mt-5">{props.children}</div>
      <ButtonLink to={props.to} variant="secondary" className="mt-6 self-start">
        {props.cta} <Icon name="arrow_forward" className="text-[18px]" />
      </ButtonLink>
    </article>
  )
}

function Profiles() {
  const profiles = [
    {
      icon: 'storefront',
      title: 'Comerciante afectado',
      text: 'Encuentra bodega, transporte, equipos o asesoría para volver a abrir.',
      to: '/pedir-ayuda?perfil=comerciante',
      cta: 'Pedir ayuda para mi negocio',
    },
    {
      icon: 'family_restroom',
      title: 'Familia damnificada',
      text: 'Encuentra una vivienda segura, gratis o con arriendo solidario, en tu municipio.',
      to: '/pedir-ayuda?perfil=familia',
      cta: 'Buscar un lugar seguro',
      highlight: true,
    },
    {
      icon: 'volunteer_activism',
      title: 'Empresa o persona que ayuda',
      text: 'Mira dónde hace más falta y comprométete con una necesidad concreta.',
      to: '/mapa?vista=mas-falta',
      cta: 'Ver dónde hace falta',
    },
  ]
  return (
    <section className="mx-auto max-w-content px-4 py-20 lg:px-6">
      <SectionTitle eyebrow="Participa" title="¿Cómo quieres participar?" />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {profiles.map((p) => (
          <article
            key={p.title}
            className={`rounded-card border p-6 ${p.highlight ? 'border-primary bg-primary text-white shadow-lift' : 'border-line bg-white shadow-soft'}`}
          >
            <Icon name={p.icon} className={`text-[28px] ${p.highlight ? 'text-primary-soft' : 'text-primary'}`} />
            <h3 className="mt-4 font-display text-headline-sm">{p.title}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${p.highlight ? 'text-white/80' : 'text-ink-soft'}`}>
              {p.text}
            </p>
            <ButtonLink to={p.to} variant={p.highlight ? 'light' : 'primary'} className="mt-6">
              {p.cta}
            </ButtonLink>
          </article>
        ))}
      </div>
    </section>
  )
}

function Trust() {
  const items = [
    {
      icon: 'verified_user',
      title: 'Usuarios verificados',
      text: 'Cada cuenta se valida con cédula o NIT para evitar ofertas falsas.',
    },
    {
      icon: 'lock',
      title: 'Tus datos protegidos',
      text: 'La dirección exacta y el teléfono solo se comparten cuando las dos partes aceptan (Ley 1581 de 2012).',
    },
    {
      icon: 'flag',
      title: 'La comunidad vigila',
      text: 'Cualquier persona puede reportar una publicación sospechosa.',
    },
  ]
  return (
    <section className="border-t border-line bg-sand/50 py-16">
      <div className="mx-auto grid max-w-content gap-8 px-4 md:grid-cols-3 lg:px-6">
        {items.map((i) => (
          <div key={i.title} className="flex gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-soft">
              <Icon name={i.icon} />
            </span>
            <div>
              <h3 className="font-display font-semibold text-ink">{i.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{i.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
