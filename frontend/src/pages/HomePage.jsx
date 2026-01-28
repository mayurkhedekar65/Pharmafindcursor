import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMedicines, fetchPharmacies, searchMedicine } from '../services/apiClient.js'

function HomePage() {
  const navigate = useNavigate()
  const searchCardRef = useRef(null)

  const [pharmacies, setPharmacies] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loadingPharmacies, setLoadingPharmacies] = useState(false)
  const [loadingMedicines, setLoadingMedicines] = useState(false)
  const [locationInput, setLocationInput] = useState('')
  const [medicineInput, setMedicineInput] = useState('')
  const [error, setError] = useState('')
  const [loadingSearch, setLoadingSearch] = useState(false)

  const [showSuggestions, setShowSuggestions] = useState(false)

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

  const filteredSuggestions = useMemo(() => {
    if (!locationInput.trim()) return []
    const query = locationInput.toLowerCase()
    return locationOptions
      .filter((opt) => opt.toLowerCase().includes(query))
      .slice(0, 8)
  }, [locationInput, locationOptions])

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
    // Unsplash pattern requested: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&q=80&w=300
    // We use a small stable pool of medical/product photo IDs and pick deterministically per name.
    const ids = [
      '1580281657527-47f249e8f6b9',
      '1582719478185-9b4f31a53426',
      '1584516150909-866b0a7ed25d',
      '1612538498451-2b67aabf6c5a',
      '1603398938378-e54eab446dde',
      '1583947215259-38e31be8751f',
      '1595434091145-3c0f00f4d0f9',
      '1597764699514-0f00066a7f2d',
      '1584367367094-3f8b3b0fd10a',
      '1582719478185-9b4f31a53426',
    ]
    const s = String(name || '')
    let hash = 0
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
    const id = ids[hash % ids.length]
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=300`
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

          <form className="form" onSubmit={handleSearch}>
            <div className="form-group">
              <label htmlFor="location">Delivery location</label>
              <input
                id="location"
                type="text"
                value={locationInput}
                onChange={handleLocationChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder={loadingPharmacies ? 'Loading locations…' : 'e.g. Panaji, Mapusa, Margao'}
                autoComplete="off"
              />

              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="suggestions-list">
                  {filteredSuggestions.map((opt) => (
                    <li
                      key={opt}
                      onMouseDown={() => handleLocationSelect(opt)}
                      className="suggestion-item"
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="medicine">Search medicines & products</label>
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
                  <div className="pf-product-name">{m.name}</div>
                </button>
              ))}
            </div>
          )}
        </section>

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
                  <div className="pf-product-name">{p.name}</div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default HomePage

