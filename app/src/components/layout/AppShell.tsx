import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { StorageNotice } from './StorageNotice'

/** Estructura común. El mapa ocupa la pantalla completa, por eso no lleva footer. */
export function AppShell() {
  const { pathname } = useLocation()
  const fullBleed = pathname.startsWith('/mapa')
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <StorageNotice />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      {!fullBleed && <Footer />}
    </div>
  )
}
