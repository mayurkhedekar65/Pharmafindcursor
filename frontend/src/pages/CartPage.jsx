import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { createReservationFromNames } from '../services/apiClient'

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const reservations = []
      const errors = []

      // Create reservations for all cart items
      for (const item of cartItems) {
        try {
          const reservation = await createReservationFromNames({
            pharmacyName: item.pharmacyName,
            medicineName: item.medicineName,
            quantity: item.quantity,
            mode: item.mode,
            userIdentifier: user?.username || 'guest',
          })
          reservations.push({
            reservation,
            pharmacy: item.pharmacy,
            mode: item.mode,
          })
        } catch (err) {
          errors.push({
            item,
            error: err?.message || 'Failed to create reservation',
          })
        }
      }

      if (errors.length > 0 && reservations.length === 0) {
        // All failed
        setError(
          `Failed to create reservations: ${errors.map((e) => e.error).join(', ')}`
        )
        setIsProcessing(false)
        return
      }

      // Clear cart and navigate to confirmation
      clearCart()
      navigate('/confirmation', {
        state: {
          reservations,
          errors: errors.length > 0 ? errors : undefined,
        },
      })
    } catch (err) {
      console.error(err)
      setError('An error occurred while processing your order. Please try again.')
      setIsProcessing(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="page-container">
        <section className="card">
          <h2>Your Cart</h2>
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <p className="pf-empty-title">
              Your cart is empty
            </p>
            <p className="pf-empty-subtitle">
              Add medicines to your cart from the search results
            </p>
            <Link to="/" className="primary-button">
              Start Shopping
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page-container">
      <section className="card">
        <h2>Your Cart</h2>
        <p className="card-description">
          Review your reserved medicines before confirming your order.
        </p>

        {error && <p className="error-text">{error}</p>}

        <ul className="cart-items-list">
          {cartItems.map((item, index) => (
            <li key={index} className="cart-item">
              <div className="cart-item-info">
                <div className="pf-row" style={{ marginBottom: '0.25rem' }}>
                  <span className="pf-thumb-sm" aria-hidden="true">💊</span>
                  <h3 className="cart-item-title" style={{ margin: 0 }}>
                    {item.medicineName}
                  </h3>
                </div>
                <p className="cart-item-details">
                  <strong>Pharmacy:</strong> {item.pharmacyName}
                </p>
                <p className="cart-item-details">
                  <strong>Location:</strong> {item.pharmacy?.area || 'N/A'},{' '}
                  {item.pharmacy?.city || 'N/A'}
                </p>
                <p className="cart-item-details">
                  <strong>Mode:</strong>{' '}
                  <span
                    className={`delivery-badge ${
                      item.mode === 'delivery' ? 'available' : 'unavailable'
                    }`}
                  >
                    {item.mode === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                  </span>
                </p>
                <p className="cart-item-details">
                  <strong>Quantity:</strong>{' '}
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(index, parseInt(e.target.value) || 1)
                    }
                    className="quantity-input"
                  />
                </p>
              </div>
              <div className="cart-item-actions">
                <button
                  className="small-button delete-button"
                  onClick={() => removeFromCart(index)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>Total Items:</span>
            <strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</strong>
          </div>
          <div className="cart-summary-row">
            <span>Total Reservations:</span>
            <strong>{cartItems.length}</strong>
          </div>
        </div>

        <div className="actions-row pf-mt-lg">
          <Link to="/" className="secondary-button">
            Continue Shopping
          </Link>
          <button
            className="primary-button"
            onClick={handleCheckout}
            disabled={isProcessing || cartItems.length === 0}
          >
            {isProcessing ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              'Confirm Reservations'
            )}
          </button>
        </div>
      </section>
    </div>
  )
}

export default CartPage
