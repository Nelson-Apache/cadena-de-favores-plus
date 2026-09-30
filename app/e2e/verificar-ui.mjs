// Verificación de UI de `add-persistencia-local` en un navegador real (Edge/Chrome sin ventana, protocolo CDP).
// No agrega dependencias: usa Node >= 22 (WebSocket y fetch globales).
//
// Uso (desde app/):   npm run build && node e2e/verificar-ui.mjs
// Variables: BROWSER (ruta del ejecutable), PORT (servidor de vista previa, 4173 por defecto).
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Claves de almacenamiento: se leen de src/data/localState.ts para que un cambio de versión no rompa este script.
const DATA_VERSION = Number(
  /export const DATA_VERSION = (\d+)/.exec(readFileSync('src/data/localState.ts', 'utf8'))?.[1],
)
if (!DATA_VERSION) throw new Error('No se pudo leer DATA_VERSION de src/data/localState.ts')
const DATA_KEY = `cdf-plus:v${DATA_VERSION}`
const SESSION_KEY = `${DATA_KEY}:sesion`

const PORT = Number(process.env.PORT ?? 4173)
const BASE = `http://localhost:${PORT}`
const DEBUG_PORT = 9333
const CANDIDATES = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)
const browserPath = CANDIDATES.find((p) => existsSync(p))
if (!browserPath) throw new Error('No se encontró Edge ni Chrome. Define BROWSER con la ruta del ejecutable.')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASA ' : 'FALLA'}  ${name}${detail ? ` · ${detail}` : ''}`)
}

// ---------- Servidor de vista previa y navegador ----------
const preview = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'],
  {
    stdio: 'ignore',
  },
)
const profileDir = mkdtempSync(join(tmpdir(), 'cdf-e2e-'))
const chrome = spawn(
  browserPath,
  [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--disable-gpu',
    'about:blank',
  ],
  { stdio: 'ignore' },
)
const cleanup = () => {
  chrome.kill()
  preview.kill()
}
process.on('exit', cleanup)

async function waitFor(fn, label, tries = 80) {
  for (let i = 0; i < tries; i++) {
    try {
      const v = await fn()
      if (v) return v
    } catch {
      /* reintenta */
    }
    await sleep(150)
  }
  throw new Error(`Tiempo agotado: ${label}`)
}

await waitFor(() => fetch(BASE).then((r) => r.ok), 'servidor de vista previa')
const target = await waitFor(async () => {
  const list = await (await fetch(`http://localhost:${DEBUG_PORT}/json`)).json()
  return list.find((t) => t.type === 'page')
}, 'navegador')

const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  ws.onopen = res
  ws.onerror = rej
})
let nextId = 1
const pending = new Map()
const consoleErrors = []
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) rej(new Error(msg.error.message))
    else res(msg.result)
  } else if (msg.method === 'Runtime.exceptionThrown') {
    const d = msg.params.exceptionDetails
    consoleErrors.push(
      `${(d.exception?.description ?? d.text).split(String.fromCharCode(10))[0]} (${d.url ?? 'sin url'})`,
    )
  }
}
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = nextId++
    pending.set(id, { res, rej })
    ws.send(JSON.stringify({ id, method, params }))
  })

const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text)
  return r.result.value
}
// Todas las páginas: registra si alguien llama a window.confirm / alert / prompt.
const INIT_SCRIPT = `
  window.__dialogosNativos = 0;
  for (const n of ['confirm','alert','prompt']) window[n] = () => { window.__dialogosNativos++; return true };
`

await send('Page.enable')
await send('Runtime.enable')
// La página siempre se considera enfocada (las capturas de pantalla, si no, le quitan el foco).
await send('Emulation.setFocusEmulationEnabled', { enabled: true })
await send('Page.addScriptToEvaluateOnNewDocument', { source: INIT_SCRIPT })

async function viewport(width, height = 800) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  })
}
const markOld = () => evaluate('window.__viejo = true').catch(() => {})
const isNew = `!window.__viejo && document.readyState === 'complete' && !!document.querySelector('main')`
async function goto(path) {
  await markOld()
  await send('Page.navigate', { url: `${BASE}${path}` })
  await sleep(150)
  await waitFor(() => evaluate(isNew), `cargar ${path}`)
  await sleep(250)
}
const reload = async () => {
  await markOld()
  await send('Page.reload')
  await sleep(150)
  await waitFor(() => evaluate(isNew), 'recargar')
  await sleep(250)
}
const text = () => evaluate(`document.body.innerText`)
const pathNow = () => evaluate(`location.pathname + location.search`)
const clickText = (selector, contains) =>
  evaluate(`(() => {
    const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find(e => e.offsetParent !== null && e.innerText.includes(${JSON.stringify(contains)}));
    if (!el) throw new Error('No se encontró ${contains}');
    el.click(); return true })()`)
