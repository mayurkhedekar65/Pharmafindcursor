import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../pharmacy.css'

function PharmacyLayout({ children, title, subtitle }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const getCurrentDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        return new Date().toLocaleDateString('en-US', options)
    }

    const getInitials = (name) => {
        if (!name) return 'P'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const pharmacyName = user?.pharmacy_name || user?.username || 'Pharmacy'

    return (
        <div className="pharmacy-layout" style={{ background: '#f6fafe', minHeight: '100vh', display: 'flex' }}>
            {/* Premium Sidebar */}
            <aside className="pharmacy-sidebar" style={{ width: '280px', height: '100vh', background: '#fff', borderRight: '1px solid rgba(0,0,0,0.05)', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', zIndex: 100 }}>
                <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '42px', height: '42px', background: 'var(--pharmacy-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 20px rgba(73, 165, 242, 0.2)' }}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1e293b', lineHeight: '1.1' }}>PharmaFind</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--pharmacy-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pharmacy Management</div>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '0 1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 1rem', marginBottom: '1rem' }}>Menu</div>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>
                            <NavLink to="/pharmacy/dashboard" className={({ isActive }) => `pharmacy-nav-link-premium ${isActive ? 'active' : ''}`}>
                                <span className="material-symbols-outlined">dashboard</span>
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/pharmacy/orders" className={({ isActive }) => `pharmacy-nav-link-premium ${isActive ? 'active' : ''}`}>
                                <span className="material-symbols-outlined">shopping_cart</span>
                                <span>Orders</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/pharmacy/stock" className={({ isActive }) => `pharmacy-nav-link-premium ${isActive ? 'active' : ''}`}>
                                <span className="material-symbols-outlined">inventory_2</span>
                                <span>Inventory</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/pharmacy/profile" className={({ isActive }) => `pharmacy-nav-link-premium ${isActive ? 'active' : ''}`}>
                                <span className="material-symbols-outlined">settings_account_box</span>
                                <span>Settings</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ background: 'var(--pharmacy-primary-light)', padding: '0.85rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(73, 165, 242, 0.1)' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'var(--pharmacy-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem', fontWeight: '900', boxShadow: '0 4px 10px rgba(73, 165, 242, 0.2)' }}>
                            {getInitials(pharmacyName)}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pharmacyName}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b' }}>Admin Hub</div>
                        </div>
                        <button onClick={handleLogout} style={{ width: '32px', height: '32px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }} className="hover:bg-red-50 hover:text-red-500">
                            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ marginLeft: '280px', flex: 1, position: 'relative' }}>
                <header style={{ height: '80px', background: 'rgba(246, 250, 254, 0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 90, padding: '0 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>{title || 'Dashboard'}</h1>
                        {subtitle && <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', margin: '2px 0 0 0' }}>{subtitle}</p>}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <NavLink to="/pharmacy/stock" style={{ background: 'var(--pharmacy-primary)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 20px rgba(73, 165, 242, 0.2)', textDecoration: 'none' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>add</span>
                            Add Medicine
                        </NavLink>
                    </div>
                </header>

                <main style={{ padding: '2.5rem 3rem' }}>
                    {children}
                </main>
            </div>
        </div>
    )
}

export default PharmacyLayout
