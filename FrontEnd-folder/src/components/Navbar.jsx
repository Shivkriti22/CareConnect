import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { isAuthenticated, logout, user } = useAuth()

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/blogs', label: 'Health Stories' },
    { to: '/symptom-analysis', label: 'Symptom Analysis' },
    { to: '/blogs/create', label: 'Share Your Story' },
    ...(isAuthenticated ? [{ to: '/profile', label: 'Profile' }] : []),
  ]

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeMobileMenu()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo" onClick={closeMobileMenu}>
          <span className="navbar__logo-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
          CareConnect
        </Link>

        <nav className={`navbar__nav ${mobileMenuOpen ? 'navbar__nav--open' : ''}`}>
          <ul className="navbar__links">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`} onClick={closeMobileMenu} end={to === '/' || to === '/blogs'}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="navbar__actions">
            <button
              type="button"
              className="navbar__theme-toggle"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            {isAuthenticated ? (
              <div className="navbar__user-section">
                <span className="navbar__user-name">{user?.name}</span>
                <button
                  type="button"
                  className="navbar__btn navbar__btn--logout"
                  onClick={() => {
                    logout()
                    closeMobileMenu()
                  }}
                  title="Sign out from your account"
                >
                  <span className="navbar__btn-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 8 20 12 16 16" />
                      <line x1="9" y1="12" x2="20" y2="12" />
                    </svg>
                  </span>
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="navbar__btn navbar__btn--primary" onClick={closeMobileMenu}>
                  <span className="navbar__btn-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  Sign In
                </Link>
                <Link to="/signup" className="navbar__btn navbar__btn--secondary" onClick={closeMobileMenu}>
                  <span className="navbar__btn-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                      <line x1="12" y1="12" x2="12" y2="18" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </span>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>

        <button
          type="button"
          className="navbar__toggle"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>
      </div>
    </header>
  )
}

export default Navbar
