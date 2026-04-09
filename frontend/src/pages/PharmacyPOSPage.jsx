import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getPharmacyStock } from '../services/apiClient'
import ProtectedRoute from '../components/ProtectedRoute'

function PharmacyPOSPage() {
    const { user } = useAuth()
    const [query, setQuery] = useState('')
    const [cart, setCart] = useState([])
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)

    const handleSearch = async (val) => {
        setQuery(val)
        if (val.length < 2) {
            setResults([])
            return
        }

        setLoading(true)
        try {
            const stock = await getPharmacyStock(user.pharmacy_id)
            const filtered = stock.filter(s =>
                s.medicine.name.toLowerCase().includes(val.toLowerCase()) ||
                (s.batch_number && s.batch_number.toLowerCase().includes(val.toLowerCase()))
            )
            setResults(filtered)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const addToPOS = (item) => {
        const existing = cart.find(c => c.id === item.id)
        if (existing) {
            setCart(cart.map(c => c.id === item.id ? { ...c, posQty: c.posQty + 1 } : c))
        } else {
            setCart([...cart, { ...item, posQty: 1 }])
        }
        setQuery('')
        setResults([])
    }

    const total = cart.reduce((sum, item) => sum + (item.posQty * (item.selling_price || item.medicine.price)), 0)

    return (
        <ProtectedRoute requirePharmacy>
            <div className="page-container" style={{ maxWidth: '1200px' }}>
                <h2 className="pf-hero-title" style={{ fontSize: '1.8rem' }}>Staff POS Terminal</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', marginTop: '1.5rem' }}>
                    {/* Main Area: Search & Selection */}
                    <section className="card">
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label>Scan Barcode or Search Medicine</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter name or batch number..."
                                value={query}
                                onChange={(e) => handleSearch(e.target.value)}
                                autoFocus
                            />
                            {loading && <div className="loading-spinner-sm" style={{ position: 'absolute', right: '10px', top: '35px' }}></div>}

                            {results.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'white',
                                    zIndex: 10,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    borderRadius: '8px',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    border: '1px solid #eee'
                                }}>
                                    {results.map(r => (
                                        <div key={r.id} onClick={() => addToPOS(r)} style={{
                                            padding: '1rem',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f5f5f5',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }} className="hover:bg-gray-50">
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{r.medicine.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Batch: {r.batch_number || 'N/A'} | Stock: {r.quantity}</div>
                                            </div>
                                            <div style={{ fontWeight: '700' }}>₹{r.selling_price || r.medicine.price}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="table-responsive" style={{ marginTop: '2rem' }}>
                            <table className="pf-table">
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th>Subtotal</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.length === 0 && (
                                        <tr><td colSpan="5" className="info-text" style={{ textAlign: 'center' }}>Terminal entry is empty</td></tr>
                                    )}
                                    {cart.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.medicine.name}</td>
                                            <td>₹{item.selling_price || item.medicine.price}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <button className="small-button" onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, posQty: Math.max(1, c.posQty - 1) } : c))}>-</button>
                                                    <span>{item.posQty}</span>
                                                    <button className="small-button" onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, posQty: c.posQty + 1 } : c))}>+</button>
                                                </div>
                                            </td>
                                            <td>₹{(item.posQty * (item.selling_price || item.medicine.price)).toFixed(2)}</td>
                                            <td>
                                                <button className="small-button delete-button" onClick={() => setCart(cart.filter(c => c.id !== item.id))}>✕</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Checkout Area */}
                    <section className="card" style={{ height: 'fit-content' }}>
                        <h3>Bill Summary</h3>
                        <div style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                            <span>Subtotal</span>
                            <strong>₹{total.toFixed(2)}</strong>
                        </div>
                        <div style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                            <span>GST (Incl. 12%)</span>
                            <span>₹{(total * 0.12).toFixed(2)}</span>
                        </div>
                        <div style={{ borderTop: '2px solid #eee', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem' }}>
                            <span>TOTAL</span>
                            <strong style={{ color: 'var(--primary-color)' }}>₹{total.toFixed(2)}</strong>
                        </div>

                        <button className="primary-button" style={{ width: '100%', marginTop: '2rem', height: '50px', fontSize: '1.1rem' }} onClick={() => {
                            alert('Invoice Generated Successfully!')
                            setCart([])
                        }} disabled={cart.length === 0}>
                            Submit & Print Bill
                        </button>
                        <button className="secondary-button" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setCart([])}>
                            Clear All
                        </button>
                    </section>
                </div>
            </div>
        </ProtectedRoute>
    )
}

export default PharmacyPOSPage
