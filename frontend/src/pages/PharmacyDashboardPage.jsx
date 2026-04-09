import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getPharmacyStock } from '../services/apiClient'
import ProtectedRoute from '../components/ProtectedRoute'
import PharmacyLayout from '../layout/PharmacyLayout'

function PharmacyDashboardPage() {
  const { user } = useAuth()
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.pharmacy_id) {
      loadStock()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.pharmacy_id])

  const loadStock = async () => {
    if (!user?.pharmacy_id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getPharmacyStock(user.pharmacy_id)
      setStock(data || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load stock information.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requirePharmacy>
      <PharmacyLayout 
        title="Pharmacy Dashboard" 
        subtitle={`Welcome back, ${user?.pharmacy_name || user?.username}. Here's what's happening today.`}
      >
          {error && <p className="error-text">{error}</p>}

          <div className="dashboard-grid pf-mb-2">
            <div className="stat-card" style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Products</p>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b' }}>{loading ? '...' : stock.length}</h3>
            </div>
            <div className="stat-card" style={{ background: 'var(--pharmacy-primary)', color: '#fff', padding: '2rem', borderRadius: '24px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>Total Quantity</p>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '900' }}>
                {loading
                  ? '...'
                  : stock.reduce((sum, item) => sum + (item.quantity || 0), 0)}
              </h3>
            </div>
          </div>

          <div className="pf-row pf-gap-md pf-mb-lg">
            <Link to="/pharmacy/profile" className="primary-button pf-flex-1">
              Manage Profile
            </Link>
            <Link to="/pharmacy/stock" className="primary-button pf-flex-1" style={{ background: '#1e293b' }}>
              Manage Inventory
            </Link>
          </div>

          <div className="recent-stock card pf-p-2">
            <h3 className="pf-h3">Quick Updates</h3>
            {loading ? (
              <p>Loading inventory...</p>
            ) : stock.length === 0 ? (
              <p className="pf-text-secondary">No products yet. Add medicines to get started.</p>
            ) : (
              <div className="pf-table-container">
                <table className="pf-table">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Quantity</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td className="pf-weight-800">{item.medicine?.name}</td>
                        <td>
                          <span className={item.quantity < 10 ? 'pf-text-danger pf-weight-900' : ''}>
                             {item.quantity} units
                          </span>
                        </td>
                        <td>{item.medicine?.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </PharmacyLayout>
    </ProtectedRoute>
  )
}

export default PharmacyDashboardPage
