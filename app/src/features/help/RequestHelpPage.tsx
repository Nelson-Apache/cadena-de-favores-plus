import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { repository } from '@/data'
import { useSession } from '@/features/account/useSession'
import { Button } from '@/components/ui/Button'
import { FieldError, TextField, fieldClass } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { canPublishNeed, countActiveNeeds, NEED_LIMIT_MESSAGE } from '@/domain/needLimit'
import {
  MUNICIPIOS,
  NEED_TYPES,
  REQUESTER_PROFILES,
  VULNERABILITIES,
  type Municipio,
  type RequesterProfile,
} from '@/domain/types'
import {
  NEED_TYPE_HINT,
  NEED_TYPE_ICON,
  NEED_TYPE_LABEL,
  REQUESTER_HINT,
  REQUESTER_ICON,
  REQUESTER_LABEL,
  VULNERABILITY_LABEL,
} from '@/lib/labels'
import { useAsync } from '@/lib/useAsync'
import { useDataVersion } from '@/lib/useDataVersion'
import { ChoiceCard } from './ChoiceCard'
import { ItemsEditor } from './ItemsEditor'
import { OptionGroup } from './OptionGroup'
import { PeopleField } from './PeopleField'
import { useRequestHelpForm } from './useRequestHelpForm'

const cardClass = 'rounded-card border border-line bg-white p-5 shadow-soft md:p-6'
const sectionTitle = 'font-display text-headline-sm text-ink'

/** Lee `?perfil=comerciante|familia`; cualquier otro valor deja el perfil sin elegir. */
function profileFromParams(params: URLSearchParams): RequesterProfile | '' {
  const value = params.get('perfil')
  return REQUESTER_PROFILES.find((p) => p === value) ?? ''
}

/**
 * Pedir ayuda · spec: necesidades › Registrar una necesidad.
 * Referencia visual: docs/design/stitch/pedir-ayuda.
 * Privacidad: no se pide dirección exacta ni teléfono; la ubicación pública es municipio y barrio.
 */
