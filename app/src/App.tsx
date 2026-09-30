import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DemoDataCard } from '@/features/account/DemoDataCard'
import { RequireSession } from '@/features/account/RequireSession'
import { SignInPage } from '@/features/account/SignInPage'
import { LandingPage } from '@/features/landing/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PendingPage } from '@/pages/PendingPage'

/**
 * Rutas de la plataforma. Cada ruta pendiente apunta al change de OpenSpec que la implementa.
 * Ver openspec/specs/plataforma-web/spec.md › "Navegación principal".
 */
// El mapa (Leaflet) se carga aparte para que el inicio sea liviano en conexiones móviles débiles.
const MapPage = lazy(() => import('@/features/map/MapPage').then((m) => ({ default: m.MapPage })))

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/ingresar', element: <SignInPage /> },
      {
        path: '/mapa',
        element: (
          <Suspense fallback={<p className="p-8 text-center text-ink-soft">Cargando mapa…</p>}>
            <MapPage />
          </Suspense>
        ),
      },
      {
        path: '/necesidades/:id',
        element: (
          <PendingPage
            icon="assignment"
            title="Detalle de una necesidad"
            change="add-necesidades"
            reference="detalle-necesidad"
            summary="Prioridad con sus cuatro criterios, avance por ítem, compromisos y puntos cercanos sin ayuda."
          />
        ),
      },
      {
        path: '/pedir-ayuda',
        element: (
          <RequireSession action="pedir ayuda">
            <PendingPage
              icon="sos"
              title="Pedir ayuda"
              change="add-necesidades"
              reference="pedir-ayuda"
              summary="Formulario para que un comerciante o una familia registre lo que necesita."
            />
          </RequireSession>
        ),
      },
      {
        path: '/red-lista/registrar',
        element: (
          <RequireSession action="registrar un recurso en la Red lista">
            <PendingPage
              icon="shield"
              title="Registrar un recurso en la Red lista"
              change="add-red-lista"
              reference="registrar-recurso"
              summary="Formulario por pasos para registrar bodegas, transporte, equipos u horas profesionales antes de la emergencia."
            />
          </RequireSession>
        ),
      },
      {
        path: '/vivienda/ofrecer',
        element: (
          <RequireSession action="ofrecer una vivienda solidaria">
            <PendingPage
              icon="home"
              title="Ofrecer una vivienda solidaria"
              change="add-vivienda-solidaria"
              reference="ofrecer-vivienda"
              summary="Tipo de oferta, precio frente a la referencia de la zona, capacidad, tiempo e inspección de habitabilidad."
            />
          </RequireSession>
        ),
      },
      {
        path: '/vivienda/:id',
        element: (
          <PendingPage
            icon="cottage"
            title="Ficha de vivienda solidaria"
            change="add-vivienda-solidaria"
            reference="ficha-vivienda"
            summary="Fotos, sello de arriendo solidario, condiciones y solicitud con consentimiento mutuo."
          />
        ),
      },
      {
        path: '/coordinacion',
        element: (
          <RequireSession action="abrir el panel de coordinación" role="coordinador">
            <PendingPage
              icon="monitoring"
              title="Panel de coordinación"
              change="add-panel-coordinacion"
              reference="panel-coordinacion"
              summary="Resumen por municipio de necesidades sin ayuda, en camino y atendidas."
            />
            <DemoDataCard />
          </RequireSession>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
