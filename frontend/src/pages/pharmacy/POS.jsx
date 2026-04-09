import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getPharmacyStock } from '../../services/apiClient'
import PharmacyLayout from '../../layout/PharmacyLayout'

function POS() {
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
        <PharmacyLayout title="Terminal POS" subtitle="Process real-time transactions and generate pharmaceutical invoices.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Search Field */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>qr_code_scanner</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Scan barcode or search medication molecule..."
                            style={{ width: '100%', padding: '1.25rem 1.25rem 1.25rem 3.5rem', background: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', fontSize: '1rem', fontWeight: '700', color: '#1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            autoFocus
                        />
                        {loading && <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} className="loading-spinner-sm"></div>}

                        {results.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', zIndex: 100, marginTop: '0.5rem', borderRadius: '16px', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                {results.map(r => (
                                    <div key={r.id} onClick={() => addToPOS(r)} style={{ padding: '1.25rem', cursor: 'pointer', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="hover:bg-blue-50 transition-colors">
                                        <div>
                                            <div style={{ fontWeight: '800', color: '#1e293b' }}>{r.medicine.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginTop: '0.25rem' }}>Batch: {r.batch_number || 'N/A'} • Exp: {r.expiry_date} • Stock: {r.quantity}</div>
                                        </div>
                                        <div style={{ fontWeight: '900', color: 'var(--pharmacy-primary)', fontSize: '1.125rem' }}>₹{r.selling_price || r.medicine.price}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Terminal List */}
                    <div className="pf-table-container">
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b' }}>Terminal Transaction Queue</h3>
                        </div>
                        <table className="pf-table">
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: '1rem 2rem', fontSize: '0.65rem' }}>Item Description</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem' }}>Price</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem' }}>Quantity</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.65rem' }}>Subtotal</th>
                                    <th style={{ padding: '1rem 2rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                            <div style={{ color: '#94a3b8' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '3rem', opacity: '0.3', marginBottom: '1rem' }}>point_of_sale</span>
                                                <p style={{ fontWeight: '700', fontSize: '0.875rem' }}>Terminal entry is empty</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    cart.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                                            <td style={{ padding: '1.25rem 2rem' }}>
                                                <div style={{ fontWeight: '800', color: '#1e293b' }}>{item.medicine.name}</div>
                                                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Batch: {item.batch_number}</div>
                                            </td>
                                            <td style={{ fontWeight: '700', color: '#64748b' }}>₹{item.selling_price || item.medicine.price}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <button onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, posQty: Math.max(1, c.posQty - 1) } : c))} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: '900' }}>-</button>
                                                    <span style={{ fontWeight: '900', color: '#1e293b', minWidth: '20px', textAlign: 'center' }}>{item.posQty}</span>
                                                    <button onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, posQty: c.posQty + 1 } : c))} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: '900' }}>+</button>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '900', color: '#1e293b' }}>₹{(item.posQty * (item.selling_price || item.medicine.price)).toLocaleString()}</td>
                                            <td style={{ paddingRight: '2rem', textAlign: 'right' }}>
                                                <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Checkout Summary */}
                <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', height: 'fit-content', boxShadow: '0 10px 40px rgba(0,0,0,0.02)', position: 'sticky', top: '105px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '900', color: '#1e293b', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--pharmacy-primary)' }}>receipt_long</span>
                        Bill Summary
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: '700', fontSize: '0.875rem' }}>
                            <span>Basket Subtotal</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: '700', fontSize: '0.875rem' }}>
                            <span>GST (Integrated 12%)</span>
                            <span>₹{(total * 0.12).toLocaleString()}</span>
                        </div>
                        <div style={{ margin: '1rem 0', height: '1px', background: 'rgba(0,0,0,0.05)' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '900', color: '#1e293b', fontSize: '1.125rem' }}>Grand Total</span>
                            <span style={{ fontWeight: '900', color: 'var(--pharmacy-primary)', fontSize: '1.75rem' }}>₹{total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button 
                          className="primary-button" 
                          style={{ width: '100%', height: '60px', borderRadius: '16px', fontSize: '1rem', fontWeight: '900', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 15px 30px rgba(73, 165, 242, 0.25)' }}
                          disabled={cart.length === 0}
                          onClick={() => { alert('Invoice generated successfully!'); setCart([]) }}
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>print</span>
                            Process & Print Bill
                        </button>
                        <button 
                          className="secondary-button" 
                          style={{ width: '100%', padding: '1rem', borderRadius: '16px', fontWeight: '800', justifyContent: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}
                          onClick={() => setCart([])}
                        >
                            Clear Terminal
                        </button>
                    </div>

                    <div style={{ marginTop: '2rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>info</span>
                            Billing compliance note
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', marginTop: '0.5rem', lineHeight: '1.4' }}>All prices inclusive of national taxes. Ensure molecular accuracy before printing.</p>
                    </div>
                </div>
            </div>
        </PharmacyLayout>
    )
}

export default POS
