import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getPharmacyStock } from '../services/apiClient'
import ProtectedRoute from '../components/ProtectedRoute'

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
    if (!user?.pharmacy_id) return

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
      <div className="page-container">
        <section className="card">
          <h2>Pharmacy Dashboard</h2>
          <p className="card-description">Manage your pharmacy operations</p>

          {error && <p className="error-text">{error}</p>}

          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Medicines</h3>
              <p className="stat-number">{loading ? '...' : stock.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Stock</h3>
              <p className="stat-number">
                {loading
                  ? '...'
                  : stock.reduce((sum, item) => sum + (item.quantity || 0), 0)}
              </p>
            </div>
          </div>

          <div className="dashboard-actions">
            <Link to="/pharmacy/profile" className="primary-button">
              Manage Profile
            </Link>
            <Link to="/pharmacy/stock" className="primary-button">
              Manage Stock
            </Link>
          </div>

          <div className="recent-stock">
            <h3>Recent Stock Items</h3>
            {loading ? (
              <p>Loading...</p>
            ) : stock.length === 0 ? (
              <p className="info-text">No stock items yet. Add medicines to get started.</p>
            ) : (
              <ul className="stock-preview-list">
                {stock.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    {item.medicine?.name} - Quantity: {item.quantity}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  )
}

export default PharmacyDashboardPage
