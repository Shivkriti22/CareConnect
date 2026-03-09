import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

function Layout() {
  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="layout-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
