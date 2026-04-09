import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { userSignup, pharmacySignup } from '../services/apiClient'

/** Build a user-facing message from backend validation errors (email, username, etc.). */
function messageFromResponse(err) {
  const d = err?.response?.data
  if (!d || typeof d !== 'object') return err?.message || 'Signup failed. Please try again.'
  if (typeof d.detail === 'string') return d.detail
  const list = Object.values(d).flat().filter((x) => typeof x === 'string')
  return list[0] || err?.message || 'Signup failed. Please try again.'
}

function SignupPage() {
  const navigate = useNavigate()
  const { login: setAuth } = useAuth()

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const initialType = searchParams.get('type') === 'pharmacy' ? 'pharmacy' : 'consumer'

  const [accountType, setAccountType] = useState(initialType) // 'consumer' or 'pharmacy'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  
  // Pharmacy-specific fields
  const [pharmacyName, setPharmacyName] = useState('')
  const [area, setArea] = useState('')
  const [city, setCity] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [contact, setContact] = useState('')
  const [deliveryAvailable, setDeliveryAvailable] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Geocoding suggestions state
  const [locSuggestions, setLocSuggestions] = useState([])
  const [isSearchingLoc, setIsSearchingLoc] = useState(false)
  const [showLocSuggestions, setShowLocSuggestions] = useState(false)

  // Fetch coordinates based on Area input
  useEffect(() => {
    if (accountType !== 'pharmacy' || !area.trim() || area.length < 3) {
      setLocSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingLoc(true)
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(area)}&limit=5`)
        const data = await res.json()
        setLocSuggestions(data.features || [])
      } catch (err) {
        console.error('Loc API error:', err)
      } finally {
        setIsSearchingLoc(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [area, accountType])

  const handleLocSelect = (feat) => {
    const p = feat.properties
    const [lon, lat] = feat.geometry.coordinates

    setArea(p.name || '')
    setCity(p.city || p.district || p.state || '')
    setLatitude(String(lat))
    setLongitude(String(lon))
    setShowLocSuggestions(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Username, password, and confirmation are required.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const emailTrimmed = (email || '').trim()
    if (emailTrimmed && !/^[^@]+@[^@]+\.[^@]+$/.test(emailTrimmed)) {
      setError('Please enter a valid email address (e.g. you@example.com) or leave email blank.')
      return
    }

    if (accountType === 'pharmacy') {
      if (!pharmacyName.trim() || !area.trim() || !city.trim()) {
        setError('Pharmacy name, area, and city are required.')
        return
      }

      const lat = parseFloat(latitude)
      const lon = parseFloat(longitude)

      if (isNaN(lat) || isNaN(lon)) {
        setError('Please enter valid latitude and longitude values.')
        return
      }

      setLoading(true)
      try {
        const data = await pharmacySignup({
          username,
          password,
          confirmPassword,
          email: emailTrimmed,
          pharmacyName,
          area,
          city,
          latitude: lat,
          longitude: lon,
          contact,
          deliveryAvailable,
        })
        setAuth(data.token, data.user)
        navigate('/pharmacy/dashboard')
      } catch (err) {
        console.error(err)
        setError(messageFromResponse(err))
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      try {
        const data = await userSignup({ username, password, confirmPassword, email: emailTrimmed })
        setAuth(data.token, data.user)
        navigate('/')
      } catch (err) {
        console.error(err)
        setError(messageFromResponse(err))
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="page-container">
      <section className="card">
        <h2>Sign Up</h2>
        <p className="card-description">Create a new account</p>

        <div className="account-type-selector">
          <button
            type="button"
            className={accountType === 'consumer' ? 'type-button active' : 'type-button'}
            onClick={() => setAccountType('consumer')}
          >
            Consumer Account
          </button>
          <button
            type="button"
            className={accountType === 'pharmacy' ? 'type-button active' : 'type-button'}
            onClick={() => setAccountType('pharmacy')}
          >
            Pharmacy Account
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (optional)</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          {accountType === 'pharmacy' && (
            <>
              <div className="form-group">
                <label htmlFor="pharmacyName">Pharmacy Name *</label>
                <input
                  id="pharmacyName"
                  type="text"
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  placeholder="e.g. Panaji City Pharmacy"
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ position: 'relative' }}>
                  <label htmlFor="area">Area *</label>
                  <input
                    id="area"
                    type="text"
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value)
                      setShowLocSuggestions(true)
                    }}
                    placeholder="e.g. Panaji"
                    autoComplete="off"
                  />
                  {showLocSuggestions && (locSuggestions.length > 0 || isSearchingLoc) && (
                    <ul className="suggestions-list">
                      {isSearchingLoc && <li className="suggestion-item loading">Searching...</li>}
                      {locSuggestions.map((feat, idx) => {
                        const p = feat.properties
                        const label = [p.name, p.city, p.state].filter(Boolean).join(', ')
                        return (
                          <li
                            key={idx}
                            className="suggestion-item"
                            onMouseDown={() => handleLocSelect(feat)}
                          >
                            <span className="suggestion-icon">📍</span>
                            <span style={{ fontSize: '0.85rem' }}>{label}</span>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="city">City / State *</label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Panaji"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude *</label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 15.4909"
                  />
                  <small style={{ color: 'var(--primary-color)', fontSize: '0.7rem' }}>
                    Auto-filled on Area select
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="longitude">Longitude *</label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 73.8278"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contact">Contact Number (optional)</label>
                <input
                  id="contact"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={deliveryAvailable}
                    onChange={(e) => setDeliveryAvailable(e.target.checked)}
                  />
                  Delivery service available
                </label>
              </div>
            </>
          )}

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </section>
    </div>
  )
}

export default SignupPage
