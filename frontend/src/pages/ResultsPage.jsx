import { useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../contexts/CartContext'

function ResultsPage() {
  const location = useLocation()
  const state = location.state
  const { addToCart } = useCart()

  const [error, setError] = useState('')
  const [loadingReservationId, setLoadingReservationId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  if (!state) {
    return (
      <div className="page-container">
        <section className="card">
          <h2>No search data</h2>
          <p>Please start a new search from the home page.</p>
          <Link to="/" className="link-button">
            Go to Home
          </Link>
        </section>
      </div>
    )
  }

  const { searchParams, resolvedLocation, detail, results } = state
  const hasResults = Array.isArray(results) && results.length > 0

  const bestMatch = hasResults ? results[0] : null
  const otherMatches = hasResults ? results.slice(1) : []

  const [filters, setFilters] = useState({
    maxDistance: 15,
    deliveryOnly: false,
    maxDeliveryMins: 60,
  })

  const estimateDeliveryMins = (item) => {
    const base = Math.max(10, Math.round((Number(item.distance_km) || 0) * 4))
    return item.delivery_available ? base : base + 20
  }

  const passesFilters = (item) => {
    const d = Number(item.distance_km) || 0
    if (d > filters.maxDistance) return false
    if (filters.deliveryOnly && !item.delivery_available) return false
    if (estimateDeliveryMins(item) > filters.maxDeliveryMins) return false
    return true
  }

  const filteredBest = bestMatch && passesFilters(bestMatch) ? bestMatch : null
  const filteredOthers = otherMatches.filter(passesFilters)

  const handleAddToCart = (pharmacy, mode) => {
    setError('')
    setSuccessMessage('')
    setLoadingReservationId(`${pharmacy.pharmacy_name}-${mode}`)

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      try {
        addToCart({
          pharmacyName: pharmacy.pharmacy_name,
          medicineName: pharmacy.medicine_name,
          pharmacy: {
            area: pharmacy.area,
            city: pharmacy.city,
            delivery_available: pharmacy.delivery_available,
          },
          quantity: 1,
          mode,
        })

        setSuccessMessage(
          `${pharmacy.medicine_name} added to cart for ${mode === 'delivery' ? 'delivery' : 'pickup'}`
        )
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (err) {
        console.error(err)
        setError('Could not add item to cart. Please try again.')
      } finally {
        setLoadingReservationId(null)
      }
    }, 300)
  }

  return (
    <div className="page-container">
      <div className="pf-results-layout">
        <aside className="pf-sidebar card">
          <h2>Filters</h2>
          <p className="card-description">
            Refine results for <strong>{searchParams?.medicineName}</strong> near{' '}
            <strong>{resolvedLocation}</strong>.
          </p>

          <div className="pf-filter">
            <label className="pf-filter-label">
              Max distance: <strong>{filters.maxDistance} km</strong>
            </label>
            <input
              className="pf-range"
              type="range"
              min="1"
              max="30"
              value={filters.maxDistance}
              onChange={(e) =>
                setFilters((p) => ({ ...p, maxDistance: Number(e.target.value) }))
              }
            />
          </div>

          <div className="pf-filter">
            <label className="pf-filter-label">
              Delivery time: <strong>≤ {filters.maxDeliveryMins} mins</strong>
            </label>
            <input
              className="pf-range"
              type="range"
              min="15"
              max="120"
              step="5"
              value={filters.maxDeliveryMins}
              onChange={(e) =>
                setFilters((p) => ({ ...p, maxDeliveryMins: Number(e.target.value) }))
              }
            />
          </div>

          <label className="pf-check">
            <input
              type="checkbox"
              checked={filters.deliveryOnly}
              onChange={(e) =>
                setFilters((p) => ({ ...p, deliveryOnly: e.target.checked }))
              }
            />
            Delivery available only
          </label>

          <div className="pf-sidebar-actions">
            <Link to="/" className="secondary-button">
              New Search
            </Link>
            <Link to="/cart" className="primary-button">
              Open Cart
            </Link>
          </div>
        </aside>

        <section className="pf-results-main">
          <div className="pf-results-head">
            <h2>Results</h2>
            <p className="card-description">
              Showing pharmacies near <strong>{resolvedLocation}</strong> for{' '}
              <strong>{searchParams?.medicineName}</strong>.
            </p>
          </div>

        {detail && !hasResults && (
          <p className="info-text">
            {detail}
          </p>
        )}

        {error && <p className="error-text">{error}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}

        {hasResults ? (
          <>
            <div className="card pf-best-match">
              <h3 className="pf-section-title">Best Match</h3>
              {!filteredBest ? (
                <p className="info-text">No results match your filters. Try relaxing them.</p>
              ) : (
                <ul className="results-list" style={{ margin: 0 }}>
                  {[filteredBest].map((pharmacy) => {
                    const key = `${pharmacy.pharmacy_name}-${pharmacy.medicine_name}-best`
                    const isLoadingPickup = loadingReservationId === `${pharmacy.pharmacy_name}-pickup`
                    const isLoadingDelivery = loadingReservationId === `${pharmacy.pharmacy_name}-delivery`
                    return (
                      <li key={key} className="result-item">
                        <div className="result-main">
                          <h3 className="pharmacy-name">{pharmacy.pharmacy_name}</h3>
                          <p className="pharmacy-location">📍 {pharmacy.area}, {pharmacy.city}</p>
                          <p className="pharmacy-distance">
                            <span className="pf-chip">📏 {pharmacy.distance_km} km</span>
                            {pharmacy.delivery_available ? (
                              <span className="pf-chip">⏱️ ~{estimateDeliveryMins(pharmacy)} mins</span>
                            ) : (
                              <span className="pf-chip">Pickup</span>
                            )}
                          </p>
                          <p className="pharmacy-medicine">
                            <span className="pf-row">
                              <span className="pf-thumb-sm" aria-hidden="true">💊</span>
                              <span>
                                <strong>{pharmacy.medicine_name}</strong>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  {' '}· In stock: <strong>{pharmacy.quantity}</strong>
                                </span>
                              </span>
                            </span>
                          </p>
                          <p className="pharmacy-delivery">
                            🚚 Delivery:{' '}
                            <span className={`delivery-badge ${pharmacy.delivery_available ? 'available' : 'unavailable'}`}>
                              {pharmacy.delivery_available ? 'Available' : 'Not Available'}
                            </span>
                          </p>
                        </div>
                        <div className="result-actions">
                          <button
                            className="secondary-button"
                            onClick={() => handleAddToCart(pharmacy, 'pickup')}
                            disabled={isLoadingPickup}
                          >
                            {isLoadingPickup ? (
                              <>
                                <span className="loading-spinner"></span>
                                Adding...
                              </>
                            ) : (
                              'Reserve for Pickup'
                            )}
                          </button>
                          <button
                            className="primary-button"
                            onClick={() => handleAddToCart(pharmacy, 'delivery')}
                            disabled={!pharmacy.delivery_available || isLoadingDelivery}
                          >
                            {isLoadingDelivery ? (
                              <>
                                <span className="loading-spinner"></span>
                                Adding...
                              </>
                            ) : pharmacy.delivery_available ? (
                              'Home Delivery'
                            ) : (
                              'Delivery Not Available'
                            )}
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="pf-other-wrap">
              <h3 className="pf-section-title">Other Pharmacies Nearby</h3>
              <ul className="results-list">
                {filteredOthers.map((pharmacy) => {
              const key = `${pharmacy.pharmacy_name}-${pharmacy.medicine_name}`
              const isLoadingPickup = loadingReservationId === `${key}-pickup`
              const isLoadingDelivery = loadingReservationId === `${key}-delivery`

                  return (
                <li key={key} className="result-item">
                  <div className="result-main">
                    <h3 className="pharmacy-name">{pharmacy.pharmacy_name}</h3>
                    <p className="pharmacy-location">
                      📍 {pharmacy.area}, {pharmacy.city}
                    </p>
                    <p className="pharmacy-distance">
                      <span className="pf-chip">📏 {pharmacy.distance_km} km</span>
                      {pharmacy.delivery_available ? (
                        <span className="pf-chip">⏱️ ~{estimateDeliveryMins(pharmacy)} mins</span>
                      ) : null}
                    </p>
                    <p className="pharmacy-medicine">
                      <span className="pf-row">
                        <span className="pf-thumb-sm" aria-hidden="true">💊</span>
                        <span>
                          <strong>{pharmacy.medicine_name}</strong>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {' '}· In stock: <strong>{pharmacy.quantity}</strong>
                          </span>
                        </span>
                      </span>
                    </p>
                    <p className="pharmacy-delivery">
                      🚚 Delivery:{' '}
                      <span
                        className={`delivery-badge ${
                          pharmacy.delivery_available ? 'available' : 'unavailable'
                        }`}
                      >
                        {pharmacy.delivery_available ? 'Available' : 'Not Available'}
                      </span>
                    </p>
                  </div>

                  <div className="result-actions">
                    <button
                      className="secondary-button"
                      onClick={() => handleAddToCart(pharmacy, 'pickup')}
                      disabled={isLoadingPickup}
                    >
                      {isLoadingPickup ? (
                        <>
                          <span className="loading-spinner"></span>
                          Adding...
                        </>
                      ) : (
                        'Reserve for Pickup'
                      )}
                    </button>

                    <button
                      className="primary-button"
                      onClick={() => handleAddToCart(pharmacy, 'delivery')}
                      disabled={!pharmacy.delivery_available || isLoadingDelivery}
                    >
                      {isLoadingDelivery ? (
                        <>
                          <span className="loading-spinner"></span>
                          Adding...
                        </>
                      ) : pharmacy.delivery_available ? (
                        'Home Delivery'
                      ) : (
                        'Delivery Not Available'
                      )}
                    </button>
                  </div>
                </li>
                  )
                })}
              </ul>
            </div>
          </>
        ) : !detail ? (
          <div className="info-text">
            <p>No pharmacies were found for this search.</p>
            <p style={{ marginTop: '0.5rem' }}>
              Try searching for a different medicine or location.
            </p>
          </div>
        ) : null}

        </section>
      </div>
    </div>
  )
}

export default ResultsPage

