import { useState } from 'react'
import '../../pharmacy.css'

function InventoryModal({ isOpen, onClose, onSubmit, editData = null }) {
    const [formData, setFormData] = useState(editData || {
        medicineName: '',
        medicineDescription: '',
        category: 'medicine',
        quantity: '',
        price: '',
        selling_price: '',
        cost_price: '',
        batch_number: '',
        expiry_date: '',
        low_stock_threshold: '10'
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    if (!isOpen) return null

    return (
        <div className="pf-modal-overlay" onClick={onClose}>
            <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
                <div className="pf-modal-header">
                    <h2 className="pf-modal-title">
                        {editData ? '✏️ Edit Medicine' : '➕ Add New Medicine'}
                    </h2>
                    <button className="pf-modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="pf-modal-body">
                        <div className="pf-form-group">
                            <label className="pf-form-label">Medicine Name *</label>
                            <input
                                type="text"
                                name="medicineName"
                                className="pf-form-input"
                                value={formData.medicineName}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Paracetamol 500mg"
                            />
                        </div>

                        <div className="pf-form-group">
                            <label className="pf-form-label">Description</label>
                            <textarea
                                name="medicineDescription"
                                className="pf-form-textarea"
                                value={formData.medicineDescription}
                                onChange={handleChange}
                                placeholder="Brief description of the medicine"
                            />
                        </div>

                        <div className="pf-grid-2">
                            <div className="pf-form-group">
                                <label className="pf-form-label">Category *</label>
                                <select
                                    name="category"
                                    className="pf-form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="medicine">Medicine</option>
                                    <option value="supplement">Supplement</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="pf-form-group">
                                <label className="pf-form-label">Quantity *</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    className="pf-form-input"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="pf-grid-2">
                            <div className="pf-form-group">
                                <label className="pf-form-label">Cost Price (₹) *</label>
                                <input
                                    type="number"
                                    name="cost_price"
                                    className="pf-form-input"
                                    value={formData.cost_price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="pf-form-group">
                                <label className="pf-form-label">Selling Price (₹) *</label>
                                <input
                                    type="number"
                                    name="selling_price"
                                    className="pf-form-input"
                                    value={formData.selling_price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="pf-grid-2">
                            <div className="pf-form-group">
                                <label className="pf-form-label">Batch Number *</label>
                                <input
                                    type="text"
                                    name="batch_number"
                                    className="pf-form-input"
                                    value={formData.batch_number}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., BT2024001"
                                />
                            </div>

                            <div className="pf-form-group">
                                <label className="pf-form-label">Expiry Date *</label>
                                <input
                                    type="date"
                                    name="expiry_date"
                                    className="pf-form-input"
                                    value={formData.expiry_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pf-form-group">
                            <label className="pf-form-label">Low Stock Threshold</label>
                            <input
                                type="number"
                                name="low_stock_threshold"
                                className="pf-form-input"
                                value={formData.low_stock_threshold}
                                onChange={handleChange}
                                min="0"
                                placeholder="10"
                            />
                        </div>
                    </div>

                    <div className="pf-modal-footer">
                        <button type="button" className="secondary-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="primary-button">
                            {editData ? 'Update Medicine' : 'Add Medicine'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default InventoryModal
