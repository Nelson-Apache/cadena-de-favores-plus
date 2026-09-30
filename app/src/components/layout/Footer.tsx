import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'

export function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto grid max-w-content gap-10 px-4 py-14 md:grid-cols-4 lg:px-6">
        <div className="md:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Propuesta académica de Design Thinking que extiende la plataforma Cadena de Favores de la Cámara de Comercio
            de Armenia y del Quindío: ayuda organizada antes, durante y después de un desastre.
          </p>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-white">Plataforma</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="hover:text-white" to="/mapa">
                Mapa de prioridades
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/red-lista/registrar">
                Red lista
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/vivienda/ofrecer">
                Vivienda solidaria
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/coordinacion">
                Coordinación
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-white">Confianza</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Verificación con cédula o NIT</li>
            <li>Datos protegidos · Ley 1581 de 2012</li>
            <li>Reportes de la comunidad</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        Universidad del Quindío · Ingeniería de Sistemas y Computación · 2026
      </div>
    </footer>
  )
}
