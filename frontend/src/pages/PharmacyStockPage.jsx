import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getPharmacyStock,
  addMedicineToPharmacy,
  updateStockQuantity,
  removeMedicineFromPharmacy,
} from '../services/apiClient'
import ProtectedRoute from '../components/ProtectedRoute'
import PharmacyLayout from '../layout/PharmacyLayout'

function PharmacyStockPage() {
  const { user } = useAuth()
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showAddForm, setShowAddForm] = useState(false)
  const [addFormData, setAddFormData] = useState({
    medicineName: '',
    medicineDescription: '',
    quantity: '',
  })
  const [editingStockId, setEditingStockId] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')

  useEffect(() => {
    if (user?.pharmacy_id) {
      loadStock()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.pharmacy_id])

  const loadStock = async () => {
    if (!user?.pharmacy_id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getPharmacyStock(user.pharmacy_id)
      setStock(data || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load stock information.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!addFormData.medicineName.trim() || !addFormData.quantity.trim()) {
      setError('Medicine name and quantity are required.')
      return
    }

    const quantity = parseInt(addFormData.quantity, 10)
    if (isNaN(quantity) || quantity < 0) {
      setError('Please enter a valid non-negative quantity.')
      return
    }

    try {
      await addMedicineToPharmacy(user.pharmacy_id, {
        medicineName: addFormData.medicineName,
        medicineDescription: addFormData.medicineDescription,
        quantity,
      })
      setSuccess('Medicine added to stock successfully!')
      setAddFormData({ medicineName: '', medicineDescription: '', quantity: '' })
      setShowAddForm(false)
      loadStock()
    } catch (err) {
      console.error(err)
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to add medicine. Please try again.'
      )
    }
  }

  const handleEditStart = (stockItem) => {
    setEditingStockId(stockItem.id)
    setEditQuantity(String(stockItem.quantity))
  }

  const handleEditCancel = () => {
    setEditingStockId(null)
    setEditQuantity('')
  }

  const handleEditSave = async (stockId) => {
    setError('')
    setSuccess('')

    const quantity = parseInt(editQuantity, 10)
    if (isNaN(quantity) || quantity < 0) {
      setError('Please enter a valid non-negative quantity.')
      return
    }

    try {
      await updateStockQuantity(user.pharmacy_id, stockId, quantity)
      setSuccess('Stock quantity updated successfully!')
      setEditingStockId(null)
      setEditQuantity('')
      loadStock()
    } catch (err) {
      console.error(err)
      setError('Failed to update stock quantity.')
    }
  }

  const handleDelete = async (stockId, medicineName) => {
    if (!window.confirm(`Are you sure you want to remove ${medicineName} from stock?`)) {
      return
    }

    setError('')
    setSuccess('')

    try {
      await removeMedicineFromPharmacy(user.pharmacy_id, stockId)
      setSuccess('Medicine removed from stock successfully!')
      loadStock()
    } catch (err) {
      console.error(err)
      setError('Failed to remove medicine from stock.')
    }
  }

  return (
    <ProtectedRoute requirePharmacy>
      <PharmacyLayout 
        title="Medicine Inventory" 
        subtitle="Manage your store inventory and stock levels."
      >
        <div className="card pf-p-2 pf-mb-lg">
          <div className="pf-flex pf-between pf-align-center pf-mb-md">
            <div>
              <h2 className="pf-h2">Medicine Inventory</h2>
              <p className="pf-text-secondary">Update counts or add new products to your store.</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="primary-button"
              style={{ background: showAddForm ? '#ef4444' : 'var(--pharmacy-primary)' }}
            >
              {showAddForm ? 'Cancel' : '+ Add Medicine'}
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          {showAddForm && (
            <div className="pf-p-2 pf-mb-md" style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <form className="form" onSubmit={handleAddSubmit}>
                <h3 className="pf-h3 pf-mb-sm">Add New Medicine</h3>
                <div className="pf-row pf-gap-md pf-mb-md">
                  <div className="pf-flex-2">
                    <label className="pf-label">Medicine Name *</label>
                    <input
                      type="text"
                      className="pf-input"
                      value={addFormData.medicineName}
                      onChange={(e) => setAddFormData({ ...addFormData, medicineName: e.target.value })}
                      placeholder="e.g. Amoxicillin 500mg"
                      required
                    />
                  </div>
                  <div className="pf-flex-1">
                    <label className="pf-label">Quantity *</label>
                    <input
                      type="number"
                      className="pf-input"
                      min="0"
                      value={addFormData.quantity}
                      onChange={(e) => setAddFormData({ ...addFormData, quantity: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="pf-mb-md">
                  <label className="pf-label">Description (optional)</label>
                  <textarea
                    className="pf-input"
                    value={addFormData.medicineDescription}
                    onChange={(e) => setAddFormData({ ...addFormData, medicineDescription: e.target.value })}
                    placeholder="Brief description of the medicine..."
                    rows="3"
                  />
                </div>

                <button type="submit" className="primary-button">
                  Save Medicine
                </button>
              </form>
            </div>
          )}

          {loading ? (
             <div className="pf-p-3 pf-center">
                <span className="loading-spinner"></span>
                <p className="pf-mt-sm">Loading stock inventory...</p>
             </div>
          ) : stock.length === 0 ? (
            <div className="pf-p-3 pf-center">
               <p className="pf-text-secondary">Your inventory is currently empty. Add medicines to get started.</p>
            </div>
          ) : (
            <div className="pf-table-container">
              <table className="pf-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((item) => (
                    <tr key={item.id} className="group">
                      <td>
                        <span className="pf-weight-800">{item.medicine?.name}</span>
                      </td>
                      <td>
                        <span className="pf-text-sm pf-text-secondary">{item.medicine?.description || 'No notes attached.'}</span>
                      </td>
                      <td>
                        {editingStockId === item.id ? (
                          <div className="pf-flex pf-align-center pf-gap-xs">
                            <input
                              type="number"
                              min="0"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="pf-input"
                              style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                            />
                            <button onClick={() => handleEditSave(item.id)} className="pf-btn pf-btn-sm pf-btn-success">Save</button>
                            <button onClick={handleEditCancel} className="pf-btn pf-btn-sm">Cancel</button>
                          </div>
                        ) : (
                          <div className="pf-flex pf-align-center pf-gap-xs">
                             <span className={`pf-weight-700 ${item.quantity < 10 ? 'pf-text-danger' : ''}`}>{item.quantity} units</span>
                             {item.quantity < 10 && <span className="material-symbols-outlined pf-text-danger" style={{ fontSize: '1rem' }}>warning</span>}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {editingStockId !== item.id && (
                          <div className="pf-flex pf-justify-end pf-gap-xs">
                            <button onClick={() => handleEditStart(item)} className="pf-btn pf-btn-sm">
                              Adjust
                            </button>
                            <button onClick={() => handleDelete(item.id, item.medicine?.name)} className="pf-btn pf-btn-sm pf-btn-danger">
                              Discard
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PharmacyLayout>
    </ProtectedRoute>
  )
}

export default PharmacyStockPage
