import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, requirePharmacy = false }) {
  const { isAuthenticated, isPharmacy, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-container">
        <section className="card">
          <p>Loading...</p>
        </section>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requirePharmacy && !isPharmacy) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
