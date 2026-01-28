import { Link, useNavigate } from 'react-router-dom'
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
        <div className="header-content">
          <Link to="/" className="header-title-link" aria-label="PharmaFind Home">
            <div className="pf-brand">
              <img src={logo} alt="" className="pf-logo" />
              <h1 className="app-title">PharmaFind</h1>
            </div>
          </Link>
          <p className="app-subtitle">Search • Compare • Reserve from local pharmacies in Goa</p>
        </div>

        <nav className="header-nav">
          <Link to="/" className="nav-link">
            Home
          </Link>

          <Link to="/cart" className="cart-icon-link">
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {isPharmacy ? (
            <>
              <Link to="/pharmacy/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/pharmacy/profile" className="nav-link">
                Profile
              </Link>
              <Link to="/pharmacy/stock" className="nav-link">
                Manage Stock
              </Link>
            </>
          ) : null}

          {isAuthenticated ? (
            <>
              <span className="nav-user">{user?.username}</span>
              <button onClick={handleLogout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <span className="nav-user">Guest</span>
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