async function typeInto(selector, value) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`)
  await send('Input.insertText', { text: value })
}
const resetBrowser = async () => {
  await viewport(1440)
  await goto('/')
  await evaluate(`localStorage.clear()`)
  await goto('/')
}
const signInAs = async (label) => {
  await goto('/ingresar')
  await clickText('button', label)
  await sleep(300)
}
const assert = async (name, fn) => {
  try {
    const detail = await fn()
    record(name, true, typeof detail === 'string' ? detail : '')
  } catch (e) {
    record(name, false, e.message)
  }
}
const expect = (cond, msg) => {
  if (!cond) throw new Error(msg)
}

// ---------- Escenarios de la spec ----------
await resetBrowser()

await assert('Publicar sin sesión: /pedir-ayuda, /red-lista/registrar y /vivienda/ofrecer piden ingresar', async () => {
  const seen = []
  for (const path of ['/pedir-ayuda', '/red-lista/registrar', '/vivienda/ofrecer']) {
    await goto(path)
    const t = await text()
    expect(
      t.toLowerCase().includes('primero ingresa') && t.includes('Ingresa para continuar'),
      `${path} no pide ingresar: ${t.slice(0, 200).split('\n').join(' | ')}`,
    )
    const href = await evaluate(
      `[...document.querySelectorAll('main a')].find(a => a.innerText.includes('Ingresar'))?.getAttribute('href')`,
    )
    expect(href === `/ingresar?volver=${encodeURIComponent(path)}`, `${path}: enlace inesperado ${href}`)
    seen.push(path)
  }
  return seen.join(', ')
})

await assert('Publicar sin sesión: tras ingresar vuelve a la ruta original', async () => {
  await goto('/pedir-ayuda')
  await clickText('main a', 'Ingresar')
  await sleep(300)
  expect((await pathNow()).startsWith('/ingresar?volver='), 'no llegó a /ingresar')
  await clickText('button', 'Familia damnificada')
  await sleep(400)
  expect((await pathNow()) === '/pedir-ayuda', `volvió a ${await pathNow()}`)
  expect(!(await text()).includes('Ingresa para continuar'), 'sigue pidiendo ingresar')
})

await resetBrowser()
await assert('Ingresar como comerciante: la barra muestra nombre y rol (escritorio 1440 px)', async () => {
  await goto('/ingresar')
  const card = await evaluate(
    `[...document.querySelectorAll('button')].find(b => b.innerText.includes('Comerciante afectado')).innerText`,
  )
  const line = card.split('\n').find((l) => l.includes('·'))
  const [name, role] = line.split('·').map((s) => s.trim())
  await clickText('button', 'Comerciante afectado')
  await sleep(400)
  const header = await evaluate(`document.querySelector('header').innerText`)
  expect(header.includes(name), `la barra no muestra "${name}": ${header.replace(/\n/g, ' | ')}`)
  expect(header.includes(role), `la barra no muestra el rol "${role}"`)
  return `${name} · ${role}`
})

await assert('Ingresar como comerciante: en celular (390 px) el botón de menú nombra la sesión', async () => {
  await viewport(390)
  await goto('/')
  const label = await evaluate(
    `document.querySelector('header button[aria-label^="Abrir menú"]').getAttribute('aria-label')`,
  )
  expect(label.startsWith('Abrir menú (sesión de '), `aria-label: ${label}`)
  await evaluate(`document.querySelector('header button[aria-label^="Abrir menú"]').click()`)
  await sleep(200)
  const panel = await evaluate(`document.querySelector('header [aria-label="Tu cuenta"]').innerText`)
  expect(panel.includes('Usuario') && panel.includes('Cerrar sesión'), 'el panel no muestra rol y "Cerrar sesión"')
  await viewport(1440)
})

await assert('Ingresar como comerciante: la sesión persiste al recargar', async () => {
  await goto('/')
  const before = await evaluate(`localStorage.getItem('${SESSION_KEY}')`)
  expect(!!before, 'no hay sesión guardada')
  await reload()
  const header = await evaluate(`document.querySelector('header').innerText`)
  expect(header.includes('Usuario'), 'la barra perdió la sesión al recargar')
})

await assert('Usuario sin rol coordinador: /coordinacion muestra "Acceso restringido"', async () => {
  await goto('/coordinacion')
  const t = await text()
  expect(t.includes('Acceso restringido'), 'no aparece "Acceso restringido"')
  expect(!t.includes('Restablecer datos de demostración'), 'un usuario ve el botón de restablecer')
})

await assert('Usuario sin rol coordinador: sin sesión también se le pide ingresar', async () => {
  await evaluate(`localStorage.removeItem('${SESSION_KEY}')`)
  await goto('/coordinacion')
  expect((await text()).includes('Ingresa para continuar'), 'no pide ingresar')
})

await assert('Crear perfil: sin marcar la autorización no se crea y se indica que es obligatoria', async () => {
  await goto('/ingresar')
  await typeInto('#perfil-nombre', 'Perfil de Prueba')
  await typeInto('#perfil-documento', '1094123456')
  await evaluate(`document.querySelector('form button[type=submit]').click()`)
  await sleep(300)
  const t = await text()
  expect(
    /debes autorizar/i.test(await evaluate(`document.getElementById('aviso-datos-error')?.innerText ?? ''`)),
    'sin mensaje de error junto a la casilla',
  )
  expect(!(await evaluate(`localStorage.getItem('${SESSION_KEY}')`)), 'se inició sesión sin autorización')
  expect((await pathNow()) === '/ingresar', 'salió de /ingresar')
  const focused = await evaluate(`document.activeElement?.id`)
  expect(focused === 'perfil-autorizacion', `el foco quedó en ${focused}`)
  expect(t.includes('Ley 1581'), 'no se informa la Ley 1581')
})

await assert('Crear perfil: con la autorización se crea, ingresa y queda guardado tras recargar', async () => {
  await evaluate(`document.getElementById('perfil-autorizacion').click()`)
  await evaluate(`document.querySelector('form button[type=submit]').click()`)
  await sleep(500)
  expect((await pathNow()) === '/', `no volvió al inicio: ${await pathNow()}`)
  await reload()
  const header = await evaluate(`document.querySelector('header').innerText`)
  expect(header.includes('Perfil de Prueba'), 'la barra no muestra el perfil creado tras recargar')
})

await assert('Crear perfil: los campos con error se anuncian (nombre y documento vacíos)', async () => {
  await evaluate(`localStorage.clear()`)
  await goto('/ingresar')
  await evaluate(`document.querySelector('form button[type=submit]').click()`)
  await sleep(300)
  const invalid = await evaluate(`[...document.querySelectorAll('form [aria-invalid=true]')].map(e => e.id)`)
  expect(invalid.includes('perfil-nombre') && invalid.includes('perfil-documento'), `aria-invalid en: ${invalid}`)
})

await assert('Restablecer: coordinador ve diálogo en pantalla (sin confirm()) y restablece', async () => {
  await signInAs('Coordinador')
  await goto('/coordinacion')
  expect(!(await text()).includes('Acceso restringido'), 'el coordinador ve acceso restringido')
  await clickText('main button', 'Restablecer datos de demostración')
  await sleep(300)
  const dlg = await evaluate(`document.querySelector('dialog[open]')?.innerText ?? ''`)
  expect(dlg.includes('¿Restablecer los datos de demostración?'), 'no se abrió el diálogo de confirmación')
  await clickText('dialog[open] button', 'Sí, restablecer')
  await sleep(300)
  const done = await evaluate(`document.querySelector('dialog[open]')?.innerText ?? ''`)
  expect(done.includes('Datos de demostración restablecidos'), 'no confirma el restablecimiento')
  expect((await evaluate(`window.__dialogosNativos`)) === 0, 'se usó confirm()/alert() nativo')
  await clickText('dialog[open] button', 'Entendido')
  await sleep(200)
  expect((await evaluate(`document.querySelector('dialog[open]')`)) === null, 'el diálogo no se cerró')
  const sesion = await evaluate(`localStorage.getItem('${SESSION_KEY}')`)
  expect(!!sesion, 'se perdió la sesión del coordinador')
})

await assert('Restablecer: "Cancelar" cierra el diálogo sin restablecer y Esc también cierra', async () => {
  await goto('/coordinacion')
  await clickText('main button', 'Restablecer datos de demostración')
  await sleep(250)
  await clickText('dialog[open] button', 'Cancelar')
  await sleep(250)
  expect((await evaluate(`document.querySelector('dialog[open]')`)) === null, 'Cancelar no cerró')
  await clickText('main button', 'Restablecer datos de demostración')
  await sleep(250)
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
  await sleep(300)
  expect((await evaluate(`document.querySelector('dialog[open]')`)) === null, 'Esc no cerró el diálogo')
  expect((await evaluate(`window.__dialogosNativos`)) === 0, 'se usó confirm() nativo')
})

await assert('Restablecer: borra lo creado (perfil nuevo desaparece) y conserva sesión de coordinador', async () => {
  await goto('/ingresar')
  // crear perfil (cambia la sesión) y volver a coordinador
  await typeInto('#perfil-nombre', 'Persona Temporal')
  await typeInto('#perfil-documento', '52123456')
  await evaluate(`document.getElementById('perfil-autorizacion').click()`)
  await evaluate(`document.querySelector('form button[type=submit]').click()`)
  await sleep(400)
  await signInAs('Coordinador')
  const antes = await evaluate(`localStorage.getItem('${DATA_KEY}')`)
  expect(String(antes).includes('Persona Temporal'), 'el perfil creado no quedó guardado')
  await goto('/coordinacion')
  await clickText('main button', 'Restablecer datos de demostración')
  await sleep(250)
  await clickText('dialog[open] button', 'Sí, restablecer')
  await sleep(300)
  const despues = await evaluate(`Object.keys(localStorage).map(k => localStorage.getItem(k)).join('')`)
  expect(!despues.includes('Persona Temporal'), 'el perfil creado sigue tras restablecer')
})

await assert('Recargar la página conserva lo registrado (perfil creado sobrevive a la recarga)', async () => {
  await evaluate(`localStorage.clear()`)
  await goto('/ingresar')
  await typeInto('#perfil-nombre', 'Persistente Uno')
  await typeInto('#perfil-documento', '900123456')
  await evaluate(`document.getElementById('perfil-tipo-NIT').click()`)
  await evaluate(`document.getElementById('perfil-autorizacion').click()`)
  await evaluate(`document.querySelector('form button[type=submit]').click()`)
  await sleep(400)
  await reload()
  await reload()
  const all = await evaluate(`Object.keys(localStorage).map(k => localStorage.getItem(k)).join('')`)
  expect(all.includes('Persistente Uno'), 'el perfil no quedó guardado tras recargar')
})

await assert('Primera vez: con almacenamiento vacío se cargan los datos de demostración en el mapa', async () => {
  await evaluate(`localStorage.clear()`)
  await goto('/mapa')
  const n = await waitFor(
    () => evaluate(`document.querySelectorAll('.leaflet-marker-icon, .leaflet-interactive').length`),
    'marcadores del mapa',
    40,
  ).catch(() => 0)
  expect(n > 0, 'el mapa no muestra marcadores')
  return `${n} elementos en el mapa`
})

await assert('Navegador sin almacenamiento: muestra "Los datos no se guardarán al cerrar el navegador"', async () => {
  const { identifier } = await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('bloqueado', 'SecurityError') } })`,
  })
  await goto('/')
  const t = await text()
  expect(t.includes('Los datos no se guardarán al cerrar el navegador'), 'no aparece el aviso')
  const role = await evaluate(`document.querySelector('[role=status]')?.innerText ?? ''`)
  expect(role.includes('Los datos no se guardarán'), 'el aviso no tiene role=status')
  // La plataforma sigue funcionando en memoria.
  await goto('/mapa')
  const markers = await waitFor(
    () => evaluate(`document.querySelectorAll('.leaflet-interactive, .leaflet-marker-icon').length`),
    'marcadores del mapa en memoria',
    40,
  ).catch(() => 0)
  expect(markers > 0, 'el mapa no funciona en memoria')
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier })
})

