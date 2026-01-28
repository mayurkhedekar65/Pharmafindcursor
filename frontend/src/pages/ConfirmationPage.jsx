import { Link, useLocation } from 'react-router-dom'

function ConfirmationPage() {
  const location = useLocation()
  const state = location.state

  if (!state || (!state.reservation && !state.reservations)) {
    return (
      <div className="page-container">
        <section className="card">
          <h2>No reservation found</h2>
          <p>It looks like there is no recent reservation to show.</p>
          <Link to="/" className="link-button">
            Go to Home
          </Link>
        </section>
      </div>
    )
  }

  // Handle both single reservation (backward compatibility) and multiple reservations (from cart)
  const reservations = state.reservations || [
    {
      reservation: state.reservation,
      pharmacy: state.pharmacy,
      mode: state.mode,
    },
  ]

  const totalItems = reservations.reduce(
    (sum, r) => sum + (r.reservation?.quantity || 1),
    0
  )

  return (
    <div className="page-container">
      <section className="card">
        <h2>✅ Reservations Confirmed!</h2>
        <p className="card-description">
          Your {reservations.length === 1 ? 'reservation has' : 'reservations have'} been
          created successfully..
        </p>

        {state.errors && state.errors.length > 0 && (
          <div className="error-text pf-mb-lg">
            <strong>Some items could not be reserved:</strong>
            <ul className="pf-list">
              {state.errors.map((err, idx) => (
                <li key={idx}>
                  {err.item.medicineName} from {err.item.pharmacyName}: {err.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="confirmation-details">
          <p className="pf-block-title">
            Summary:
          </p>
          <p>
            <strong>Total Reservations:</strong> {reservations.length}
          </p>
          <p>
            <strong>Total Items:</strong> {totalItems}
          </p>
        </div>

        <div className="pf-mt-lg">
          <h3 className="pf-h3">
            Reservation Details:
          </h3>
          <ul className="reservations-list">
            {reservations.map((item, index) => (
              <li key={index} className="reservation-item">
                <p>
                  <strong>Medicine:</strong> {item.pharmacy?.medicine_name || 'N/A'}
                </p>
                <p>
                  <strong>Pharmacy:</strong> {item.pharmacy?.pharmacy_name || 'N/A'}
                </p>
                <p>
                  <strong>Location:</strong> {item.pharmacy?.area || 'N/A'},{' '}
                  {item.pharmacy?.city || 'N/A'}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.reservation?.quantity || 1}
                </p>
                <p>
                  <strong>Mode:</strong>{' '}
                  <span
                    className={`delivery-badge ${
                      item.mode === 'delivery' ? 'available' : 'unavailable'
                    }`}
                  >
                    {item.mode === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                  </span>
                </p>
                {item.reservation?.timestamp && (
                  <p>
                    <strong>Reserved at:</strong>{' '}
                    {new Date(item.reservation.timestamp).toLocaleString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="actions-row pf-mt-lg">
          <Link to="/" className="secondary-button">
            New Search
          </Link>
          <Link to="/cart" className="primary-button">
            View Cart
          </Link>
        </div>
      </section>
    </div>
  )
}

export default ConfirmationPage


