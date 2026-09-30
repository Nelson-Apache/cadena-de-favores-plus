import { createLocalStorageRepository } from '@/data/localStorageRepository'
import { createMockRepository } from '@/data/mockRepository'
import { NEEDS_ERRORS } from '@/data/needsOperations'
import type { Repository } from '@/data/repository'
import { createMemoryStore } from '@/data/storage'
import { COMMITMENT_ERRORS } from '@/domain/commitment'
import { DELIVERY_ERRORS } from '@/domain/delivery'
import { NEED_ERRORS } from '@/domain/needForm'
import { NEED_LIMIT_MESSAGE } from '@/domain/needLimit'
import { computePriority } from '@/domain/priority'
import { nearestUnattended } from '@/domain/redirect'
import { acceptsOffers, aidStatus } from '@/domain/status'
import type { Actor, NewNeedInput } from '@/domain/types'

/**
 * Suite de contrato de las escrituras de necesidades (spec: necesidades), parte de la tarea 4.1 de add-necesidades.
 * `mockRepository` y `localStorageRepository` deben pasar exactamente las mismas pruebas (Liskov).
 * Cada prueba usa un repositorio nuevo y aislado: nunca la instancia compartida `mockRepository`.
 */

const NOW = new Date('2026-09-29T12:00:00.000Z')
const clock = () => NOW
const MISSING_ID = 'no-existe'

const createMock = (): Repository => createMockRepository(undefined, clock)
const createLocal = (): Repository => createLocalStorageRepository(createMemoryStore(), clock)

const ADAPTERS: [string, () => Repository][] = [
  ['mockRepository', createMock],
  ['localStorageRepository (almacén en memoria)', createLocal],
]

const OWNER = 'u-dueno'
const HELPER = 'u-10'
const receiver: Actor = { id: OWNER, role: 'usuario' }
const helper: Actor = { id: HELPER, role: 'usuario' }
const stranger: Actor = { id: 'u-tercero', role: 'usuario' }
const coordinator: Actor = { id: 'u-coordinador', role: 'coordinador' }

const newNeed = (overrides: Partial<NewNeedInput> = {}): NewNeedInput => ({
  requester: 'familia',
  type: 'carpas',
  items: [{ label: 'Carpas', unit: 'carpas', requested: 5 }],
  peopleAffected: 18,
  vulnerabilities: ['ninos'],
  municipio: 'Quimbaya',
  barrio: 'La Española',
  ...overrides,
})

/** Publica una necesidad de 5 carpas del dueño `OWNER` (o de otro dueño). */
const publish = (repo: Repository, ownerId = OWNER) => repo.createNeed(newNeed(), ownerId)