await assert('Con almacenamiento disponible el aviso de "no se guardarán" no aparece', async () => {
  await goto('/')
  expect(!(await text()).includes('Los datos no se guardarán'), 'aparece el aviso sin motivo')
})

// ---------- Escenarios de la spec `necesidades` (add-necesidades) ----------
const CAPTURAS = process.env.CAPTURAS // carpeta opcional para guardar capturas (fuera del repositorio)
const shot = async (name) => {
  if (!CAPTURAS) return
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
  writeFileSync(join(CAPTURAS, `${name}.png`), Buffer.from(data, 'base64'))
}
const hallazgos = []
const finding = (name, detail) => {
  hallazgos.push({ name, detail })
  console.log(`HALLAZGO  ${name} · ${detail}`)
}
const setValue = (selector, value) =>
  evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error('No existe ${selector}');
    const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype
      : el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(String(value))});
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
    return true })()`)
const clickId = (id) =>
  evaluate(
    `(() => { const el = document.getElementById(${JSON.stringify(id)}); if (!el) throw new Error('No existe #${id}'); el.click(); return true })()`,
  )
const mainText = () => evaluate(`document.querySelector('main').innerText`)
const store = async () => JSON.parse(await evaluate(`localStorage.getItem('${DATA_KEY}')`))
const redPins = () =>
  evaluate(
    `[...document.querySelectorAll('.cdf-pin')].filter(p => (p.getAttribute('style') || '').toLowerCase().includes('d64545')).length`,
  )

/** Llena el formulario "Pedir ayuda" con lo indicado (sin publicar). */
async function fillNeedForm({ requester, type, items, people, vulnerabilities = [], municipio, barrio }) {
  await clickId(`need-requester-${requester}`)
  await clickId(`need-type-${type}`)
  for (const [i, item] of items.entries()) {
    if (i > 0) await clickText('main button', 'Agregar otro ítem')
    await setValue(`#need-item-${i}-label`, item.label)
    await setValue(`#need-item-${i}-quantity`, item.quantity)
    await setValue(`#need-item-${i}-unit`, item.unit)
  }
  await setValue('#need-people', people)
  for (const v of vulnerabilities) await clickId(`need-vulnerability-${v}`)
  await setValue('#need-municipio', municipio)
  await setValue('#need-barrio', barrio)
}
/** Publica y devuelve el id de la necesidad creada (la pantalla navega a su detalle). */
async function publishNeed(spec) {
  await goto('/pedir-ayuda')
  await fillNeedForm(spec)
  await evaluate(`document.querySelector('form button[type=submit]').click()`)
  await waitFor(async () => (await pathNow()).startsWith('/necesidades/'), 'navegar al detalle tras publicar')
  await sleep(400)
  return (await pathNow()).split('/')[2]
}
const CARPAS = {
  requester: 'familia',
  type: 'carpas',
  items: [{ label: 'Carpas', quantity: 5, unit: 'carpas' }],
  people: 18,
  vulnerabilities: ['ninos'],
  municipio: 'Quimbaya',
  barrio: 'La Española',
}
let carpasId = ''

await resetBrowser()
await signInAs('Familia damnificada')

await assert(
  'Registrar › Perfil preseleccionado: ?perfil=comerciante y ?perfil=familia abren con ese perfil',
  async () => {
    const checked = () =>
      evaluate(
        `['comerciante','familia'].filter(p => document.getElementById('need-requester-' + p)?.checked).join(',')`,
      )
    await goto('/pedir-ayuda?perfil=comerciante')
    expect((await checked()) === 'comerciante', `con ?perfil=comerciante quedó: "${await checked()}"`)
    await goto('/pedir-ayuda?perfil=familia')
    expect((await checked()) === 'familia', `con ?perfil=familia quedó: "${await checked()}"`)
    await goto('/pedir-ayuda?perfil=otro')
    expect((await checked()) === '', 'un valor desconocido no debe preseleccionar nada')
    await goto('/pedir-ayuda')
    expect((await checked()) === '', 'sin parámetro no debe preseleccionar nada')
  },
)

await assert(
  'Registrar › Perfil preseleccionado: "Comerciante afectado" del inicio lleva al formulario con ese perfil',
  async () => {
    await goto('/')
    await evaluate(`document.querySelector('a[href="/pedir-ayuda?perfil=comerciante"]').click()`)
    await sleep(500)
    expect((await pathNow()) === '/pedir-ayuda?perfil=comerciante', `llegó a ${await pathNow()}`)
    expect(
      await evaluate(`document.getElementById('need-requester-comerciante').checked`),
      'el perfil comerciante no está marcado',
    )
  },
)

