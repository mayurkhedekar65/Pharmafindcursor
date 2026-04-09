import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import PharmacyLayout from '../../layout/PharmacyLayout'
import StatCard from '../../components/pharmacy/StatCard'
import LoaderSkeleton from '../../components/pharmacy/LoaderSkeleton'
import '../../pharmacy.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAYS_30 = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']

function Dashboard() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [error, setError] = useState(null)
    const [timeRange, setTimeRange] = useState('7')
    const [orderSearch, setOrderSearch] = useState('')

    useEffect(() => {
        fetchDashboardData()
    }, [user])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)
            const mockStats = {
                totalSalesToday: 4280.50,
                monthlyRevenue: 128450,
                pendingCredit: 12210,
                lowStockCount: 18,
                recentOrders: [
                    { id: '#PH-2024-9021', customer: 'Sarah Jenkins', medicines: 'Atorvastatin, Lisinopril', status: 'paid', amount: 84.20 },
                    { id: '#PH-2024-9020', customer: 'Robert Chen', medicines: 'Metformin (3x refills)', status: 'credit', amount: 12.00 },
                    { id: '#PH-2024-9019', customer: 'Anita Williams', medicines: 'Amoxicillin, Salbutamol', status: 'refused', amount: 45.15 },
                    { id: '#PH-2024-9018', customer: 'James Gordon', medicines: 'Vitamin D3, Magnesium', status: 'paid', amount: 28.90 },
                ],
                lowStockItems: [
                    { name: 'Amoxicillin 500mg', category: 'Antibiotics', left: 4, min: 50 },
                    { name: 'Insulin Glargine', category: 'Diabetes', left: 2, min: 20 },
                    { name: 'Ibuprofen 400mg', category: 'Analgesics', left: 12, min: 100 },
                ],
                revenueData: {
                    '7': [8000, 12000, 11000, 24000, 15000, 17000, 14000],
                    '30': [15000, 18000, 22000, 19000, 25000, 23000, 28000, 26000],
                }
            }
            setStats(mockStats)
        } catch (err) {
            setError('Failed to load dashboard data.')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const map = {
            paid: { label: 'PAID', cls: 'success' },
            credit: { label: 'CREDIT', cls: 'warning' },
            refused: { label: 'REFUSED', cls: 'alert' },
            pending: { label: 'PENDING', cls: 'info' },
        }
        const s = map[status] || { label: status.toUpperCase(), cls: 'info' }
        return <span className={`pf-badge ${s.cls}`}>{s.label}</span>
    }

    if (loading) {
        return (
            <PharmacyLayout title="Dashboard">
                <LoaderSkeleton count={4} type="card" />
                <div className="pf-mt-2"><LoaderSkeleton count={1} type="table" /></div>
            </PharmacyLayout>
        )
    }

    if (error) {
        return (
            <PharmacyLayout title="Dashboard">
                <div className="error-text">{error}</div>
            </PharmacyLayout>
        )
    }

    const revenueArr = stats.revenueData[timeRange]
    const maxRevenue = Math.max(...revenueArr)
    const labels = timeRange === '7' ? DAYS : DAYS_30
    const currentHighest = revenueArr.indexOf(maxRevenue)

    const filteredOrders = stats.recentOrders.filter(o =>
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.medicines.toLowerCase().includes(orderSearch.toLowerCase())
    )

    return (
        <PharmacyLayout title="Analytics Overview" subtitle="Monitoring the pulse of your clinical sanctuary today.">
            {/* Bento Stat Cards - Aligned with Repo Metrics */}
            <div className="dashboard-grid">
                <StatCard
                    title="Total Medicines"
                    value={stats?.total_medicines || 0}
                    icon={<span className="material-symbols-outlined">medication</span>}
                    type="primary"
                    trendLabel="In Inventory"
                />
                <StatCard
                    title="Total Stock Units"
                    value={stats?.total_stock || 0}
                    icon={<span className="material-symbols-outlined">inventory_2</span>}
                    type="success"
                    trendLabel="Units Available"
                />
                <StatCard
                    title="Pending Credit"
                    value={stats.pendingCredit}
                    icon={<span className="material-symbols-outlined">credit_card</span>}
                    type="warning"
                    prefix="₹"
                    trendLabel="Outstanding"
                />
                <StatCard
                    title="Low Stock Alert"
                    value={stats.lowStockCount}
                    icon={<span className="material-symbols-outlined">warning</span>}
                    type="alert"
                    badge="RE-ORDER"
                />
            </div>

            {/* Revenue Chart + Stock Alerts */}
            <div className="dashboard-main-grid pf-mb-2">
                {/* Revenue Insights */}
                <div className="dashboard-chart-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1e293b' }}>Revenue Performance</h3>
                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Daily trend comparison across the network</p>
                        </div>
                        <div className="pf-filter-group">
                            <button
                                className={`pf-filter-btn ${timeRange === '7' ? 'active' : ''}`}
                                onClick={() => setTimeRange('7')}
                                style={{ padding: '0.5rem 1.5rem', fontSize: '0.75rem' }}
                            >7 Days</button>
                            <button
                                className={`pf-filter-btn ${timeRange === '30' ? 'active' : ''}`}
                                onClick={() => setTimeRange('30')}
                                style={{ padding: '0.5rem 1.5rem', fontSize: '0.75rem' }}
                            >30 Days</button>
                        </div>
                    </div>

                    <div style={{ height: '320px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                            <defs>
                                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="var(--pharmacy-primary)" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="var(--pharmacy-primary)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M0,80 Q40,40 80,60 T160,30 T240,70 T320,40 T400,10 L400,100 L0,100 Z" fill="url(#chartGradient)" />
                            <path d="M0,80 Q40,40 80,60 T160,30 T240,70 T320,40 T400,10" fill="none" stroke="var(--pharmacy-primary)" strokeLinecap="round" strokeWidth="2.5" />
                        </svg>
                        
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', position: 'absolute', bottom: 0, left: 0, padding: '1rem 0', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            {labels.map((l, i) => (
                                <span key={i} style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>{l.toUpperCase()}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Stock Items - Aligned with Repo Functional Section */}
                <div className="dashboard-alert-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--pharmacy-primary)', fontSize: '1.5rem', margin: 'auto' }}>history</span>
                        </div>
                        <div>
                            <h3 style={{ fontWeight: '900', color: '#1e293b' }}>Recent Stock Updates</h3>
                            <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory History</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(stats?.recent_stock || [
                            { medicine_name: 'Amoxicillin 500mg', quantity: 150 },
                            { medicine_name: 'Paracetamol 650', quantity: 450 },
                            { medicine_name: 'Cough Syrup (Vicks)', quantity: 42 },
                            { medicine_name: 'Dolo 650', quantity: 900 },
                            { medicine_name: 'BP Monitor Digital', quantity: 12 },
                        ]).slice(0, 5).map((item, i) => (
                            <div key={i} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', border: '1px solid #f1f5f9' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b', margin: '0' }}>{item.medicine_name}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', margin: '0' }}>Update sequence: #{1024 - i}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--pharmacy-primary)' }}>{item.quantity}</span>
                                    <span style={{ fontSize: '0.65rem', display: 'block', color: '#94a3b8', fontWeight: '800' }}>UNITS</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => navigate('/pharmacy/inventory')}
                        style={{ marginTop: '2rem', width: '100%', padding: '1rem', borderRadius: '14px', border: 'none', background: '#0f172a', color: 'white', fontSize: '0.875rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                    >Manage Full Inventory</button>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="pf-table-container pf-mt-2" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1e293b' }}>Recent Dispensed Orders</h3>
                    <button style={{ color: 'var(--pharmacy-primary)', fontSize: '0.875rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                        View History <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
                    </button>
                </div>
                
                <table className="pf-table">
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <th style={{ paddingBottom: '1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Order ID</th>
                            <th style={{ paddingBottom: '1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Customer Name</th>
                            <th style={{ paddingBottom: '1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Medications</th>
                            <th style={{ paddingBottom: '1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Status</th>
                            <th style={{ paddingBottom: '1.5rem', fontSize: '0.65rem', color: '#64748b', textAlign: 'right' }}>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                                <td style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.875rem' }}>{order.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(73, 165, 242, 0.1)', color: 'var(--pharmacy-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '900' }}>
                                            {order.customer.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>{order.customer}</span>
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.875rem', color: '#64748b' }}>{order.medicines}</td>
                                <td>{getStatusBadge(order.status)}</td>
                                <td style={{ fontWeight: '900', textAlign: 'right', fontSize: '0.875rem', color: '#1e293b' }}>₹{order.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Floating Action Button */}
            <button style={{ position: 'fixed', bottom: '3rem', right: '3rem', background: 'var(--pharmacy-primary)', color: 'white', padding: '1.5rem 2rem', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '1rem', border: 'none', boxShadow: '0 20px 40px rgba(73, 165, 242, 0.3)', cursor: 'pointer', transition: 'all 0.3s' }} className="group">
                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>add</span>
                <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>New Prescription</span>
            </button>
        </PharmacyLayout>
    )
}

export default Dashboard