describe.each(ADAPTERS)('Contrato de necesidades · %s', (_name, createRepository) => {
  describe('Registrar una necesidad', () => {
    it('Familia pide carpas: nace "sin ayuda", con su dueño y nada comprometido', async () => {
      const repo = createRepository()

      const created = await publish(repo)

      expect({ status: aidStatus(created), ownerId: created.ownerId, committed: created.items[0].committed }).toEqual({
        status: 'sin_ayuda',
        ownerId: OWNER,
        committed: 0,
      })
    })

    it('Familia pide carpas: aparece en el mapa (listNeeds y getNeed) con un id nuevo', async () => {
      const repo = createRepository()
      const before = (await repo.listNeeds()).length

      const created = await publish(repo)

      expect({ total: (await repo.listNeeds()).length, found: await repo.getNeed(created.id) }).toEqual({
        total: before + 1,
        found: created,
      })
    })

    it('Familia pide carpas: la prioridad calculada es alta (9 puntos) para 18 personas con niños', async () => {
      const repo = createRepository()

      const created = await publish(repo)

      expect(computePriority(created, NOW)).toMatchObject({ total: 9, level: 'alta' })
    })

    it('Familia pide carpas: la ubicación pública es barrio y municipio, sin dirección ni teléfono', async () => {
      const repo = createRepository()

      const created = await publish(repo)

      expect(created.location).toMatchObject({ municipio: 'Quimbaya', barrio: 'La Española' })
      expect(Object.keys(created)).not.toContain('address')
      expect(Object.keys(created)).not.toContain('phone')
    })

    it('Datos incompletos: sin tipo indica el campo "type" y no publica', async () => {
      const repo = createRepository()
      const before = (await repo.listNeeds()).length
      const input = { ...newNeed(), type: undefined } as unknown as NewNeedInput

      await expect(repo.createNeed(input, OWNER)).rejects.toMatchObject({ errors: { type: NEED_ERRORS.type } })

      expect((await repo.listNeeds()).length).toBe(before)
    })

    it('Datos incompletos: cantidad en cero indica el campo "items" y no publica', async () => {
      const repo = createRepository()
      const before = (await repo.listNeeds()).length
      const input = newNeed({ items: [{ label: 'Carpas', unit: 'carpas', requested: 0 }] })

      await expect(repo.createNeed(input, OWNER)).rejects.toMatchObject({ errors: { items: NEED_ERRORS.items } })

      expect((await repo.listNeeds()).length).toBe(before)
    })

    it('Datos incompletos: sin municipio indica el campo "municipio" y no publica', async () => {
      const repo = createRepository()
      const before = (await repo.listNeeds()).length
      const input = { ...newNeed(), municipio: undefined } as unknown as NewNeedInput

      await expect(repo.createNeed(input, OWNER)).rejects.toMatchObject({
        errors: { municipio: NEED_ERRORS.municipio },
      })

      expect((await repo.listNeeds()).length).toBe(before)
    })

    it('Datos incompletos: con varios campos faltantes informa todos a la vez', async () => {
      const repo = createRepository()
      const input = { ...newNeed(), type: undefined, municipio: undefined } as unknown as NewNeedInput

      await expect(repo.createNeed(input, OWNER)).rejects.toMatchObject({
        errors: { type: NEED_ERRORS.type, municipio: NEED_ERRORS.municipio },
      })
    })

    it('Publicar sin sesión: un dueño vacío pide ingresar', async () => {
      const repo = createRepository()

      await expect(repo.createNeed(newNeed(), '')).rejects.toThrow(NEEDS_ERRORS.owner)
    })
  })

  describe('Límite de 3 necesidades activas por usuario', () => {
    const publishThree = async (repo: Repository) => {
      await publish(repo)
      await publish(repo)
      return publish(repo)
    }

    it('la tercera necesidad se publica', async () => {
      const repo = createRepository()

      const third = await publishThree(repo)

      expect(third.ownerId).toBe(OWNER)
    })

    it('la cuarta se rechaza con el mensaje del límite y no se crea', async () => {
      const repo = createRepository()
      await publishThree(repo)
      const before = (await repo.listNeeds()).length

      await expect(publish(repo)).rejects.toThrow(NEED_LIMIT_MESSAGE)

      expect((await repo.listNeeds()).length).toBe(before)
    })

    it('se libera un cupo cuando una necesidad queda atendida', async () => {
      const repo = createRepository()
      const third = await publishThree(repo)
      const { commitment } = await repo.commit(third.id, 'Carpas', 5, HELPER)
      await repo.confirmDelivery(commitment.id, receiver)

      const fourth = await publish(repo)

      expect(fourth.ownerId).toBe(OWNER)
    })

    it('el límite se cuenta por dueño: otro usuario puede publicar', async () => {
      const repo = createRepository()
      await publishThree(repo)

      const other = await publish(repo, 'u-otro')

      expect(other.ownerId).toBe('u-otro')
    })
  })

  describe('Comprometerse con una necesidad', () => {
    it('Compromiso parcial: 2 de 5 carpas deja el ítem en 2 y el estado "en_camino"', async () => {
      const repo = createRepository()
      const created = await publish(repo)

      const result = await repo.commit(created.id, 'Carpas', 2, HELPER)

      expect(result.status).toBe('en_camino')
      expect((await repo.getNeed(created.id))?.items[0]).toMatchObject({ requested: 5, committed: 2, delivered: 0 })
    })

    it('Compromiso parcial: el compromiso queda en el historial como "comprometido"', async () => {
      const repo = createRepository()
      const created = await publish(repo)

      await repo.commit(created.id, 'Carpas', 2, HELPER)

      expect(await repo.listCommitments(created.id)).toMatchObject([
        { needId: created.id, itemLabel: 'Carpas', quantity: 2, helperId: HELPER, status: 'comprometido' },
      ])
    })

    it('Cantidad mayor a lo que falta: faltan 3 y se piden 5, se limita a 3 con aviso', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      await repo.commit(created.id, 'Carpas', 2, HELPER)

      const result = await repo.commit(created.id, 'Carpas', 5, 'u-11')

      expect({ requested: result.requested, effective: result.effective, limited: result.limited }).toEqual({
        requested: 5,
        effective: 3,
        limited: true,
      })
      expect(result.notice).toContain('El resto ya no hace falta')
    })

    it('Cantidad mayor a lo que falta: lo guardado nunca supera lo pedido', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      await repo.commit(created.id, 'Carpas', 2, HELPER)

      const { commitment } = await repo.commit(created.id, 'Carpas', 5, 'u-11')

      expect(commitment.quantity).toBe(3)
      expect((await repo.getNeed(created.id))?.items[0].committed).toBe(5)
    })

    it('Cantidad exacta: comprometer justo lo que falta no limita ni avisa', async () => {
      const repo = createRepository()
      const created = await publish(repo)

      const result = await repo.commit(created.id, 'Carpas', 5, HELPER)

      expect({ limited: result.limited, notice: result.notice }).toEqual({ limited: false, notice: undefined })
    })

    it('Compromiso inválido: cantidad cero, ítem inexistente y necesidad inexistente lanzan error', async () => {
      const repo = createRepository()
      const created = await publish(repo)

      await expect(repo.commit(created.id, 'Carpas', 0, HELPER)).rejects.toThrow(COMMITMENT_ERRORS.quantity)
      await expect(repo.commit(created.id, 'Nada', 1, HELPER)).rejects.toThrow(COMMITMENT_ERRORS.item)
      await expect(repo.commit(MISSING_ID, 'Carpas', 1, HELPER)).rejects.toThrow(NEEDS_ERRORS.needNotFound)
    })

    it('Comprometerse sin sesión: un ayudante vacío pide ingresar', async () => {
      const repo = createRepository()
      const created = await publish(repo)

      await expect(repo.commit(created.id, 'Carpas', 1, '')).rejects.toThrow(NEEDS_ERRORS.helper)
    })

    it('Historial: listCommitments filtra por necesidad y sin filtro devuelve todos en orden de creación', async () => {
      const repo = createRepository()
      const a = await publish(repo)
      const b = await publish(repo)
      const first = await repo.commit(a.id, 'Carpas', 1, HELPER)
      const second = await repo.commit(b.id, 'Carpas', 1, HELPER)
      const third = await repo.commit(a.id, 'Carpas', 1, HELPER)

      const ofA = (await repo.listCommitments(a.id)).map((c) => c.id)
      const all = (await repo.listCommitments()).map((c) => c.id)

      expect(ofA).toEqual([first.commitment.id, third.commitment.id])
      expect(all.slice(-3)).toEqual([first.commitment.id, second.commitment.id, third.commitment.id])
    })
  })

  describe('Confirmar la entrega', () => {
    it('Entrega confirmada completa: el receptor confirma todo y la necesidad queda atendida', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      const { commitment } = await repo.commit(created.id, 'Carpas', 5, HELPER)

      const confirmed = await repo.confirmDelivery(commitment.id, receiver)

      expect(aidStatus(confirmed.need)).toBe('atendida')
      expect(confirmed.commitment).toMatchObject({ status: 'confirmado', confirmedBy: OWNER })
    })

    it('Entrega confirmada completa: el estado guardado también es "atendida"', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      const { commitment } = await repo.commit(created.id, 'Carpas', 5, HELPER)
      await repo.confirmDelivery(commitment.id, receiver)

      const stored = await repo.getNeed(created.id)

      expect(aidStatus({ items: stored?.items ?? [] })).toBe('atendida')
    })

    it('Entrega parcial: confirmar 2 de 5 suma delivered y la necesidad sigue "en_camino"', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      const { commitment } = await repo.commit(created.id, 'Carpas', 2, HELPER)

      const confirmed = await repo.confirmDelivery(commitment.id, receiver)

      expect(confirmed.need.items[0].delivered).toBe(2)
      expect(aidStatus(confirmed.need)).toBe('en_camino')
    })

    it('quien ayuda marca la entrega: el compromiso pasa a "entregado" con fecha', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      const { commitment } = await repo.commit(created.id, 'Carpas', 2, HELPER)

      const marked = await repo.markDelivered(commitment.id, helper)

      expect(marked).toMatchObject({ status: 'entregado', deliveredAt: NOW.toISOString() })
      expect((await repo.listCommitments(created.id))[0].status).toBe('entregado')
    })

    it('marcar entregado no cambia delivered: solo cuenta al confirmar el receptor', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      const { commitment } = await repo.commit(created.id, 'Carpas', 5, HELPER)

      await repo.markDelivered(commitment.id, helper)

      expect((await repo.getNeed(created.id))?.items[0].delivered).toBe(0)
    })

    it('un coordinador puede confirmar por el receptor', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      const { commitment } = await repo.commit(created.id, 'Carpas', 5, HELPER)

      const confirmed = await repo.confirmDelivery(commitment.id, coordinator)

      expect(confirmed.commitment.confirmedBy).toBe('u-coordinador')
    })

    it('un tercero no puede confirmar y no cambia nada', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      const { commitment } = await repo.commit(created.id, 'Carpas', 5, HELPER)

      await expect(repo.confirmDelivery(commitment.id, stranger)).rejects.toThrow(DELIVERY_ERRORS.forbiddenConfirm)

      expect((await repo.getNeed(created.id))?.items[0].delivered).toBe(0)
    })

    it('quien ayuda no puede confirmar su propia entrega', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      const { commitment } = await repo.commit(created.id, 'Carpas', 5, HELPER)

      await expect(repo.confirmDelivery(commitment.id, helper)).rejects.toThrow(DELIVERY_ERRORS.forbiddenConfirm)
    })

    it('markDelivered solo lo hace quien se comprometió (ni el receptor ni un coordinador)', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      const { commitment } = await repo.commit(created.id, 'Carpas', 5, HELPER)

      await expect(repo.markDelivered(commitment.id, receiver)).rejects.toThrow(DELIVERY_ERRORS.forbiddenMark)
      await expect(repo.markDelivered(commitment.id, coordinator)).rejects.toThrow(DELIVERY_ERRORS.forbiddenMark)
    })

    it('no se confirma dos veces y delivered no se duplica', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      const { commitment } = await repo.commit(created.id, 'Carpas', 2, HELPER)
      await repo.confirmDelivery(commitment.id, receiver)

      await expect(repo.confirmDelivery(commitment.id, receiver)).rejects.toThrow(DELIVERY_ERRORS.alreadyConfirmed)

      expect((await repo.getNeed(created.id))?.items[0].delivered).toBe(2)
    })

    it('no se marca entregado un compromiso ya confirmado', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      const { commitment } = await repo.commit(created.id, 'Carpas', 2, HELPER)
      await repo.confirmDelivery(commitment.id, receiver)

      await expect(repo.markDelivered(commitment.id, helper)).rejects.toThrow(DELIVERY_ERRORS.alreadyConfirmed)
    })

    it('un compromiso inexistente lanza error', async () => {
      const repo = createRepository()

      await expect(repo.confirmDelivery(MISSING_ID, coordinator)).rejects.toThrow(NEEDS_ERRORS.commitmentNotFound)
      await expect(repo.markDelivered(MISSING_ID, helper)).rejects.toThrow(NEEDS_ERRORS.commitmentNotFound)
    })

    it('un actor sin id (sin sesión) pide ingresar', async () => {
      const repo = createRepository()

      await expect(repo.confirmDelivery(MISSING_ID, { id: '', role: 'usuario' })).rejects.toThrow(NEEDS_ERRORS.actor)
    })

    it('necesidad sembrada con dueño (n-482): la confirma su dueño u-familia', async () => {
      const repo = createRepository()
      const { commitment } = await repo.commit('n-482', 'Carpas', 1, HELPER)

      const confirmed = await repo.confirmDelivery(commitment.id, { id: 'u-familia', role: 'usuario' })

      expect(confirmed.commitment.status).toBe('confirmado')
    })

    it('necesidad sembrada sin dueño (n-483): un usuario no la confirma', async () => {
      const repo = createRepository()
      const { commitment } = await repo.commit('n-483', 'Alojamiento', 1, HELPER)

      await expect(repo.confirmDelivery(commitment.id, { id: 'u-familia', role: 'usuario' })).rejects.toThrow(
        DELIVERY_ERRORS.forbiddenConfirm,
      )
    })

    it('necesidad sembrada sin dueño (n-483): un coordinador sí la confirma', async () => {
      const repo = createRepository()
      const { commitment } = await repo.commit('n-483', 'Alojamiento', 1, HELPER)

      const confirmed = await repo.confirmDelivery(commitment.id, coordinator)

      expect(confirmed.commitment.status).toBe('confirmado')
    })
  })

  describe('Redirigir ayuda de puntos cubiertos', () => {
    it('Oferta a necesidad cubierta: al 100 % comprometida ya no acepta ofertas', async () => {
      const repo = createRepository()
      const created = await publish(repo)

      await repo.commit(created.id, 'Carpas', 5, HELPER)

      expect(acceptsOffers((await repo.getNeed(created.id))!)).toBe(false)
    })

    it('Oferta a necesidad cubierta: "Me comprometo" indica que ya está cubierta y no crea compromiso', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      await repo.commit(created.id, 'Carpas', 5, HELPER)

      await expect(repo.commit(created.id, 'Carpas', 1, 'u-11')).rejects.toThrow(COMMITMENT_ERRORS.covered)

      expect(await repo.listCommitments(created.id)).toHaveLength(1)
    })

    it('Oferta a necesidad cubierta: lista hasta 3 necesidades sin ayuda, ordenadas por distancia', async () => {
      const repo = createRepository()
      const covered = await publish(repo)
      await repo.commit(covered.id, 'Carpas', 5, HELPER)

      const near = nearestUnattended((await repo.getNeed(covered.id))!, await repo.listNeeds())
      const distances = near.map((n) => n.distanceKm)

      expect(near.length).toBeGreaterThan(0)
      expect(near.length).toBeLessThanOrEqual(3)
      expect(near.every((n) => aidStatus(n) === 'sin_ayuda' && n.id !== covered.id)).toBe(true)
      expect(distances).toEqual([...distances].sort((a, b) => a - b))
    })

    it('Oferta a necesidad cubierta: una necesidad nueva sin ayuda cercana aparece en la lista', async () => {
      const repo = createRepository()
      const covered = await publish(repo)
      await repo.commit(covered.id, 'Carpas', 5, HELPER)
      const open = await repo.createNeed(newNeed({ barrio: 'Centro' }), 'u-otro')

      const near = nearestUnattended((await repo.getNeed(covered.id))!, await repo.listNeeds())

      expect(near.map((n) => n.id)).toContain(open.id)
    })
  })

  describe('Reportar publicación sospechosa', () => {
    it('Reporte: queda registrado con motivo, necesidad, autor y fecha', async () => {
      const repo = createRepository()
      const created = await publish(repo)

      const report = await repo.reportNeed(created.id, '  Datos falsos  ', 'u-tercero')

      expect(report).toMatchObject({
        needId: created.id,
        reason: 'Datos falsos',
        reporterId: 'u-tercero',
        createdAt: NOW.toISOString(),
      })
      expect(await repo.listReports()).toEqual([report])
    })

    it('Reporte anónimo: sin reporterId también se registra', async () => {
      const repo = createRepository()
      const created = await publish(repo)

      const report = await repo.reportNeed(created.id, 'Parece repetida')

      expect(Object.keys(report)).not.toContain('reporterId')
      expect(await repo.listReports()).toHaveLength(1)
    })

    it('Reporte: los identificadores de reportes no se repiten', async () => {
      const repo = createRepository()
      const created = await publish(repo)
      await repo.reportNeed(created.id, 'Uno')
      await repo.reportNeed(created.id, 'Dos')

      const ids = (await repo.listReports()).map((r) => r.id)

      expect(new Set(ids).size).toBe(2)
    })

    it('Reporte sin motivo (vacío o solo espacios) lanza error y no registra', async () => {
      const repo = createRepository()
      const created = await publish(repo)

      await expect(repo.reportNeed(created.id, '')).rejects.toThrow(NEEDS_ERRORS.reason)
      await expect(repo.reportNeed(created.id, '   ')).rejects.toThrow(NEEDS_ERRORS.reason)

      expect(await repo.listReports()).toEqual([])
    })

    it('Reporte de una necesidad inexistente lanza error', async () => {
      const repo = createRepository()

      await expect(repo.reportNeed(MISSING_ID, 'Motivo')).rejects.toThrow(NEEDS_ERRORS.needNotFound)
    })

    it('sin reportes, listReports devuelve una lista vacía', async () => {
      const repo = createRepository()

      expect(await repo.listReports()).toEqual([])
    })
  })

  describe('Detalle de una necesidad', () => {
    it('Explicación de la prioridad: los 4 criterios suman el total y el nivel sigue el umbral', async () => {
      const repo = createRepository()
      const created = await publish(repo)

      const p = computePriority(created, NOW)

      expect(p).toMatchObject({ type: 3, people: 3, vulnerability: 2, wait: 1, total: 9, level: 'alta' })
      expect(p.type + p.people + p.vulnerability + p.wait).toBe(p.total)
    })
  })
})

describe('Contrato de necesidades · equivalencia entre adaptadores', () => {
  const run = async (repo: Repository) => {
    const created = await publish(repo)
    const { commitment } = await repo.commit(created.id, 'Carpas', 2, HELPER)
    await repo.commit(created.id, 'Carpas', 5, 'u-11')
    await repo.markDelivered(commitment.id, helper)
    await repo.confirmDelivery(commitment.id, receiver)
    await repo.reportNeed(created.id, 'Motivo', 'u-tercero')
    return {
      needs: await repo.listNeeds(),
      commitments: await repo.listCommitments(),
      reports: await repo.listReports(),
    }
  }

  it('el mismo ciclo de operaciones deja los mismos datos en ambos adaptadores', async () => {
    const fromLocal = await run(createLocal())
    const fromMock = await run(createMock())

    expect(fromLocal).toEqual(fromMock)
  })
})