await assert(
  'Registrar › Datos incompletos: formulario vacío indica cada campo faltante junto al campo y no publica',
  async () => {
    await goto('/pedir-ayuda')
    const antes = (await store()).needs.length
    await evaluate(`document.querySelector('form button[type=submit]').click()`)
    await sleep(400)
    const r = await evaluate(`(() => {
    const err = (id) => document.getElementById(id)?.innerText.trim() ?? null;
    const adjacent = (fieldId, errId) => { const f = document.getElementById(fieldId); const e = document.getElementById(errId);
      return !!f && !!e && (f.parentElement.contains(e) || f.closest('fieldset')?.contains(e) || f.parentElement.parentElement.contains(e)) };
    return { requester: err('need-requester-error'), type: err('need-type-error'), items: err('need-items-error'),
      municipio: err('need-municipio-error'), barrio: err('need-barrio-error'),
      near: [adjacent('need-municipio', 'need-municipio-error'), adjacent('need-barrio', 'need-barrio-error'), adjacent('need-item-0-label', 'need-items-error')],
      describedby: document.getElementById('need-municipio').getAttribute('aria-describedby'),
      invalid: document.getElementById('need-municipio').getAttribute('aria-invalid'),
      focusId: document.activeElement?.id || document.activeElement?.tagName } })()`)
    expect(/perfil|comerciante o familia/i.test(r.requester ?? ''), `sin error de perfil: ${r.requester}`)
    expect(/tipo/i.test(r.type ?? ''), `sin error de tipo: ${r.type}`)
    expect(/cantidad|ítem/i.test(r.items ?? ''), `sin error de cantidad: ${r.items}`)
    expect(/municipio/i.test(r.municipio ?? ''), `sin error de municipio: ${r.municipio}`)
    expect(/barrio/i.test(r.barrio ?? ''), `sin error de barrio: ${r.barrio}`)
    expect(r.near.every(Boolean), `error no adyacente al campo: ${r.near}`)
    expect(
      r.invalid === 'true' && r.describedby === 'need-municipio-error',
      `aria del municipio: ${r.invalid} / ${r.describedby}`,
    )
    expect((await pathNow()) === '/pedir-ayuda', 'salió del formulario')
    expect((await store()).needs.length === antes, 'se publicó una necesidad con datos incompletos')
    await shot('pedir-ayuda-errores-1440')
    return `foco en ${r.focusId}`
  },
)

await assert(
  'Registrar › Datos incompletos: falta solo la cantidad (o solo el municipio) -> error del campo y no publica',
  async () => {
    await goto('/pedir-ayuda')
    const antes = (await store()).needs.length
    await fillNeedForm({ ...CARPAS, items: [{ label: 'Carpas', quantity: '', unit: 'carpas' }] })
    await evaluate(`document.querySelector('form button[type=submit]').click()`)
    await sleep(300)
    const t1 = await evaluate(`document.getElementById('need-items-error')?.innerText ?? ''`)
    expect(/cantidad/i.test(t1), `no pide la cantidad: "${t1}"`)
    expect(
      (await evaluate(`document.getElementById('need-item-0-quantity').getAttribute('aria-invalid')`)) === 'true',
      'la cantidad no está marcada aria-invalid',
    )
    await setValue('#need-item-0-quantity', 5)
    await setValue('#need-municipio', '')
    await evaluate(`document.querySelector('form button[type=submit]').click()`)
    await sleep(300)
    expect(!(await evaluate(`!!document.getElementById('need-items-error')`)), 'el error de cantidad no se limpió')
    expect(
      /municipio/i.test(await evaluate(`document.getElementById('need-municipio-error')?.innerText ?? ''`)),
      'no pide el municipio',
    )
    expect((await store()).needs.length === antes, 'se publicó con datos incompletos')
  },
)

/** Espera a que el mapa termine de pintar los marcadores (el conteo deja de cambiar) y lo devuelve. */
async function stableRedPins() {
  let prev = -1
  for (let i = 0; i < 20; i++) {
    const n = await redPins()
    if (n > 0 && n === prev) return n
    prev = n
    await sleep(300)
  }
  return prev
}
await goto('/mapa')
const pinsAntes = await stableRedPins()

await assert(
  'Registrar › Familia pide carpas: 5 carpas, 18 personas, niños, Quimbaya, La Española -> detalle "Sin ayuda"',
  async () => {
    carpasId = await publishNeed(CARPAS)
    const t = await mainText()
    expect(t.includes('Sin ayuda'), 'el detalle no dice "Sin ayuda"')
    expect(t.includes('Quimbaya') && t.includes('Barrio La Española'), 'no muestra municipio y barrio')
    expect(t.includes('ubicación aproximada'), 'no avisa que la ubicación es aproximada')
    expect(/Prioridad (alta|media|baja)/.test(t) && /\d+ \/ 12 puntos/.test(t), 'no muestra la prioridad calculada')
    expect(t.includes('Tu necesidad ya está publicada'), 'no confirma la publicación')
    await shot('detalle-recien-publicada-1440')
    return `${carpasId} · ${t.match(/\d+ \/ 12 puntos/)[0]}`
  },
)

await assert('Registrar › Familia pide carpas: aparece en el mapa en rojo ("Sin ayuda") con su prioridad', async () => {
  await goto('/mapa')
  const despues = await stableRedPins()
  const card =
    await evaluate(`(() => { const a = [...document.querySelectorAll('article')].find(x => x.querySelector('h3')?.innerText.trim() === 'Carpas');
    return a ? a.innerText : null })()`)
  expect(!!card, 'no hay tarjeta "Carpas" en la lista del mapa')
  expect(
    card.includes('Sin ayuda') && card.includes('Quimbaya · La Española') && /Prioridad/.test(card),
    `tarjeta: ${card.replace(/\n/g, ' | ')}`,
  )
  expect(despues === pinsAntes + 1, `marcadores rojos: antes ${pinsAntes}, después ${despues}`)
  await shot('mapa-con-necesidad-nueva-1440')
})

await assert(
  'Registrar › Familia pide carpas: la ubicación pública es el barrio (≤ 3 decimales, sin dirección ni teléfono)',
  async () => {
    const need = (await store()).needs.find((n) => n.id === carpasId)
    const decimals = (x) => (String(x).split('.')[1] ?? '').length
    expect(
      decimals(need.location.lat) <= 3 && decimals(need.location.lng) <= 3,
      `coordenadas: ${need.location.lat}, ${need.location.lng}`,
    )
    expect(
      !('address' in need) && !('phone' in need) && !('address' in need.location),
      'la necesidad guarda dirección o teléfono',
    )
    expect(
      need.location.barrio === 'La Española' && need.location.municipio === 'Quimbaya',
      JSON.stringify(need.location),
    )
    return `${need.location.lat}, ${need.location.lng}`
  },
)

await assert(
  'Detalle › Explicación de la prioridad: muestra tipo, personas, vulnerabilidad y días de espera',
  async () => {
    await goto(`/necesidades/${carpasId}`)
    const r = await evaluate(`(() => { const s = document.getElementById('por-que-prioridad')?.closest('section');
    return s ? { h2: s.querySelector('h2').innerText, items: [...s.querySelectorAll('li')].map(l => l.innerText.replace(/\\n/g, ' ')) } : null })()`)
    expect(!!r, 'no existe la sección de prioridad')
    expect(r.items.length === 4, `criterios visibles: ${r.items.length}`)
    const joined = r.items.join(' | ')
    expect(
      /Tipo de necesidad/.test(joined) &&
        /18 personas afectadas/.test(joined) &&
        /Vulnerabilidad/.test(joined) &&
        /días? de espera/.test(joined),
      joined,
    )
    expect(
      r.items.every((i) => /\d de 3/.test(i)),
      `algún criterio sin puntos: ${joined}`,
    )
    expect(/Niños/i.test(joined), 'la vulnerabilidad no menciona a los niños')
    return r.h2
  },
)

