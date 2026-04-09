import { Link, useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import logo from '../assets/pf-logo.svg'

function Header() {
  const { user, isAuthenticated, isPharmacy, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="app-header">
      <div className="content-wrapper header-inner">
        <div className="header-brand">
          <Link to={isPharmacy ? "/pharmacy/dashboard" : "/"} className="header-title-link" aria-label="PharmaFind Home">
            <div className="pf-brand">
              <img src={logo} alt="" className="pf-logo" />
              <h1 className="app-title">PharmaFind</h1>
            </div>
          </Link>
        </div>

        <nav className="header-nav">
          {isAuthenticated && !isPharmacy && (
            <>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
              <NavLink to="/cart" className={({ isActive }) => `nav-link cart-icon-link ${isActive ? 'active' : ''}`}>
                My Cart
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </NavLink>
              <NavLink to="/my-orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                My Orders
              </NavLink>
            </>
          )}

          {isPharmacy && (
            <>
              <NavLink to="/pharmacy/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/pharmacy/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Orders
              </NavLink>
            </>
          )}

          {isAuthenticated ? (
            <div className="nav-profile-group">
               <div className="pf-user-identity">
                  <span className="material-symbols-outlined pf-user-icon">person</span>
                  <span className="nav-user">{user?.username}</span>
               </div>
               <button onClick={handleLogout} className="pf-nav-button-secondary">Logout</button>
            </div>
          ) : (
            <div className="pf-flex pf-align-center pf-gap-md">
              <Link to="/signup?type=pharmacy" className="nav-link pf-partner-link">
                Join as Pharmacy
              </Link>
              <Link to="/login" className="pf-nav-button">
                Login
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
