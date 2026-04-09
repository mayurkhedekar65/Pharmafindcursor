import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getCreditCustomers, addCreditCustomer } from '../services/apiClient'
import ProtectedRoute from '../components/ProtectedRoute'

function PharmacyCreditPage() {
    const { user } = useAuth()
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        total_due: '',
        notes: ''
    })

    useEffect(() => {
        if (user?.pharmacy_id) {
            loadCustomers()
        }
    }, [user?.pharmacy_id])

    const loadCustomers = async () => {
        try {
            const data = await getCreditCustomers(user.pharmacy_id)
            setCustomers(data)
        } catch (err) {
            setError('Failed to load credit customers.')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        try {
            await addCreditCustomer(user.pharmacy_id, {
                name: formData.name,
                phone: formData.phone,
                total_due: parseFloat(formData.total_due) || 0,
                notes: formData.notes
            })
            setSuccess('Customer added successfully!')
            setFormData({ name: '', phone: '', total_due: '', notes: '' })
            setShowAddForm(false)
            loadCustomers()
        } catch (err) {
            setError('Failed to add customer.')
        }
    }

    const totalOutstanding = customers.reduce((sum, c) => sum + parseFloat(c.total_due), 0)

    return (
        <ProtectedRoute requirePharmacy>
            <div className="page-container">
                <section className="card">
                    <div className="card-header-row">
                        <div>
                            <h2 className="pf-hero-title" style={{ fontSize: '1.8rem' }}>Credit Management</h2>
                            <p className="card-description">Track regular customers and outstanding dues</p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="secondary-button"
                        >
                            {showAddForm ? 'Cancel' : '+ New Customer'}
                        </button>
                    </div>

                    <div style={{
                        background: 'var(--primary-color)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Total Outstanding Dues</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>₹{totalOutstanding.toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Active Ledgers</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{customers.length}</div>
                        </div>
                    </div>

                    {showAddForm && (
                        <form className="form" onSubmit={handleSubmit} style={{
                            border: '1px solid #eee',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            marginBottom: '2rem'
                        }}>
                            <h3>New Credit Entry</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Customer Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Opening Due Amount (₹) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={formData.total_due}
                                    onChange={(e) => setFormData({ ...formData, total_due: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Notes</label>
                                <textarea
                                    className="form-input"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="2"
                                />
                            </div>
                            <button type="submit" className="primary-button" style={{ marginTop: '1rem' }}>
                                Add to Ledger
                            </button>
                        </form>
                    )}

                    {loading ? (
                        <div className="loading-spinner"></div>
                    ) : customers.length === 0 ? (
                        <p className="info-text">No credit ledgers found.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="pf-table">
                                <thead>
                                    <tr>
                                        <th>Customer Name</th>
                                        <th>Phone</th>
                                        <th>Notes</th>
                                        <th>Due Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ fontWeight: '600' }}>{c.name}</td>
                                            <td>{c.phone}</td>
                                            <td style={{ fontSize: '0.85rem', color: '#666' }}>{c.notes || '-'}</td>
                                            <td style={{ color: '#e67e22', fontWeight: '700' }}>₹{parseFloat(c.total_due).toLocaleString()}</td>
                                            <td>
                                                <button className="small-button">Settlement</button>
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

export default PharmacyCreditPage