await assert(
  'Detalle › Explicación de la prioridad: una necesidad sembrada (n-484) también muestra los 4 criterios',
  async () => {
    await goto('/necesidades/n-484')
    const t = await mainText()
    expect(t.includes('Por qué es prioridad alta') || t.includes('Por qué esta prioridad'), 'sin explicación')
    expect(
      (await evaluate(`document.querySelectorAll('section[aria-labelledby=por-que-prioridad] li').length`)) === 4,
      'no muestra los 4 criterios',
    )
  },
)

// Compromisos: los hace la empresa que ayuda sobre la necesidad recién publicada.
await signInAs('Empresa que ayuda')

await assert('Comprometerse › Compromiso parcial: 2 de 5 carpas -> "2 de 5 carpas" y "Ayuda en camino"', async () => {
  await goto(`/necesidades/${carpasId}`)
  await clickId('commit-item-0')
  await setValue('#commit-quantity', 2)
  await clickText('main button', 'Me comprometo')
  await sleep(500)
  const t = await mainText()
  expect(t.includes('2 de 5 carpas'), 'el ítem no muestra "2 de 5 carpas"')
  expect(t.includes('Ayuda en camino'), 'el estado no pasó a "Ayuda en camino"')
  expect(t.includes('Se comprometió con 2 carpas de «Carpas»'), 'el historial no registra el compromiso')
  expect(t.includes('Quedaste comprometido con 2 carpas'), 'sin mensaje de gracias')
  await shot('detalle-compromiso-parcial-1440')
})

await assert(
  'Comprometerse › Cantidad mayor a lo que falta: faltan 3 y se piden 5 -> queda en 3 y avisa que el resto no hace falta',
  async () => {
    await goto(`/necesidades/${carpasId}`)
    await clickId('commit-item-0')
    await setValue('#commit-quantity', 5)
    await clickText('main button', 'Me comprometo')
    await sleep(500)
    const t = await mainText()
    expect(t.includes('Quedaste comprometido con 3 carpas'), 'no limitó a 3')
    expect(t.includes('El resto ya no hace falta'), 'no avisa que el resto no hace falta')
    expect(t.includes('5 de 5 carpas'), 'el ítem no quedó en 5 de 5')
  },
)

await assert('Comprometerse › Cantidad inválida (0): error junto al campo y no registra', async () => {
  await publishNeed({
    ...CARPAS,
    items: [{ label: 'Colchonetas', quantity: 4, unit: 'colchonetas' }],
    barrio: 'Centro',
  })
  const before = (await store()).commitments.length
  await setValue('#commit-quantity', 0)
  await clickText('main button', 'Me comprometo')
  await sleep(300)
  const err = await evaluate(`document.getElementById('commit-error')?.innerText ?? ''`)
  expect(/entera mayor que cero/i.test(err), `error: "${err}"`)
  expect(
    (await evaluate(`document.getElementById('commit-quantity').getAttribute('aria-invalid')`)) === 'true',
    'sin aria-invalid',
  )
  expect((await store()).commitments.length === before, 'registró un compromiso inválido')
})

await assert(
  'Redirigir › Oferta a necesidad cubierta: "ya está cubierta" y lista hasta 3 puntos sin ayuda cercanos',
  async () => {
    await goto(`/necesidades/${carpasId}`)
    expect((await mainText()).includes('Esta necesidad ya está cubierta'), 'no avisa que está cubierta')
    await clickText('main button', 'Me comprometo')
    await sleep(400)
    const r = await evaluate(`(() => { const s = document.getElementById('puntos-cercanos');
    return { links: [...s.querySelectorAll('a')].map(a => a.innerText.replace(/\\n/g, ' ')),
      focus: document.activeElement?.id, hrefs: [...s.querySelectorAll('a')].map(a => a.getAttribute('href')) } })()`)
    expect(r.links.length >= 1 && r.links.length <= 3, `puntos cercanos: ${r.links.length}`)
    expect(
      r.links.every((l) => l.includes('Sin ayuda') && /\d,\d km/.test(l)),
      r.links.join(' | '),
    )
    expect(!r.hrefs.includes(`/necesidades/${carpasId}`), 'se sugiere la misma necesidad cubierta')
    expect((await mainText()).includes('cubierta al 100 %'), 'sin mensaje de redirección')
    const focoFinal = await waitFor(
      () => evaluate(`document.activeElement?.id === 'puntos-cercanos'`),
      'foco en los puntos cercanos',
      20,
    ).catch(() => false)
    expect(focoFinal, `el foco quedó en "${r.focus}"`)
    await shot('detalle-cubierta-redireccion-1440')
    return r.links[0]
  },
)

await assert(
  'Detalle › Necesidad cerrada (sembrada n-500): avisa que está cubierta y redirige al intentar',
  async () => {
    await goto('/necesidades/n-500')
    const t = await mainText()
    expect(t.includes('Atendida') && t.includes('ya está cubierta'), 'no muestra Atendida / cubierta')
    await clickText('main button', 'Me comprometo')
    await sleep(300)
    expect((await mainText()).includes('cubierta al 100 %'), 'no redirige a puntos cercanos')
  },
)

await assert('Confirmar entrega › quien ayuda marca "entregado"; un tercero no ve "Confirmar entrega"', async () => {
  await goto(`/necesidades/${carpasId}`)
  expect((await mainText()).includes('Comprometido'), 'los compromisos no están en estado comprometido')
  expect(!(await mainText()).includes('Confirmar entrega'), 'quien ayuda ve "Confirmar entrega" sin ser el receptor')
  for (let i = 0; i < 2; i++) {
    await clickText('main button', 'Marqué como entregado')
    await sleep(400)
  }
  const t = await mainText()
  expect(
    (t.match(/Entregado, falta confirmar/g) ?? []).length === 2,
    'los 2 compromisos no quedaron "Entregado, falta confirmar"',
  )
  expect(!t.includes('Marqué como entregado'), 'siguen los botones de marcar')
  expect(!t.includes('Atendida'), 'pasó a Atendida sin confirmación del receptor')
})

await signInAs('Familia damnificada')

await assert(
  'Confirmar entrega › Entrega confirmada completa: el receptor confirma todo -> "Atendida"; parcial sigue en camino',
  async () => {
    await goto(`/necesidades/${carpasId}`)
    expect(!(await mainText()).includes('Marqué como entregado'), 'el receptor ve "Marqué como entregado"')
    await clickText('main button', 'Confirmar entrega')
    await sleep(400)
    let t = await mainText()
    expect(
      t.includes('Ayuda en camino') && !t.includes('Atendida'),
      'con una confirmación parcial debe seguir "Ayuda en camino"',
    )
    await clickText('main button', 'Confirmar entrega')
    await sleep(400)
    t = await mainText()
    expect(t.includes('Atendida'), 'no pasó a "Atendida"')
    expect(
      t.includes('5 entregadas') && (t.match(/Entrega confirmada/g) ?? []).length >= 2,
      'no registra 5 entregadas / 2 confirmadas',
    )
    const data = await store()
    expect(
      data.commitments.filter((c) => c.needId === carpasId).every((c) => c.status === 'confirmado'),
      'compromisos sin confirmar en el almacén',
    )
    await shot('detalle-atendida-1440')
  },
)

