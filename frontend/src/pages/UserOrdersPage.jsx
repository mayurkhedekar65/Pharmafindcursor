import { useEffect, useState } from 'react'
import { getUserOrders } from '../services/apiClient'
import ProtectedRoute from '../components/ProtectedRoute'

function UserOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getUserOrders()
      setOrders(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load your orders. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="page-container">
          <section className="card">
            <h2>My Orders</h2>
            <div className="pf-center pf-mt-xl">
              <span className="loading-spinner large"></span>
              <p>Fetching your orders...</p>
            </div>
          </section>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="page-container">
        <section className="card">
          <h2>My Orders</h2>
          <p className="card-description">Track and manage your medicine reservations</p>

          {error && <p className="error-text">{error}</p>}

          {orders.length === 0 ? (
            <div className="pf-center pf-mt-xl">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <p className="pf-empty-title">No orders found</p>
              <p className="pf-empty-subtitle">You haven't made any reservations yet.</p>
            </div>
          ) : (
            <div className="orders-list pf-mt-lg">
              {orders.map((order) => (
                <div key={order.id} className="order-card pf-mb-md">
                  <div className="order-header">
                    <span className="order-id">Order ID: #{order.id}</span>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="order-body pf-row pf-between">
                    <div className="order-info">
                      <h4 className="medicine-name">{order.medicine_name}</h4>
                      <p className="pharmacy-name">Pharmacy: {order.pharmacy_name}</p>
                      <p className="order-date">Date: {new Date(order.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="order-details text-right">
                      <p>Qty: <strong>{order.quantity}</strong></p>
                      <p className="order-amount">Total: <strong>₹{order.total_amount}</strong></p>
                      <p className="order-mode">Mode: <strong>{order.mode === 'delivery' ? 'Home Delivery' : 'Pickup'}</strong></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      
      <style>{`
        .order-card {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          overflow: hidden;
          transition: transform 0.2s;
        }
        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .order-header {
          background: var(--secondary-light);
          padding: 0.75rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
        }
        .order-id {
          font-weight: 700;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        .order-body {
          padding: 1.25rem;
        }
        .medicine-name {
          margin: 0 0 0.5rem;
          font-size: 1.15rem;
          color: var(--secondary-color);
        }
        .pharmacy-name, .order-date {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .status-badge.pending { background: #fef9c3; color: #854d0e; }
        .status-badge.completed { background: #dcfce7; color: #166534; }
        .status-badge.cancelled { background: #fee2e2; color: #991b1b; }
        
        .order-amount {
          color: var(--primary-color);
          font-size: 1.1rem;
          margin-top: 0.25rem;
        }
        .order-mode {
           font-size: 0.85rem;
           color: var(--text-secondary);
        }
      `}</style>
    </ProtectedRoute>
  )
}

export default UserOrdersPage
