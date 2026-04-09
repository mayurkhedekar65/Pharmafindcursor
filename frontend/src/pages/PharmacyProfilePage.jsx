import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getPharmacyProfile, updatePharmacyProfile } from '../services/apiClient'
import ProtectedRoute from '../components/ProtectedRoute'
import PharmacyLayout from '../layout/PharmacyLayout'

function PharmacyProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    area: '',
    city: '',
    latitude: '',
    longitude: '',
    contact: '',
    delivery_available: false,
  })

  useEffect(() => {
    if (user?.pharmacy_id) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.pharmacy_id])

  const loadProfile = async () => {
    if (!user?.pharmacy_id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getPharmacyProfile(user.pharmacy_id)
      setFormData({
        name: data.name || '',
        area: data.area || '',
        city: data.city || '',
        latitude: String(data.latitude || ''),
        longitude: String(data.longitude || ''),
        contact: data.contact || '',
        delivery_available: data.delivery_available || false,
      })
    } catch (err) {
      console.error(err)
      setError('Failed to load pharmacy profile. Please relogin.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const lat = parseFloat(formData.latitude)
      const lon = parseFloat(formData.longitude)

      if (isNaN(lat) || isNaN(lon)) {
        setError('Please enter valid latitude and longitude values.')
        setSaving(false)
        return
      }

      await updatePharmacyProfile(user.pharmacy_id, {
        name: formData.name,
        area: formData.area,
        city: formData.city,
        latitude: lat,
        longitude: lon,
        contact: formData.contact,
        delivery_available: formData.delivery_available,
      })

      setSuccess('Profile updated successfully!')
      loadProfile()
    } catch (err) {
      console.error(err)
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to update profile. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <ProtectedRoute requirePharmacy>
        <PharmacyLayout title="Pharmacy Profile" subtitle="Loading profile data...">
          <div className="card pf-p-3 pf-center">
            <span className="loading-spinner"></span>
            <p className="pf-mt-sm">Loading data...</p>
          </div>
        </PharmacyLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requirePharmacy>
      <PharmacyLayout 
        title="Pharmacy Profile" 
        subtitle="Manage your business details and location."
      >
        <div className="card pf-p-2">
          <h2 className="pf-h2 pf-mb-md">Profile Settings</h2>
          
          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <form className="form" onSubmit={handleSubmit}>
            <div className="pf-mb-md">
              <label className="pf-label">Pharmacy Name *</label>
              <input
                className="pf-input"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Official pharmacy name"
                required
              />
            </div>

            <div className="pf-row pf-gap-md pf-mb-md">
              <div className="pf-flex-1">
                <label className="pf-label">Area *</label>
                <input
                  className="pf-input"
                  name="area"
                  type="text"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Street or neighborhood"
                  required
                />
              </div>

              <div className="pf-flex-1">
                <label className="pf-label">City / State *</label>
                <input
                  className="pf-input"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City and State"
                  required
                />
              </div>
            </div>

            <div className="pf-row pf-gap-md pf-mb-md">
              <div className="pf-flex-1">
                <label className="pf-label">Latitude *</label>
                <input
                  className="pf-input"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="pf-flex-1">
                <label className="pf-label">Longitude *</label>
                <input
                  className="pf-input"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="pf-mb-md">
              <label className="pf-label">Contact Number</label>
              <input
                className="pf-input"
                name="contact"
                type="text"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="pf-mb-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <input
                  type="checkbox"
                  name="delivery_available"
                  id="delivery_available"
                  checked={formData.delivery_available}
                  onChange={handleInputChange}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="delivery_available" style={{ fontSize: '0.9rem', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>
                  Enable Home Delivery Service
                </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button pf-w-100" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </PharmacyLayout>
    </ProtectedRoute>
  )
}

export default PharmacyProfilePage
