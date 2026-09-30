// Verificación de UI de `add-persistencia-local` en un navegador real (Edge/Chrome sin ventana, protocolo CDP).
// No agrega dependencias: usa Node >= 22 (WebSocket y fetch globales).
//
// Uso (desde app/):   npm run build && node e2e/verificar-ui.mjs
// Variables: BROWSER (ruta del ejecutable), PORT (servidor de vista previa, 4173 por defecto).
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

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
    msg.error ? rej(new Error(msg.error.message)) : res(msg.result)
  } else if (msg.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(msg.params.exceptionDetails.text)
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
  const before = await evaluate(`localStorage.getItem('cdf-plus:v1:sesion')`)
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
  await evaluate(`localStorage.removeItem('cdf-plus:v1:sesion')`)
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
  expect(!(await evaluate(`localStorage.getItem('cdf-plus:v1:sesion')`)), 'se inició sesión sin autorización')
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
  const sesion = await evaluate(`localStorage.getItem('cdf-plus:v1:sesion')`)
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
  const antes = await evaluate(`localStorage.getItem('cdf-plus:v1')`)
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
  await sleep(600)
  const n = await evaluate(`document.querySelectorAll('.leaflet-marker-icon, .leaflet-interactive').length`)
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
  await sleep(500)
  expect(
    (await evaluate(`document.querySelectorAll('.leaflet-interactive, .leaflet-marker-icon').length`)) > 0,
    'el mapa no funciona en memoria',
  )
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier })
})

await assert('Con almacenamiento disponible el aviso de "no se guardarán" no aparece', async () => {
  await goto('/')
  expect(!(await text()).includes('Los datos no se guardarán'), 'aparece el aviso sin motivo')
})

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
]
const responsive = []
for (const route of ROUTES) {
  for (const w of VIEWPORTS) {
    await viewport(w)
    await evaluate(`localStorage.clear()`)
    if (route.session) await signInAs(route.session)
    await goto(route.path)
    const a = await evaluate(AUDIT)
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

await assert('Accesibilidad: casilla de autorización y radios enlazan su texto (label) y la descripción', async () => {
  const r = await evaluate(`(() => { const c = document.getElementById('perfil-autorizacion');
    return { label: c.labels[0]?.innerText.includes('Autorizo'), desc: c.getAttribute('aria-describedby')?.includes('aviso-datos'),
      radios: ['CC','NIT'].every(t => document.getElementById('perfil-tipo-' + t).labels.length === 1) } })()`)
  expect(r.label && r.desc && r.radios, JSON.stringify(r))
})

await assert('Sin errores de JavaScript no capturados durante la sesión', async () => {
  expect(consoleErrors.length === 0, consoleErrors.join(' | '))
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
