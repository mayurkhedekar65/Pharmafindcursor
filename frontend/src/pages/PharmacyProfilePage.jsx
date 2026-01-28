import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getPharmacyProfile, updatePharmacyProfile } from '../services/apiClient'
import ProtectedRoute from '../components/ProtectedRoute'

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
    if (!user?.pharmacy_id) return

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
      setError('Failed to load pharmacy profile.')
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
        <div className="page-container">
          <section className="card">
            <p>Loading...</p>
          </section>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requirePharmacy>
      <div className="page-container">
        <section className="card">
          <h2>Pharmacy Profile</h2>
          <p className="card-description">Update your pharmacy information</p>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Pharmacy Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="area">Area *</label>
                <input
                  id="area"
                  name="area"
                  type="text"
                  value={formData.area}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude *</label>
                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude *</label>
                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact">Contact Number</label>
              <input
                id="contact"
                name="contact"
                type="text"
                value={formData.contact}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="delivery_available"
                  checked={formData.delivery_available}
                  onChange={handleInputChange}
                />
                Delivery service available
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </ProtectedRoute>
  )
}

export default PharmacyProfilePage
