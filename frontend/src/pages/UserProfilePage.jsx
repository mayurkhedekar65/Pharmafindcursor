import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function UserProfilePage() {
  const { user, isAuthenticated } = useAuth()
  // In a real app, you'd fetch user reservations from backend
  // For now, we'll show a placeholder
  const [reservations] = useState([])

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <section className="card">
          <h2>Please login</h2>
          <p>You need to be logged in to view your profile.</p>
          <Link to="/login" className="link-button">
            Go to Login
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="page-container">
      <section className="card">
        <h2>My Profile</h2>

        <div className="profile-section">
          <h3>Account Information</h3>
          <div className="profile-details">
            <p>
              <strong>Username:</strong> {user?.username}
            </p>
            <p>
              <strong>Role:</strong> {user?.role === 'consumer' ? 'Consumer' : 'Pharmacy'}
            </p>
            {user?.email && (
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>My Reservations</h3>
          {reservations.length === 0 ? (
            <p className="info-text">You haven't made any reservations yet.</p>
          ) : (
            <ul className="reservations-list">
              {reservations.map((reservation) => (
                <li key={reservation.id} className="reservation-item">
                  {/* Reservation details would go here */}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="actions-row">
          <Link to="/" className="link-button">
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  )
}

export default UserProfilePage