export function RequestHelpPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const current = useSession()
  const ownerId = current?.profile.id
  const form = useRequestHelpForm(profileFromParams(params), ownerId)
  const { values, errors } = form

  const dataVersion = useDataVersion()
  const { data: needs } = useAsync(() => repository.listNeeds(), [dataVersion])
  const limitReached = !!needs && !!ownerId && !canPublishNeed(countActiveNeeds(needs, ownerId))

  const focusFirstError = () =>
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>('[aria-invalid="true"], fieldset[data-invalid] input, [role="alert"]')
        ?.focus(),
    )

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const id = await form.submit()
    if (id) navigate(`/necesidades/${id}`, { state: { published: true } })
    else focusFirstError()
  }

  return (
    <div className="mx-auto max-w-content px-4 py-8 md:py-12 lg:px-6">
      <div className="grid items-start gap-8 lg:grid-cols-12">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6 lg:col-span-8">
          <header className="flex flex-col gap-3">
            <p className="inline-flex items-center gap-2 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-light">
              <Icon name="handshake" className="text-[16px]" /> Pedir ayuda
            </p>
            <h1 className="font-display text-[28px] font-bold leading-tight text-ink md:text-headline-lg">
              Cuéntanos qué necesitas. Te conectamos con quien puede ayudar.
            </h1>
            <p className="max-w-2xl text-ink-soft">
              Tu solicitud aparece en el mapa para que personas, comercios y la Red lista puedan comprometerse. No estás
              solo.
            </p>
          </header>

          {limitReached && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-card border border-line bg-surface-mid p-4 text-sm font-semibold text-ink"
            >
              <Icon name="info" className="mt-0.5 text-[18px]" />
              {NEED_LIMIT_MESSAGE}
            </p>
          )}
          {form.formError && (
            <p
              role="alert"
              tabIndex={-1}
              className="flex items-start gap-2 rounded-card border border-ink bg-white p-4 text-sm font-semibold text-ink"
            >
              <Icon name="emergency_home" className="mt-0.5 text-[18px]" />
              {form.formError}
            </p>
          )}

          <section className={cardClass} aria-labelledby="paso-perfil">
            <h2 id="paso-perfil" className={sectionTitle}>
              1. ¿Quién pide la ayuda?
            </h2>
            <div className="mt-4">
              <OptionGroup id="need-requester" legend="Tu perfil" error={errors.requester}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {REQUESTER_PROFILES.map((p) => (
                    <ChoiceCard
                      key={p}
                      id={`need-requester-${p}`}
                      name="requester"
                      value={p}
                      icon={REQUESTER_ICON[p]}
                      title={REQUESTER_LABEL[p]}
                      hint={REQUESTER_HINT[p]}
                      checked={values.requester === p}
                      onChange={() => form.setField('requester', p)}
                    />
                  ))}
                </div>
              </OptionGroup>
            </div>
          </section>

          <section className={cardClass} aria-labelledby="paso-tipo">
            <h2 id="paso-tipo" className={sectionTitle}>
              2. ¿Cuál es la necesidad más urgente?
            </h2>
            <div className="mt-4">
              <OptionGroup id="need-type" legend="Tipo de ayuda" error={errors.type}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {NEED_TYPES.map((t) => (
                    <ChoiceCard
                      key={t}
                      id={`need-type-${t}`}
                      name="type"
                      value={t}
                      icon={NEED_TYPE_ICON[t]}
                      title={NEED_TYPE_LABEL[t]}
                      hint={NEED_TYPE_HINT[t]}
                      checked={values.type === t}
                      onChange={() => form.setField('type', t)}
                    />
                  ))}
                </div>
              </OptionGroup>
            </div>
          </section>

          <section className={`${cardClass} flex flex-col gap-6`} aria-labelledby="paso-detalle">
            <div>
              <h2 id="paso-detalle" className={sectionTitle}>
                3. Detalles de tu grupo y de lo que falta
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Con esto calculamos la prioridad para que la ayuda llegue primero a quien más la necesita.
              </p>
            </div>
            <ItemsEditor
              items={values.items}
              error={errors.items}
              onChange={form.setItem}
              onAdd={form.addItem}
              onRemove={form.removeItem}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <PeopleField
                value={values.peopleAffected}
                error={errors.peopleAffected}
                onChange={(n) => form.setField('peopleAffected', n)}
              />
            </div>
            <OptionGroup
              id="need-vulnerabilities"
              legend="¿Hay personas con mayor riesgo en el grupo? (marca todas las que apliquen)"
              error={errors.vulnerabilities}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {VULNERABILITIES.map((v) => (
                  <label
                    key={v}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-3 text-sm font-medium text-ink hover:bg-surface-low"
                  >
                    <input
                      type="checkbox"
                      id={`need-vulnerability-${v}`}
                      className="h-5 w-5 rounded border-line text-primary focus:ring-primary"
                      checked={values.vulnerabilities.includes(v)}
                      onChange={() => form.toggleVulnerability(v)}
                    />
                    {VULNERABILITY_LABEL[v]}
                  </label>
                ))}
              </div>
            </OptionGroup>
          </section>

          <section className={`${cardClass} flex flex-col gap-5`} aria-labelledby="paso-lugar">
            <div>
              <h2 id="paso-lugar" className={sectionTitle}>
                4. ¿Dónde estás?
              </h2>
              <p className="mt-1 flex items-start gap-2 text-sm text-ink-soft">
                <Icon name="lock" className="mt-0.5 text-[16px]" />
                Solo mostramos tu municipio y barrio. Tu dirección exacta y tu teléfono no se publican.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label htmlFor="need-municipio" className="block text-sm font-semibold text-ink">
                  Municipio
                </label>
                <select
                  id="need-municipio"
                  className={`mt-1.5 ${fieldClass}`}
                  value={values.municipio}
                  aria-invalid={errors.municipio ? true : undefined}
                  aria-describedby={errors.municipio ? 'need-municipio-error' : undefined}
                  onChange={(e) => form.setField('municipio', e.target.value as Municipio | '')}
                >
                  <option value="">Elige tu municipio</option>
                  {MUNICIPIOS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <FieldError id="need-municipio-error">{errors.municipio}</FieldError>
              </div>
              <TextField
                id="need-barrio"
                label="Barrio o vereda"
                placeholder="Ej.: La Española"
                autoComplete="off"
                value={values.barrio}
                error={errors.barrio}
                onChange={(e) => form.setField('barrio', e.target.value)}
              />
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={form.publishing || limitReached}>
              <Icon name="send" className="text-[18px]" />
              {form.publishing ? 'Publicando…' : 'Publicar mi necesidad'}
            </Button>
            <p className="text-sm text-ink-soft">Podrás ver tu solicitud en el mapa apenas la publiques.</p>
          </div>
        </form>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-span-4">
          <div className={cardClass}>
            <h2 className={sectionTitle}>¿Qué pasa después?</h2>
            <ol className="mt-3 space-y-3 text-sm text-ink-soft">
              <li>1. Tu necesidad aparece en el mapa como «Sin ayuda» con su prioridad.</li>
              <li>2. Quien quiera ayudar elige un ítem y se compromete con una cantidad.</li>
              <li>3. Cuando recibas la ayuda, tú confirmas la entrega en la página de tu necesidad.</li>
            </ol>
          </div>
          <div className={cardClass}>
            <h2 className={sectionTitle}>Tu privacidad</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Nunca publicamos tu dirección exacta ni tu teléfono. Puedes tener hasta 3 necesidades activas a la vez.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