await assert('Confirmar entrega › Un coordinador puede confirmar por el receptor -> "Atendida"', async () => {
  await signInAs('Familia damnificada')
  const id = await publishNeed({
    ...CARPAS,
    type: 'alimento',
    items: [{ label: 'Mercados', quantity: 2, unit: 'mercados' }],
    barrio: 'Obrero',
  })
  await signInAs('Empresa que ayuda')
  await goto(`/necesidades/${id}`)
  await setValue('#commit-quantity', 2)
  await clickText('main button', 'Me comprometo')
  await sleep(400)
  expect(!(await mainText()).includes('Confirmar entrega'), 'un tercero (empresa) puede confirmar')
  await signInAs('Coordinador')
  await goto(`/necesidades/${id}`)
  await clickText('main button', 'Confirmar entrega')
  await sleep(400)
  expect((await mainText()).includes('Atendida'), 'el coordinador no logró dejarla Atendida')
})

await assert(
  'Reportar › Reporte: motivo vacío se rechaza en el diálogo; con motivo queda registrado en reports',
  async () => {
    await signInAs('Empresa que ayuda')
    await goto('/necesidades/n-483')
    await clickText('main button', 'Reportar esta publicación')
    await sleep(300)
    expect(await evaluate(`!!document.querySelector('dialog[open] #report-reason')`), 'no abrió el diálogo')
    await clickText('dialog[open] button', 'Enviar reporte')
    await sleep(300)
    const err = await evaluate(`document.getElementById('report-reason-error')?.innerText ?? ''`)
    expect(err.length > 0, 'sin error con motivo vacío')
    expect((await store()).reports.length === 0, 'registró un reporte sin motivo')
    await setValue('#report-reason', 'Parece una publicación repetida')
    await clickText('dialog[open] button', 'Enviar reporte')
    await sleep(400)
    expect((await mainText()).includes('Gracias por avisar'), 'sin confirmación')
    const reports = (await store()).reports
    expect(
      reports.length === 1 && reports[0].needId === 'n-483' && reports[0].reason.includes('repetida'),
      JSON.stringify(reports),
    )
    expect(reports[0].reporterId === 'u-10', `reporterId: ${reports[0].reporterId}`)
  },
)

await assert(
  'Reportar › Sin sesión: se ofrece ingresar para reportar y para comprometerse (conserva la ruta)',
  async () => {
    await evaluate(`localStorage.removeItem('${SESSION_KEY}')`)
    await goto('/necesidades/n-483')
    const href = await evaluate(
      `[...document.querySelectorAll('main a')].find(a => a.innerText.includes('Ingresa para reportar'))?.getAttribute('href')`,
    )
    expect(href === `/ingresar?volver=${encodeURIComponent('/necesidades/n-483')}`, `enlace: ${href}`)
    expect((await mainText()).includes('Ingresa para comprometerte'), 'sin invitación a ingresar para comprometerse')
  },
)

await assert('Límite: con 3 necesidades activas el formulario avisa y el botón queda deshabilitado', async () => {
  await evaluate(`localStorage.clear()`)
  await signInAs('Familia damnificada') // n-482 ya cuenta como 1 activa
  await goto('/pedir-ayuda')
  expect(
    (await evaluate(`document.querySelector('form button[type=submit]').disabled`)) === false,
    'con 1 activa el botón no debe estar deshabilitado',
  )
  await publishNeed({ ...CARPAS, barrio: 'Centro' })
  await publishNeed({
    ...CARPAS,
    type: 'agua',
    items: [{ label: 'Agua', quantity: 50, unit: 'litros' }],
    barrio: 'El Jardín',
  })
  await goto('/pedir-ayuda')
  const r =
    await evaluate(`({ alert: [...document.querySelectorAll('main [role=alert]')].map(a => a.innerText).join(' '),
    disabled: document.querySelector('form button[type=submit]').disabled })`)
  expect(r.alert.includes('Ya tienes 3 necesidades activas'), `aviso: "${r.alert}"`)
  expect(r.disabled === true, 'el botón sigue habilitado')
  const antes = (await store()).needs.length
  await evaluate(`document.querySelector('form').requestSubmit()`)
  await sleep(300)
  expect((await store()).needs.length === antes, 'se publicó una cuarta necesidad')
  await shot('pedir-ayuda-limite-1440')
})

await assert(
  'Privacidad: el detalle público no muestra ownerId, documento, teléfono ni dirección (sin y con sesión)',
  async () => {
    const forbidden = /u-familia|ownerId|1000000001|1000000004|300 000 00|address|Calle 40|docNumber|"phone"/
    for (const who of [null, 'Empresa que ayuda', 'Coordinador']) {
      await evaluate(`localStorage.removeItem('${SESSION_KEY}')`)
      if (who) await signInAs(who)
      for (const id of ['n-482', 'n-500']) {
        await goto(`/necesidades/${id}`)
        const html = await evaluate(`document.documentElement.outerHTML`)
        const m = forbidden.exec(html)
        expect(!m, `${id} (${who ?? 'sin sesión'}) expone "${m?.[0]}"`)
      }
    }
  },
)

await assert('Detalle: necesidad inexistente muestra un mensaje amable con un solo h1', async () => {
  await goto('/necesidades/n-no-existe')
  const t = await mainText()
  expect(t.includes('No encontramos esta necesidad'), 'sin mensaje')
  expect((await evaluate(`document.querySelectorAll('h1').length`)) === 1, 'h1 != 1')
})

await assert(
  'Ítems con el mismo nombre se rechazan: dos «Carpas» (y «carpas ») muestran el error junto a los ítems y no publican',
  async () => {
    await evaluate(`localStorage.clear()`)
    await signInAs('Familia damnificada')
    await goto('/pedir-ayuda')
    const antes = (await store()).needs.length
    await fillNeedForm({
      ...CARPAS,
      items: [
        { label: 'Carpas', quantity: 3, unit: 'carpas' },
        { label: 'Carpas', quantity: 4, unit: 'carpas' },
        { label: ' carpas ', quantity: 1, unit: 'carpas' },
      ],
      barrio: 'Centro',
    })
    await evaluate(`document.querySelector('form button[type=submit]').click()`)
    await waitFor(() => evaluate(`!!document.getElementById('need-items-error')`), 'error de ítems repetidos')
    await waitFor(
      () => evaluate(`document.getElementById('need-items')?.contains(document.activeElement) ?? false`),
      'foco en el grupo de ítems',
      30,
    ).catch(() => undefined) // si no llega, el expect de abajo lo reporta con el elemento activo
    const r = await evaluate(`(() => {
      const err = document.getElementById('need-items-error');
      const group = document.getElementById('need-items');
      const active = document.activeElement;
      return { text: err?.innerText ?? '', inGroup: !!err && !!group && group.contains(err),
        describedby: group?.getAttribute('aria-describedby'),
        active: active?.id || active?.tagName, focusInGroup: !!active && !!group && group.contains(active) } })()`)
    expect((await pathNow()) === '/pedir-ayuda', `navegó a ${await pathNow()}`)
    expect(/nombre distinto/i.test(r.text), `sin error de nombre repetido: "${r.text}"`)
    expect(r.inGroup, 'el error no está junto al grupo de ítems')
    expect(r.describedby === 'need-items-error', `aria-describedby del grupo: ${r.describedby}`)
    expect(r.focusInGroup, `el foco no quedó en el grupo de ítems (activo: ${r.active})`)
    expect((await store()).needs.length === antes, 'se publicó una necesidad con ítems repetidos')
    await shot('pedir-ayuda-items-repetidos-1440')
  },
)

