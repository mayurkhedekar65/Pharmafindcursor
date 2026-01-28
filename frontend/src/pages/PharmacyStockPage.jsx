import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getPharmacyStock,
  addMedicineToPharmacy,
  updateStockQuantity,
  removeMedicineFromPharmacy,
} from '../services/apiClient'
import ProtectedRoute from '../components/ProtectedRoute'

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
    if (!user?.pharmacy_id) return

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
      <div className="page-container">
        <section className="card">
          <div className="card-header-row">
            <div>
              <h2>Manage Stock</h2>
              <p className="card-description">Add, update, or remove medicines from your stock</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="secondary-button"
            >
              {showAddForm ? 'Cancel' : '+ Add Medicine'}
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          {showAddForm && (
            <form className="form add-form" onSubmit={handleAddSubmit}>
              <h3>Add New Medicine</h3>
              <div className="form-group">
                <label htmlFor="medicineName">Medicine Name *</label>
                <input
                  id="medicineName"
                  type="text"
                  value={addFormData.medicineName}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, medicineName: e.target.value })
                  }
                  placeholder="e.g. Paracetamol"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="medicineDescription">Description (optional)</label>
                <textarea
                  id="medicineDescription"
                  value={addFormData.medicineDescription}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, medicineDescription: e.target.value })
                  }
                  placeholder="Medicine description..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  value={addFormData.quantity}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, quantity: e.target.value })
                  }
                  placeholder="0"
                  required
                />
              </div>

              <button type="submit" className="primary-button">
                Add to Stock
              </button>
            </form>
          )}

          {loading ? (
            <p>Loading stock...</p>
          ) : stock.length === 0 ? (
            <p className="info-text">No stock items yet. Add medicines to get started.</p>
          ) : (
            <div className="stock-table-container">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.medicine?.name}</strong>
                      </td>
                      <td>{item.medicine?.description || '-'}</td>
                      <td>
                        {editingStockId === item.id ? (
                          <div className="edit-quantity-group">
                            <input
                              type="number"
                              min="0"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="quantity-input"
                            />
                            <button
                              onClick={() => handleEditSave(item.id)}
                              className="small-button"
                            >
                              Save
                            </button>
                            <button onClick={handleEditCancel} className="small-button">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span>{item.quantity}</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {editingStockId !== item.id && (
                            <>
                              <button
                                onClick={() => handleEditStart(item)}
                                className="small-button"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, item.medicine?.name)}
                                className="small-button delete-button"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  )
}

export default PharmacyStockPage
