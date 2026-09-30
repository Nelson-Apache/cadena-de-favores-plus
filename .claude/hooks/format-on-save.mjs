#!/usr/bin/env node
// Hook PostToolUse (Write|Edit|MultiEdit): formatea con Prettier los archivos editados en app/src
// para que todo el código mantenga el mismo estilo, sin importar qué agente lo escribió.
// Si las dependencias no están instaladas (npm install), no hace nada.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { ROOT } from '../scripts/lib/tablero.mjs'

let input = ''
process.stdin.on('data', (c) => (input += c))
process.stdin.on('end', () => {
  try {
    const { tool_input: ti = {} } = JSON.parse(input || '{}')
    const file = String(ti.file_path || '')
    const norm = file.replace(/\\/g, '/')
    if (!/\/app\/src\/.+\.(ts|tsx|css)$/.test(norm)) process.exit(0)
    const appDir = path.join(ROOT, 'app')
    const bin = path.join(appDir, 'node_modules', 'prettier', 'bin', 'prettier.cjs')
    if (!fs.existsSync(bin) || !fs.existsSync(file)) process.exit(0)
    execFileSync(process.execPath, [bin, '--write', '--log-level', 'silent', file], { cwd: appDir, stdio: 'ignore' })
  } catch {
    // Un error de formato no debe interrumpir el trabajo; `npm run format:check` lo detectará.
  }
  process.exit(0)
})