// ---------- Recorrido guiado (plan de pruebas de usuario, tarea 5) ----------
await assert(
  'Tarea 5 del plan de usuario: donante encuentra la necesidad de mayor prioridad sin ayuda y se compromete (390 px)',
  async () => {
    await evaluate(`localStorage.clear()`)
    await viewport(390)
    let pasos = 0
    await signInAs('Empresa que ayuda')
    pasos++ // ingresar con un perfil de demostración
    await goto('/')
    await evaluate(`document.querySelector('header button[aria-label^="Abrir menú"]').click()`)
    await sleep(200)
    await clickText('header a', 'Mapa')
    pasos += 2 // abrir el menú e ir al mapa
    await sleep(700)
    await shot('tarea5-mapa-390')
    const hasToggle = await evaluate(
      `[...document.querySelectorAll('button')].some(b => b.innerText.trim() === 'Lista' && b.offsetParent !== null)`,
    )
    if (hasToggle) await clickText('button', 'Lista')
    await sleep(300)
    await evaluate(
      `[...document.querySelectorAll('label')].find(l => l.innerText.includes('Dónde hace más falta')).click()`,
    )
    pasos++ // activar "Dónde hace más falta"
    await sleep(500)
    const first =
      await evaluate(`(() => { const a = [...document.querySelectorAll('article')].find(x => x.offsetParent !== null);
    return a ? { title: a.querySelector('h3').innerText, text: a.innerText.replace(/\\n/g, ' | ') } : null })()`)
    expect(!!first, 'no hay tarjetas visibles en la lista')
    expect(
      first.text.includes('Sin ayuda') && first.text.includes('Prioridad alta'),
      `la primera no es sin ayuda / alta: ${first.text}`,
    )
    await shot('tarea5-lista-390')
    await clickText('article a', 'Me comprometo')
    pasos++
    await sleep(600)
    expect((await pathNow()).startsWith('/necesidades/'), `no llegó al detalle: ${await pathNow()}`)
    await shot('tarea5-detalle-390')
    await clickText('main button', 'Me comprometo')
    pasos++
    await sleep(500)
    expect((await mainText()).includes('Quedaste comprometido'), 'no confirmó el compromiso')
    await viewport(1440)
    return `${pasos} toques (con conmutador Lista: ${hasToggle}); primera tarjeta: ${first.title}`
  },
)

console.log(`\nHallazgos documentados (no cuentan como fallo): ${hallazgos.length}`)

// ---------- Responsive y accesibilidad ----------
await resetBrowser()
const VIEWPORTS = [360, 390, 768, 1024, 1440]
const AUDIT = `(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('.sr-only, [class*=leaflet-]:not(.leaflet-container)') };
  const small = [];
  for (const e of document.querySelectorAll('main a[href], main button, main select, main textarea, main input:not([type=checkbox]):not([type=radio]), dialog[open] button, header button')) {
    if (!vis(e) || e.classList.contains('sr-only') || e.closest('.leaflet-container')) continue;
    const r = e.getBoundingClientRect();
    if (r.height < 39.5) small.push((e.innerText || e.getAttribute('aria-label') || e.id || e.tagName).trim().slice(0, 30) + ' (' + Math.round(r.height) + 'px)');
  }
  for (const e of document.querySelectorAll('main input[type=checkbox], main input[type=radio]')) {
    const l = e.closest('label'); const r = (l ?? e).getBoundingClientRect();
    if (r.height < 39.5) small.push('control ' + e.id + ' (' + Math.round(r.height) + 'px)');
  }
  const noLabel = [];
  for (const e of document.querySelectorAll('input, select, textarea')) {
    if (!vis(e)) continue;
    const ok = (e.labels && e.labels.length) || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby');
    if (!ok) noLabel.push(e.id || e.name || e.tagName);
  }
  const noName = [];
  for (const e of document.querySelectorAll('button, a[href]')) {
    if (!vis(e)) continue;
    if (!(e.innerText.trim() || e.getAttribute('aria-label') || e.getAttribute('title'))) noName.push(e.outerHTML.slice(0, 60));
  }
  return { overflow: document.documentElement.scrollWidth - window.innerWidth, h1: document.querySelectorAll('h1').length,
    small, noLabel, noName, logoLines: (() => { const l = document.querySelector('header a'); return l ? Math.round(l.getBoundingClientRect().height) : 0 })() };
})()`

const ROUTES = [
  { path: '/', session: null, label: 'Inicio' },
  { path: '/ingresar', session: null, label: 'Ingresar' },
  { path: '/ingresar?volver=/pedir-ayuda', session: null, label: 'Ingresar con retorno' },
  { path: '/pedir-ayuda', session: null, label: 'Pedir ayuda sin sesión' },
  { path: '/coordinacion', session: 'Comerciante afectado', label: 'Acceso restringido' },
  { path: '/coordinacion', session: 'Coordinador', label: 'Coordinación con datos de demostración' },
  { path: '/ingresar', session: 'Comerciante afectado', label: 'Ingresar con sesión' },
  // add-necesidades
  { path: '/pedir-ayuda', session: 'Familia damnificada', label: 'Pedir ayuda con sesión' },
  {
    path: '/pedir-ayuda',
    session: 'Familia damnificada',
    label: 'Pedir ayuda con errores de validación',
    after: `document.querySelector('form button[type=submit]').click()`,
  },
  { path: '/necesidades/n-482', session: null, label: 'Detalle de necesidad sin sesión' },
  { path: '/necesidades/n-482', session: 'Empresa que ayuda', label: 'Detalle de necesidad con sesión (quien ayuda)' },
  { path: '/necesidades/n-482', session: 'Familia damnificada', label: 'Detalle de necesidad con sesión (dueña)' },
  { path: '/necesidades/n-500', session: 'Empresa que ayuda', label: 'Detalle de necesidad cubierta' },
]
const responsive = []
for (const route of ROUTES) {
  for (const w of VIEWPORTS) {
    await viewport(w)
    await evaluate(`localStorage.clear()`)
    if (route.session) await signInAs(route.session)
    await goto(route.path)
    if (route.after) {
      await evaluate(route.after)
      await sleep(400)
    }
    const a = await evaluate(AUDIT)
    if (route.path !== '/' && (w === 390 || w === 1440))
      await shot(`resp-${route.path.replace(/\W+/g, '_')}-${route.label.replace(/\W+/g, '_')}-${w}`)
    const problems = []
    if (a.overflow > 0) problems.push(`desplazamiento horizontal +${a.overflow}px`)
    if (a.h1 !== 1) problems.push(`h1=${a.h1}`)
    if (a.small.length) problems.push(`táctiles < 40 px: ${a.small.join('; ')}`)
    if (a.noLabel.length) problems.push(`sin label: ${a.noLabel.join(', ')}`)
    if (a.noName.length) problems.push(`sin nombre accesible: ${a.noName.join(', ')}`)
    responsive.push({ ...route, w, problems, logoH: a.logoLines })
    record(`Responsive ${route.label} @${w}px`, problems.length === 0, problems.join(' | '))
  }
}

