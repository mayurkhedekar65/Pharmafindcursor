import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { fetchMedicines, fetchPharmacies, searchMedicine } from '../services/apiClient.js'
import { useAuth } from '../contexts/AuthContext'

function HomePage() {
  const { isPharmacy } = useAuth()
  const navigate = useNavigate()
  const searchCardRef = useRef(null)

  if (isPharmacy) {
    return <Navigate to="/pharmacy/dashboard" replace />
  }

  const [pharmacies, setPharmacies] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loadingPharmacies, setLoadingPharmacies] = useState(false)
  const [loadingMedicines, setLoadingMedicines] = useState(false)
  const [locationInput, setLocationInput] = useState('')
  const [medicineInput, setMedicineInput] = useState('')
  const [error, setError] = useState('')
  const [loadingSearch, setLoadingSearch] = useState(false)

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [osmSuggestions, setOsmSuggestions] = useState([])
  const [isSearchingOsm, setIsSearchingOsm] = useState(false)

  useEffect(() => {
    async function load() {
      setLoadingPharmacies(true)
      try {
        const data = await fetchPharmacies()
        setPharmacies(data || [])
      } catch (err) {
        console.error(err)
        // Do not block the app; user can still type any location
      } finally {
        setLoadingPharmacies(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    async function loadMedicines() {
      setLoadingMedicines(true)
      try {
        const data = await fetchMedicines()
        setMedicines(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setMedicines([])
      } finally {
        setLoadingMedicines(false)
      }
    }

    loadMedicines()
  }, [])

  const locationOptions = useMemo(() => {
    const areas = new Set()
    const cities = new Set()

    pharmacies.forEach((p) => {
      if (p.area) areas.add(p.area)
      if (p.city) cities.add(p.city)
    })

    const combined = Array.from(new Set([...areas, ...cities]))
    combined.sort()
    return combined
  }, [pharmacies])

  // Ultra-Fast Photon Suggestion Fetching
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (locationInput.trim().length < 1) { // Immediate response
        setOsmSuggestions([])
        return
      }

      setIsSearchingOsm(true)
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(locationInput)}&limit=6`
        )
        const data = await res.json()
        
        const formatted = (data.features || []).map((feat) => {
          const p = feat.properties
          const parts = []
          if (p.name) parts.push(p.name)
          if (p.city || p.town || p.district) parts.push(p.city || p.town || p.district)
          if (p.state) parts.push(p.state)
          
          return parts.length > 0 ? parts.join(', ') : p.name
        })
        
        setOsmSuggestions(Array.from(new Set(formatted)))
      } catch (err) {
        console.error('Location Fetch Error:', err)
      } finally {
        setIsSearchingOsm(false)
      }
    }, 200) // 200ms for "instant" appearance feel

    return () => clearTimeout(timer)
  }, [locationInput])

  const handleLocationChange = (e) => {
    setLocationInput(e.target.value)
    setShowSuggestions(true)
    setError('')
  }

  const handleLocationSelect = (value) => {
    setLocationInput(value)
    setShowSuggestions(false)
  }

  const handleMedicineChange = (e) => {
    setMedicineInput(e.target.value)
    setError('')
  }

  const handleQuickPickMedicine = (name) => {
    setMedicineInput(name)
    setError('')
    // bring focus back to search card
    if (searchCardRef.current) {
      searchCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const popularMedicineCards = useMemo(() => {
    // pick top 12 non-product items; products are tagged with "Product:" in description in our fixture
    const nonProducts = medicines.filter((m) => !String(m.description || '').includes('Product:'))
    return nonProducts.slice(0, 12)
  }, [medicines])

  const healthcareProductCards = useMemo(() => {
    // use products from backend if present; otherwise fall back to a static set
    const products = medicines.filter((m) => String(m.description || '').includes('Product:'))
    if (products.length > 0) return products.slice(0, 12)
    return [
      { name: 'Digital Thermometer' },
      { name: 'BP Monitor' },
      { name: 'Pulse Oximeter' },
      { name: 'Face Masks (Pack)' },
      { name: 'Hand Sanitizer' },
      { name: 'Glucometer' },
      { name: 'Glucose Strips' },
      { name: 'Vitamin C Tablets' },
      { name: 'Zinc Supplement' },
      { name: 'Pain Relief Spray' },
      { name: 'Antiseptic Liquid' },
      { name: 'First Aid Bandage' },
    ]
  }, [medicines])

  const getUnsplashImage = (name) => {
    // Map product names deterministically to the local hi-res stock imagery we downloaded
    const validIds = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12]
    const s = String(name || '')
    let hash = 0
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
    const id = validIds[hash % validIds.length]
    return `/medicines/${id}.jpg`
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedLocation = locationInput.trim()
    const trimmedMedicine = medicineInput.trim()

    if (!trimmedLocation || !trimmedMedicine) {
      setError('Please enter both location and medicine name.')
      return
    }

    setLoadingSearch(true)
    try {
      const data = await searchMedicine({
        userLocation: trimmedLocation,
        medicineName: trimmedMedicine,
      })

      // The backend may return either "results" or only a "detail" message.
      const results = Array.isArray(data.results) ? data.results : []

      navigate('/results', {
        state: {
          searchParams: {
            userLocation: trimmedLocation,
            medicineName: trimmedMedicine,
          },
          resolvedLocation: data.resolved_location || trimmedLocation,
          detail: data.detail || '',
          results,
        },
      })
    } catch (err) {
      console.error(err)
      setError('Something went wrong while searching. Please try again.')
    } finally {
      setLoadingSearch(false)
    }
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <section className="pf-hero full-bleed">
          <div className="content-wrapper">
            <div className="pf-hero-content">
              <h1 className="pf-hero-title">Order Medicines from Nearby Pharmacies</h1>
              <p className="pf-hero-subtitle">
                Search, reserve, or get medicines delivered near you in Goa.
              </p>
              <div className="pf-hero-badges">
                <span className="pf-chip">Trusted local pharmacies</span>
                <span className="pf-chip">Pickup or Delivery</span>
                <span className="pf-chip">Fast search</span>
              </div>
            </div>
          </div>
        </section>

        <section className="card pf-search-card pf-center-card" ref={searchCardRef}>
          <div className="pf-search-header">
            <h2>Search medicines</h2>
            <p className="card-description">
              Enter your area/city in Goa and the medicine name to find nearby pharmacies.
            </p>
          </div>

          <form className="pf-search-form" onSubmit={handleSearch}>
            <div className="form-group">
              <label htmlFor="location" className="pf-sr-only">Delivery location</label>
              <input
                id="location"
                type="text"
                value={locationInput}
                onChange={handleLocationChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder={loadingPharmacies ? 'Loading locations…' : 'e.g. Panaji, Mapusa, Margao'}
                autoComplete="off"
              />

              {showSuggestions && (osmSuggestions.length > 0 || isSearchingOsm) && (
                <ul className="suggestions-list">
                  {isSearchingOsm && <li className="suggestion-item loading">Searching locations...</li>}
                  {osmSuggestions.map((opt) => (
                    <li
                      key={opt}
                      onMouseDown={() => handleLocationSelect(opt)}
                      className="suggestion-item"
                    >
                      <span className="suggestion-icon">📍</span>
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="medicine" className="pf-sr-only">Search medicines & products</label>
              <input
                id="medicine"
                type="text"
                value={medicineInput}
                onChange={handleMedicineChange}
                placeholder="e.g. Paracetamol, Thermometer, Cetirizine"
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="primary-button" disabled={loadingSearch}>
              {loadingSearch ? (
                <>
                  <span className="loading-spinner"></span>
                  Searching...
                </>
              ) : (
                'Search Medicines'
              )}
            </button>
          </form>
        </section>

        <div className="pf-divider" />
        <section className="pf-section">
          <div className="pf-section-head">
            <h3 className="pf-section-title">Popular medicines</h3>
            <p className="pf-section-subtitle">Tap to auto-fill your search.</p>
          </div>

          {loadingMedicines ? (
            <div className="pf-grid">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="pf-skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="pf-grid">
              {popularMedicineCards.map((m) => (
                <button
                  key={m.id || m.name}
                  type="button"
                  className="pf-product-card"
                  onClick={() => handleQuickPickMedicine(m.name)}
                >
                  <img
                    className="pf-card-img"
                    src={getUnsplashImage(m.name)}
                    alt={m.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="pf-product-meta">Medicine</div>
                  <div className="pf-product-name">{m.name}</div>
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="pf-divider" />
        <section className="pf-section">
          <div className="pf-section-head">
            <h3 className="pf-section-title">Healthcare products</h3>
            <p className="pf-section-subtitle">Essentials for home care.</p>
          </div>

          {loadingMedicines ? (
            <div className="pf-grid">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="pf-skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="pf-grid">
              {healthcareProductCards.map((p) => (
                <button
                  key={p.id || p.name}
                  type="button"
                  className="pf-product-card"
                  onClick={() => handleQuickPickMedicine(p.name)}
                >
                  <img
                    className="pf-card-img"
                    src={getUnsplashImage(p.name)}
                    alt={p.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="pf-product-meta">Healthcare</div>
                  <div className="pf-product-name">{p.name}</div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="pf-section pf-how-it-works">
          <div className="pf-section-head pf-center">
            <h3 className="pf-section-title">Getting started is simple</h3>
            <p className="pf-section-subtitle">Your wellness journey, streamlined.</p>
          </div>
          <div className="pf-feature-grid">
            <div className="pf-feature-card">
              <div className="pf-feature-icon">🔍</div>
              <h4>Search</h4>
              <p>Find medicines across 500+ local pharmacies in Goa.</p>
            </div>
            <div className="pf-feature-card">
              <div className="pf-feature-icon">🛡️</div>
              <h4>Reserve</h4>
              <p>Secure your medication instantly with zero upfront cost.</p>
            </div>
            <div className="pf-feature-card">
              <div className="pf-feature-icon">🚚</div>
              <h4>Receive</h4>
              <p>Choose between fast home delivery or convenient pickup.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage

