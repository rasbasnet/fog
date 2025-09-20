import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { MouseEvent } from 'react'
import type { To } from 'react-router-dom'
import './App.css'

const navLinks: { label: string; to: To }[] = [
  { label: 'Home', to: '/' },
  { label: 'Timeline', to: { pathname: '/', hash: '#timeline' } },
]

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const isHome = location.pathname === '/'

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, to: To) => {
    if (typeof to === 'string') {
      if (isHome && to === '/') {
        event.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    if ('hash' in to && to.pathname === '/') {
      const targetId = to.hash?.replace('#', '')

      if (isHome) {
        event.preventDefault()
        if (targetId) {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      } else {
        event.preventDefault()
        navigate(to)
      }
    }
  }

  return (
    <div className="app-shell">
      <div className="app-shell__auras" aria-hidden>
        <span className="app-shell__aura" />
        <span className="app-shell__aura app-shell__aura--right" />
      </div>

      <header className="app-header">
        <Link to="/" className="app-header__logo">
          <span className="app-header__title">Museum of Failure</span>
          <span className="app-header__subtitle">Gallery of Trying</span>
        </Link>
        <nav className="app-nav">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="app-nav__link"
              onClick={(event) => handleNavClick(event, item.to)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="app-main" data-home={isHome}>
        <Outlet />
      </main>
    </div>
  )
}
