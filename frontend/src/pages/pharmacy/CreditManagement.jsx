import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import PharmacyLayout from '../../layout/PharmacyLayout'
import LoaderSkeleton from '../../components/pharmacy/LoaderSkeleton'
import EmptyState from '../../components/pharmacy/EmptyState'
import '../../pharmacy.css'

function CreditManagement() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [credits, setCredits] = useState([])
    const [filteredCredits, setFilteredCredits] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [settleModal, setSettleModal] = useState(null)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchCredits()
    }, [user])

    useEffect(() => {
        filterCredits()
    }, [credits, searchTerm])

    const fetchCredits = async () => {
        try {
            setLoading(true)
            setError(null)

            // Mock data - replace with actual API call
            const mockCredits = [
                {
                    id: 1,
                    customer_name: 'Rajesh Kumar',
                    customer_phone: '+91 98765 43210',
                    total_credit: 5250.00,
                    last_payment_date: '2026-02-10',
                    last_payment_amount: 1000.00,
                    credit_history: [
                        { date: '2026-02-10', amount: 1000, type: 'payment' },
                        { date: '2026-02-08', amount: 1500, type: 'purchase' },
                        { date: '2026-02-01', amount: 2000, type: 'payment' }
                    ]
                },
                {
                    id: 2,
                    customer_name: 'Priya Sharma',
                    customer_phone: '+91 98765 43211',
                    total_credit: 2800.00,
                    last_payment_date: '2026-02-12',
                    last_payment_amount: 500.00,
                    credit_history: [
                        { date: '2026-02-12', amount: 500, type: 'payment' },
                        { date: '2026-02-05', amount: 800, type: 'purchase' }
                    ]
                },
                {
                    id: 3,
                    customer_name: 'Amit Patel',
                    customer_phone: '+91 98765 43212',
                    total_credit: 8500.00,
                    last_payment_date: '2026-02-08',
                    last_payment_amount: 2000.00,
                    credit_history: [
                        { date: '2026-02-08', amount: 2000, type: 'payment' },
                        { date: '2026-02-03', amount: 3500, type: 'purchase' }
                    ]
                },
                {
                    id: 4,
                    customer_name: 'Sunita Verma',
                    customer_phone: '+91 98765 43213',
                    total_credit: 1200.00,
                    last_payment_date: '2026-02-14',
                    last_payment_amount: 800.00,
                    credit_history: [
                        { date: '2026-02-14', amount: 800, type: 'payment' },
                        { date: '2026-02-11', amount: 600, type: 'purchase' }
                    ]
                }
            ]

            setCredits(mockCredits)
        } catch (err) {
            console.error('Error fetching credits:', err)
            setError('Failed to load credit data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const filterCredits = () => {
        let filtered = [...credits]

        if (searchTerm) {
            filtered = filtered.filter(credit =>
                credit.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                credit.customer_phone.includes(searchTerm)
            )
        }

        setFilteredCredits(filtered)
    }

    const handleSettleCredit = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            alert('Please enter a valid payment amount')
            return
        }

        try {
            // In production, call API
            // await settleCreditPayment(settleModal.id, parseFloat(paymentAmount))

            // Mock implementation
            const updated = credits.map(credit =>
                credit.id === settleModal.id
                    ? {
                        ...credit,
                        total_credit: Math.max(0, credit.total_credit - parseFloat(paymentAmount)),
                        last_payment_date: new Date().toISOString().split('T')[0],
                        last_payment_amount: parseFloat(paymentAmount),
                        credit_history: [
                            { date: new Date().toISOString().split('T')[0], amount: parseFloat(paymentAmount), type: 'payment' },
                            ...credit.credit_history
                        ]
                    }
                    : credit
            )

            setCredits(updated)
            setSettleModal(null)
            setPaymentAmount('')

            // Success animation
            const successMsg = document.createElement('div')
            successMsg.innerHTML = '✅ Payment of ₹' + parseFloat(paymentAmount).toLocaleString() + ' recorded successfully!'
            successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--pharmacy-success), #27ae60);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `
            document.body.appendChild(successMsg)
            setTimeout(() => successMsg.remove(), 3000)
        } catch (err) {
            console.error('Error settling credit:', err)
            alert('❌ Failed to record payment. Please try again.')
        }
    }

    const getTotalCredit = () => {
        return filteredCredits.reduce((total, credit) => total + credit.total_credit, 0)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <PharmacyLayout title="Credit Management">
                <LoaderSkeleton count={1} type="table" />
            </PharmacyLayout>
        )
    }

    return (
        <PharmacyLayout title="Credit Ledger" subtitle="Manage outstanding balances and collection cycles for pharmaceutical accounts.">
            {/* Bento Stat Cards */}
            <div className="dashboard-grid pf-mb-2">
                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }} className="group">
                    <div style={{ position: 'absolute', right: '-1rem', bottom: '-1rem', opacity: '0.05' }} className="group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined" style={{ fontSize: '9rem' }}>account_balance_wallet</span>
                    </div>
                    <div style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total Receivables</div>
                    <div style={{ fontSize: '2.5rem', fontBlack: '900', color: 'var(--pharmacy-primary)' }}>₹{getTotalCredit().toLocaleString()}</div>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#27ae60', fontWeight: '800' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>trending_up</span>
                        <span>+12% from last month</span>
                    </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }} className="group">
                    <div style={{ position: 'absolute', right: '-1rem', bottom: '-1rem', opacity: '0.05' }} className="group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined" style={{ fontSize: '9rem' }}>warning</span>
                    </div>
                    <div style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Overdue 30+ Days</div>
                    <div style={{ fontSize: '2.5rem', fontBlack: '900', color: '#ef4444' }}>₹{(getTotalCredit() * 0.15).toLocaleString()}</div>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#ef4444', fontWeight: '800' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>priority_high</span>
                        <span>4 accounts require attention</span>
                    </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }} className="group">
                    <div style={{ position: 'absolute', right: '-1rem', bottom: '-1rem', opacity: '0.05' }} className="group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined" style={{ fontSize: '9rem' }}>fact_check</span>
                    </div>
                    <div style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Settled This Week</div>
                    <div style={{ fontSize: '2.5rem', fontBlack: '900', color: '#31b566' }}>₹12,450</div>
                    <div style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>18 transactions processed</div>
                </div>
            </div>

            {/* Ledger Table Container */}
            <div className="pf-table-container">
                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>Active Credits</h2>
                    <div className="pf-search-bar" style={{ maxWidth: '280px', margin: '0' }}>
                        <span className="pf-search-icon">
                            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>search</span>
                        </span>
                        <input
                            type="text"
                            className="pf-search-input"
                            placeholder="Search customer records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="pf-table">
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ padding: '1.5rem 2rem', fontSize: '0.65rem', color: '#64748b' }}>Customer Name</th>
                            <th style={{ padding: '1.5rem 1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Phone</th>
                            <th style={{ padding: '1.5rem 1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Last Activity</th>
                            <th style={{ padding: '1.5rem 1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Balance</th>
                            <th style={{ padding: '1.5rem 1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Status</th>
                            <th style={{ padding: '1.5rem 2rem', fontSize: '0.65rem', color: '#64748b', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        {filteredCredits.map((credit) => (
                            <tr key={credit.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }} className="group">
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(73, 165, 242, 0.1)', color: 'var(--pharmacy-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.75rem' }}>
                                            {credit.customer_name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.875rem' }}>{credit.customer_name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>ID: CS-{9000 + credit.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>{credit.customer_phone}</td>
                                <td style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>{formatDate(credit.last_payment_date)}</td>
                                <td>
                                    <div style={{ fontWeight: '900', color: credit.total_credit > 5000 ? '#ef4444' : '#1e293b', fontSize: '1.125rem' }}>₹{credit.total_credit.toLocaleString()}</div>
                                    {credit.total_credit > 5000 && <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase' }}>Overdue</div>}
                                </td>
                                <td>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '4px 12px', background: credit.total_credit > 5000 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(39, 174, 96, 0.1)', color: credit.total_credit > 5000 ? '#ef4444' : '#27ae60', borderRadius: '100px' }}>
                                        {credit.total_credit > 5000 ? 'Warning' : 'Good Standing'}
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                    <button 
                                      className="primary-button" 
                                      onClick={() => { setSettleModal(credit); setPaymentAmount(credit.total_credit) }}
                                      style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.75rem' }}
                                    >
                                        Settle Credit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Settle Credit Modal */}
            {settleModal && (
                <div className="pf-modal-overlay" onClick={() => setSettleModal(null)} style={{ backdropFilter: 'blur(10px)', background: 'rgba(23, 28, 31, 0.4)' }}>
                    <div className="pf-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, var(--pharmacy-primary), #004a78)', padding: '2.5rem', color: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '2rem', fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                                </div>
                                <button onClick={() => setSettleModal(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '0.25rem' }}>Settle Account Credit</h3>
                            <p style={{ opacity: '0.8', fontSize: '0.875rem' }}>Processing settlement for <span style={{ fontWeight: '800' }}>{settleModal.customer_name}</span></p>
                        </div>

                        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Outstanding Balance</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '900', color: '#ef4444' }}>₹{settleModal.total_credit.toLocaleString()}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.25rem' }}>Last Invoice</p>
                                    <p style={{ fontWeight: '800', color: '#1e293b' }}>INV-{900000 + settleModal.id}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Payment Amount</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#64748b' }}>₹</span>
                                        <input 
                                          type="number" 
                                          value={paymentAmount} 
                                          onChange={(e) => setPaymentAmount(e.target.value)}
                                          style={{ width: '100%', padding: '1.25rem 1.25rem 1.25rem 2rem', background: '#f8fafc', border: 'none', borderRadius: '16px', fontSize: '1.5rem', fontWeight: '900', color: '#1e293b' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Payment Method</label>
                                        <select style={{ width: '100%', padding: '1rem', background: '#f8fafc', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem' }}>
                                            <option>Bank Transfer</option>
                                            <option>Cash</option>
                                            <option>UPI</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Reference ID</label>
                                        <input placeholder="REF-882291" style={{ width: '100%', padding: '1rem', background: '#f8fafc', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
                                <button onClick={() => setSettleModal(null)} style={{ flex: '1', padding: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '16px', fontWeight: '800', color: '#475569', cursor: 'pointer' }}>Cancel</button>
                                <button 
                                  onClick={handleSettleCredit}
                                  style={{ flex: '2', padding: '1.25rem', background: 'var(--pharmacy-primary)', border: 'none', borderRadius: '16px', fontWeight: '900', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 20px rgba(73, 165, 242, 0.2)' }}
                                >
                                    <span className="material-symbols-outlined">verified</span>
                                    Confirm Settlement
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PharmacyLayout>
    )
}

export default CreditManagement