// Diálogo abierto en celular y foco visible.
await assert('Responsive: diálogo de restablecer a 360 px cabe en pantalla y sus botones miden >= 40 px', async () => {
  await viewport(360)
  await evaluate(`localStorage.clear()`)
  await signInAs('Coordinador')
  await goto('/coordinacion')
  await clickText('main button', 'Restablecer datos de demostración')
  await sleep(300)
  const r = await evaluate(`(() => { const d = document.querySelector('dialog[open]').getBoundingClientRect();
    return { left: d.left, right: d.right, w: innerWidth, btns: [...document.querySelectorAll('dialog[open] button')].map(b => b.getBoundingClientRect().height),
      over: document.documentElement.scrollWidth - innerWidth } })()`)
  expect(r.left >= 0 && r.right <= r.w, 'el diálogo se sale de la pantalla')
  expect(
    r.btns.every((h) => h >= 39.5),
    `botones: ${r.btns}`,
  )
  expect(r.over <= 0, 'desplazamiento horizontal con el diálogo')
})

await assert('Accesibilidad: foco visible al navegar con teclado en /ingresar', async () => {
  await viewport(1440)
  await evaluate(`localStorage.clear()`)
  await goto('/ingresar')
  const bad = []
  for (let i = 0; i < 14; i++) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
    const f = await evaluate(`(() => { const e = document.activeElement; const s = getComputedStyle(e);
      return { id: e.id || e.innerText?.slice(0, 20) || e.tagName, outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0, shadow: s.boxShadow !== 'none' } })()`)
    if (!f.outline && !f.shadow) bad.push(f.id)
  }
  expect(bad.length === 0, `sin indicador de foco: ${bad.join(', ')}`)
})

await assert('Accesibilidad: foco visible al navegar con teclado en /pedir-ayuda y en el detalle', async () => {
  await viewport(1440)
  await evaluate(`localStorage.clear()`)
  await signInAs('Empresa que ayuda')
  const bad = []
  for (const path of ['/pedir-ayuda', '/necesidades/n-482']) {
    await goto(path)
    // Sin dar la vuelta completa: al volver al inicio el navegador enfoca sin :focus-visible.
    const focusables = await evaluate(
      `document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea').length`,
    )
    for (let i = 0; i < Math.min(30, focusables - 1); i++) {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
      // Se reintenta unos instantes: el indicador de foco puede tardar en pintarse tras el Tab.
      let f
      for (let k = 0; k < 8; k++) {
        await sleep(60)
        f = await evaluate(`(() => { const e = document.activeElement; const s = getComputedStyle(e);
        const box = e.closest('label') ? getComputedStyle(e.closest('label')) : null;
        return { id: e.id || e.innerText?.slice(0, 20) || e.tagName,
          outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0, shadow: s.boxShadow !== 'none',
          label: !!box && (box.outlineStyle !== 'none' || box.boxShadow !== 'none') } })()`)
        if (f.outline || f.shadow || f.label) break
      }
      if (i > 0 && f.id.trim() === 'Saltar al contenido') break // dio la vuelta completa a la página
      if (!f.outline && !f.shadow && !f.label) bad.push(`${path}: ${f.id.trim()}`)
    }
  }
  expect(bad.length === 0, `sin indicador de foco: ${bad.join(', ')}`)
})

await assert(
  'Accesibilidad: cada error del formulario y del compromiso está enlazado al campo (aria-describedby + aria-invalid)',
  async () => {
    await evaluate(`localStorage.clear()`)
    await signInAs('Familia damnificada')
    await goto('/pedir-ayuda')
    await evaluate(`document.querySelector('form button[type=submit]').click()`)
    await sleep(300)
    const r = await evaluate(`[...document.querySelectorAll('main [id$="-error"]')].map(e => {
    const f = document.querySelector('[aria-describedby~="' + e.id + '"]');
    return { id: e.id, linked: !!f, invalid: f?.getAttribute('aria-invalid') === 'true' || !!f?.closest('fieldset') } })`)
    expect(r.length >= 4, `errores visibles: ${r.length}`)
    expect(
      r.every((e) => e.linked && e.invalid),
      `sin enlace al campo: ${r.filter((e) => !e.linked || !e.invalid).map((e) => e.id)}`,
    )
    const focused = await evaluate(`document.activeElement?.id || document.activeElement?.tagName`)
    expect(focused !== 'BODY', 'el foco no pasó al primer campo con error')
    await signInAs('Empresa que ayuda')
    await goto('/necesidades/n-482')
    await setValue('#commit-quantity', 0)
    await clickText('main button', 'Me comprometo')
    await sleep(300)
    expect(
      (await evaluate(`document.getElementById('commit-quantity').getAttribute('aria-describedby')`)) ===
        'commit-error',
      'commit-quantity no apunta a commit-error',
    )
  },
)

await assert('Accesibilidad: casilla de autorización y radios enlazan su texto (label) y la descripción', async () => {
  await evaluate(`localStorage.clear()`)
  await goto('/ingresar')
  const r = await evaluate(`(() => { const c = document.getElementById('perfil-autorizacion');
    return { label: c.labels[0]?.innerText.includes('Autorizo'), desc: c.getAttribute('aria-describedby')?.includes('aviso-datos'),
      radios: ['CC','NIT'].every(t => document.getElementById('perfil-tipo-' + t).labels.length === 1) } })()`)
  expect(r.label && r.desc && r.radios, JSON.stringify(r))
})

await assert('Sin errores de JavaScript no capturados durante la sesión', async () => {
  expect(
    consoleErrors.length === 0,
    [...new Set(consoleErrors)].slice(0, 5).join(' | ') + ` (${consoleErrors.length} en total)`,
  )
})

// ---------- Observación: barra a 1024–1279 px ----------
const barra = []
for (const w of [1024, 1100, 1279, 1280]) {
  await viewport(w)
  await evaluate(`localStorage.clear()`)
  await goto('/')
  const sin = await evaluate(`Math.round(document.querySelector('header a').getBoundingClientRect().height)`)
  await signInAs('Comerciante afectado')
  await goto('/')
  const con = await evaluate(
    `(() => { const b = document.querySelector('header button[aria-label^="Tu cuenta"]'); return { h: Math.round(b.getBoundingClientRect().height), name: b.innerText.trim().length > 3 } })()`,
  )
  barra.push(
    `${w}px: logo ${sin}px de alto sin sesión; cuenta ${con.name ? 'con nombre' : 'solo iniciales'} (alto ${con.h}px)`,
  )
}
console.log('\nObservación de la barra superior:\n  ' + barra.join('\n  '))

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones pasan`)
cleanup()
process.exit(failed.length ? 1 : 0)
