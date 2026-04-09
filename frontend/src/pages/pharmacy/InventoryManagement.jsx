import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import PharmacyLayout from '../../layout/PharmacyLayout'
import InventoryModal from '../../components/pharmacy/InventoryModal'
import ConfirmModal from '../../components/pharmacy/ConfirmModal'
import LoaderSkeleton from '../../components/pharmacy/LoaderSkeleton'
import EmptyState from '../../components/pharmacy/EmptyState'
import { getPharmacyStock, addMedicineToPharmacy, updateStockQuantity, removeMedicineFromPharmacy } from '../../services/apiClient'
import '../../pharmacy.css'

const MEDICINE_ICONS = ['💊', '💉', '🧴', '🩺', '🧪', '🩹']

function InventoryManagement() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [inventory, setInventory] = useState([])
    const [filteredInventory, setFilteredInventory] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [deleteItem, setDeleteItem] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => { fetchInventory() }, [user])
    useEffect(() => { filterInventory() }, [inventory, searchTerm, filterType])

    const fetchInventory = async () => {
        try {
            setLoading(true)
            setError(null)
            const mockInventory = [
                { id: 1, medicine_name: 'Amoxicillin 500mg', manufacturer: 'GSK Pharmaceuticals', category: 'Antibiotic', quantity: 420, max_quantity: 500, selling_price: 12.50, cost_price: 8.50, batch_number: '#BTCH-22419', expiry_date: '2025-11-30', low_stock_threshold: 50, status: 'in-stock' },
                { id: 2, medicine_name: 'Lisinopril 10mg', manufacturer: 'Pfizer Inc.', category: 'Hypertension', quantity: 12, max_quantity: 200, selling_price: 18.00, cost_price: 12.00, batch_number: '#BTCH-99281', expiry_date: '2025-02-28', low_stock_threshold: 30, status: 'low-stock' },
                { id: 3, medicine_name: 'Metformin 850mg', manufacturer: 'Sandoz', category: 'Anti-diabetic', quantity: 250, max_quantity: 400, selling_price: 9.00, cost_price: 5.50, batch_number: '#BTCH-33184', expiry_date: '2024-12-15', low_stock_threshold: 40, status: 'expiring-soon' },
                { id: 4, medicine_name: 'Atorvastatin 20mg', manufacturer: 'Lupin Pharmaceuticals', category: 'Cholesterol', quantity: 1100, max_quantity: 1200, selling_price: 22.00, cost_price: 14.00, batch_number: '#BTCH-77542', expiry_date: '2027-01-31', low_stock_threshold: 100, status: 'in-stock' },
                { id: 5, medicine_name: 'Paracetamol 500mg', manufacturer: 'Sun Pharma', category: 'Analgesic', quantity: 150, max_quantity: 500, selling_price: 5.50, cost_price: 3.20, batch_number: '#BTCH-10021', expiry_date: '2026-08-20', low_stock_threshold: 50, status: 'in-stock' },
            ]
            setInventory(mockInventory)
        } catch (err) {
            setError('Failed to load inventory. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const filterInventory = () => {
        let filtered = [...inventory]
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        if (filterType === 'low-stock') {
            filtered = filtered.filter(item => item.quantity <= item.low_stock_threshold)
        } else if (filterType === 'expiring') {
            const threeMonths = new Date()
            threeMonths.setMonth(threeMonths.getMonth() + 3)
            filtered = filtered.filter(item => new Date(item.expiry_date) <= threeMonths)
        }
        setFilteredInventory(filtered)
    }

    const handleAddMedicine = async (formData) => {
        try {
            const newItem = {
                id: inventory.length + 1,
                medicine_name: formData.medicineName,
                manufacturer: formData.manufacturer || 'Unknown',
                category: formData.category,
                quantity: parseInt(formData.quantity),
                max_quantity: parseInt(formData.quantity) * 2,
                selling_price: parseFloat(formData.selling_price),
                cost_price: parseFloat(formData.cost_price),
                batch_number: formData.batch_number,
                expiry_date: formData.expiry_date,
                low_stock_threshold: parseInt(formData.low_stock_threshold),
                status: 'in-stock'
            }
            setInventory([...inventory, newItem])
            setShowAddModal(false)
        } catch (err) {
            alert('Failed to add medicine.')
        }
    }

    const handleEditMedicine = async (formData) => {
        try {
            const updated = inventory.map(item =>
                item.id === editItem.id ? {
                    ...item,
                    medicine_name: formData.medicineName,
                    category: formData.category,
                    quantity: parseInt(formData.quantity),
                    selling_price: parseFloat(formData.selling_price),
                    cost_price: parseFloat(formData.cost_price),
                    batch_number: formData.batch_number,
                    expiry_date: formData.expiry_date,
                    low_stock_threshold: parseInt(formData.low_stock_threshold)
                } : item
            )
            setInventory(updated)
            setEditItem(null)
        } catch (err) {
            alert('Failed to update medicine.')
        }
    }

    const handleDeleteMedicine = async () => {
        try {
            setInventory(inventory.filter(item => item.id !== deleteItem.id))
            setDeleteItem(null)
        } catch (err) {
            alert('Failed to delete medicine.')
        }
    }

    const getStockBarClass = (item) => {
        const ratio = item.quantity / item.max_quantity
        if (item.quantity <= item.low_stock_threshold) return 'bar-low'
        const threeMonths = new Date(); threeMonths.setMonth(threeMonths.getMonth() + 3)
        if (new Date(item.expiry_date) <= threeMonths) return 'bar-warn'
        if (ratio < 0.4) return 'bar-mid'
        return 'bar-high'
    }

    const getStockBarWidth = (item) => {
        return Math.min(100, Math.round((item.quantity / item.max_quantity) * 100))
    }

    const isExpiringSoon = (expiry_date) => {
        const threeMonths = new Date(); threeMonths.setMonth(threeMonths.getMonth() + 3)
        return new Date(expiry_date) <= threeMonths
    }

    const getStatusBadge = (item) => {
        if (item.quantity <= item.low_stock_threshold) return <span className="pf-badge alert">Low Stock</span>
        if (isExpiringSoon(item.expiry_date)) return <span className="pf-badge warning">Expiring</span>
        return <span className="pf-badge success">In Stock</span>
    }

    const lowStockCount = inventory.filter(i => i.quantity <= i.low_stock_threshold).length
    const expiringCount = inventory.filter(i => isExpiringSoon(i.expiry_date)).length

    if (loading) {
        return (
            <PharmacyLayout title="Inventory Management" subtitle="Real-time clinical stock levels and expiration monitoring.">
                <LoaderSkeleton count={1} type="table" />
            </PharmacyLayout>
        )
    }

    return (
        <PharmacyLayout title="Inventory Management" subtitle="Real-time pharmaceutical stock monitoring & logistics.">
            {/* Bento Stat Cards */}
            <div className="dashboard-grid pf-mb-2">
                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '20px', position: 'relative', overflow: 'hidden' }} className="group">
                    <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total SKU Count</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b' }}>{inventory.length}</h3>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#27ae60', fontSize: '0.85rem', fontWeight: '700' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>trending_up</span>
                        <span>+12% vs last month</span>
                    </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '20px', position: 'relative', overflow: 'hidden' }} className="group">
                    <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Low Stock Alerts</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ef4444' }}>{lowStockCount}</h3>
                    <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Requires immediate restocking</p>
                </div>

                <div style={{ background: 'rgba(49, 181, 102, 0.05)', border: '2px solid rgba(49, 181, 102, 0.1)', padding: '2rem', borderRadius: '20px', position: 'relative', overflow: 'hidden' }} className="group">
                    <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#31b566', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Vault Integrity</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#31b566' }}>99.8%</h3>
                    <p style={{ marginTop: '1rem', color: '#31b566', fontSize: '0.85rem', fontWeight: '600' }}>Optimal temperature maintained</p>
                </div>

                <button 
                  className="primary-button" 
                  onClick={() => setShowAddModal(true)}
                  style={{ height: '100%', borderRadius: '20px', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>add</span>
                  <span>Add New Medicine</span>
                </button>
            </div>

            {/* Filters bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div className="pf-filter-group">
                    <button className={`pf-filter-btn ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>All Medicines</button>
                    <button className={`pf-filter-btn ${filterType === 'low-stock' ? 'active' : ''}`} onClick={() => setFilterType('low-stock')}>Low Stock</button>
                    <button className={`pf-filter-btn ${filterType === 'expiring' ? 'active' : ''}`} onClick={() => setFilterType('expiring')}>Expiring Soon</button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="pf-search-bar" style={{ maxWidth: '280px' }}>
                        <span className="pf-search-icon">
                            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>search</span>
                        </span>
                        <input
                            type="text"
                            className="pf-search-input"
                            placeholder="Search clinical stock..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="pf-table-container">
                <table className="pf-table">
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ padding: '1.5rem 2rem', fontSize: '0.65rem', color: '#64748b' }}>Medicine Name</th>
                            <th style={{ padding: '1.5rem 1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Category</th>
                            <th style={{ padding: '1.5rem 1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Batch ID</th>
                            <th style={{ padding: '1.5rem 1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Stock Level</th>
                            <th style={{ padding: '1.5rem 1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Expiry Date</th>
                            <th style={{ padding: '1.5rem 2rem', fontSize: '0.65rem', color: '#64748b', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        {filteredInventory.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }} className="group">
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(73, 165, 242, 0.1)', color: 'var(--pharmacy-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span className="material-symbols-outlined">{item.category === 'Antibiotic' ? 'pill' : 'vaccines'}</span>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.875rem' }}>{item.medicine_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.manufacturer}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '4px 12px', background: 'rgba(73, 165, 242, 0.05)', color: 'var(--pharmacy-primary)', borderRadius: '100px' }}>{item.category}</span>
                                </td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>{item.batch_number}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '120px' }}>
                                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div 
                                              style={{ 
                                                height: '100%', 
                                                width: `${getStockBarWidth(item)}%`, 
                                                background: item.quantity <= item.low_stock_threshold ? '#ef4444' : 'var(--pharmacy-primary)' 
                                              }} 
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: '800' }}>
                                            <span style={{ color: item.quantity <= item.low_stock_threshold ? '#ef4444' : '#1e293b' }}>{item.quantity} Units</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                                    {new Date(item.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                    <button 
                                      className="small-button" 
                                      onClick={() => setEditItem(item)}
                                      style={{ padding: '0.5rem', borderRadius: '8px' }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>edit</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <InventoryModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddMedicine} />
            <InventoryModal isOpen={!!editItem} onClose={() => setEditItem(null)} onSubmit={handleEditMedicine}
                editData={editItem ? {
                    medicineName: editItem.medicine_name, category: editItem.category, quantity: editItem.quantity,
                    selling_price: editItem.selling_price, cost_price: editItem.cost_price,
                    batch_number: editItem.batch_number, expiry_date: editItem.expiry_date,
                    low_stock_threshold: editItem.low_stock_threshold
                } : null}
            />
            <ConfirmModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDeleteMedicine}
                title="Delete Medicine" message={`Are you sure you want to delete "${deleteItem?.medicine_name}"?`}
                confirmText="Delete" type="danger"
            />
        </PharmacyLayout>
    )
}

export default InventoryManagement
