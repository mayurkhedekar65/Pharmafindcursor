import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import PharmacyLayout from '../../layout/PharmacyLayout'
import LoaderSkeleton from '../../components/pharmacy/LoaderSkeleton'
import '../../pharmacy.css'

function Analytics() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [analytics, setAnalytics] = useState(null)
    const [timeRange, setTimeRange] = useState('30') // 7, 30, 90 days
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchAnalytics()
    }, [user, timeRange])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            setError(null)

            // Mock data - replace with actual API call
            const mockAnalytics = {
                revenue: {
                    '7': [12000, 15000, 13500, 18000, 16500, 19000, 17500],
                    '30': Array.from({ length: 30 }, (_, i) => 10000 + Math.random() * 10000),
                    '90': Array.from({ length: 90 }, (_, i) => 10000 + Math.random() * 10000)
                },
                profit: {
                    '7': [3000, 4500, 4000, 5500, 5000, 6000, 5500],
                    '30': Array.from({ length: 30 }, (_, i) => 2000 + Math.random() * 5000),
                    '90': Array.from({ length: 90 }, (_, i) => 2000 + Math.random() * 5000)
                },
                topSellingMedicines: [
                    { name: 'Paracetamol 500mg', units: 450, revenue: 24750 },
                    { name: 'Amoxicillin 250mg', units: 320, revenue: 38400 },
                    { name: 'Vitamin D3', units: 280, revenue: 70000 },
                    { name: 'Ibuprofen 400mg', units: 250, revenue: 21250 },
                    { name: 'Cetirizine 10mg', units: 220, revenue: 6600 }
                ],
                monthlyComparison: {
                    currentMonth: {
                        revenue: 485000,
                        profit: 145000,
                        orders: 342,
                        customers: 256
                    },
                    lastMonth: {
                        revenue: 425000,
                        profit: 128000,
                        orders: 298,
                        customers: 234
                    }
                }
            }

            setAnalytics(mockAnalytics)
        } catch (err) {
            console.error('Error fetching analytics:', err)
            setError('Failed to load analytics data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const calculateGrowth = (current, previous) => {
        if (previous === 0) return 0
        return (((current - previous) / previous) * 100).toFixed(1)
    }

    const renderChart = (data, color, label) => {
        const maxValue = Math.max(...data)
        const minValue = Math.min(...data)
        const range = maxValue - minValue

        return (
            <div style={{ marginTop: '1.5rem' }}>
                <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--pharmacy-text-light)',
                    marginBottom: '1rem'
                }}>
                    {label}
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: timeRange === '7' ? '1rem' : timeRange === '30' ? '0.3rem' : '0.1rem',
                    height: '200px'
                }}>
                    {data.map((value, index) => {
                        const height = range > 0 ? ((value - minValue) / range) * 100 : 50
                        return (
                            <div
                                key={index}
                                style={{
                                    flex: 1,
                                    height: `${height}%`,
                                    background: `linear-gradient(180deg, ${color}, ${color}dd)`,
                                    borderRadius: '6px 6px 0 0',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    minHeight: '10px'
                                }}
                                title={`₹${value.toLocaleString()}`}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '0.7'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = '1'
                                }}
                            />
                        )
                    })}
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0.75rem',
                    fontSize: '0.85rem',
                    color: 'var(--pharmacy-text-light)'
                }}>
                    <span>Min: ₹{minValue.toLocaleString()}</span>
                    <span>Max: ₹{maxValue.toLocaleString()}</span>
                    <span>Avg: ₹{(data.reduce((a, b) => a + b, 0) / data.length).toLocaleString()}</span>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <PharmacyLayout title="Analytics">
                <LoaderSkeleton count={2} type="card" />
            </PharmacyLayout>
        )
    }

    if (error) {
        return (
            <PharmacyLayout title="Analytics">
                <div className="error-text">{error}</div>
            </PharmacyLayout>
        )
    }

    const revenueGrowth = calculateGrowth(
        analytics.monthlyComparison.currentMonth.revenue,
        analytics.monthlyComparison.lastMonth.revenue
    )
    const profitGrowth = calculateGrowth(
        analytics.monthlyComparison.currentMonth.profit,
        analytics.monthlyComparison.lastMonth.profit
    )
    const ordersGrowth = calculateGrowth(
        analytics.monthlyComparison.currentMonth.orders,
        analytics.monthlyComparison.lastMonth.orders
    )

    return (
        <PharmacyLayout title="Pharmacy Analytics" subtitle="Real-time performance intelligence and pharmaceutical market trends.">
            {/* Header & Controls */}
            <div className="pf-flex-between pf-mb-2">
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>Performance Overview</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Comparative analysis for the selected time cycle.</p>
                </div>
                <div className="pf-filter-group" style={{ padding: '4px', background: '#f1f5f9', borderRadius: '12px' }}>
                    <button className={`pf-filter-btn ${timeRange === '7' ? 'active' : ''}`} onClick={() => setTimeRange('7')} style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>7D</button>
                    <button className={`pf-filter-btn ${timeRange === '30' ? 'active' : ''}`} onClick={() => setTimeRange('30')} style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>30D</button>
                    <button className={`pf-filter-btn ${timeRange === '90' ? 'active' : ''}`} onClick={() => setTimeRange('90')} style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>90D</button>
                </div>
            </div>

            {/* Bento Growth Matrix */}
            <div className="dashboard-grid pf-mb-2">
                <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '2rem', borderRadius: '24px', display: 'flex', gap: '3rem', position: 'relative', overflow: 'hidden' }} className="group">
                    <div style={{ flex: '1', zIndex: '1' }}>
                        <p style={{ color: 'var(--pharmacy-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', marginBottom: '1rem' }}>Revenue Intelligence</p>
                        <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>₹{analytics.monthlyComparison.currentMonth.revenue.toLocaleString()}</h3>
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: revenueGrowth >= 0 ? '#27ae60' : '#ef4444', fontWeight: '800' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>{revenueGrowth >= 0 ? 'trending_up' : 'trending_down'}</span>
                            <span>{revenueGrowth > 0 ? '+' : ''}{revenueGrowth}% vs last month</span>
                        </div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(0,0,0,0.05)' }}></div>
                    <div style={{ flex: '1', zIndex: '1' }}>
                        <p style={{ color: '#006d37', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', marginBottom: '1rem' }}>Net Profit Margin</p>
                        <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>₹{analytics.monthlyComparison.currentMonth.profit.toLocaleString()}</h3>
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: profitGrowth >= 0 ? '#27ae60' : '#ef4444', fontWeight: '800' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>{profitGrowth >= 0 ? 'trending_up' : 'trending_down'}</span>
                            <span>{profitGrowth > 0 ? '+' : ''}{profitGrowth}% vs last month</span>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'var(--pharmacy-primary)', color: '#fff', padding: '2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-2rem', bottom: '-2rem', opacity: '0.1' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '10rem' }}>monitoring</span>
                    </div>
                    <p style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>Efficiency Rating</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '900' }}>{((analytics.monthlyComparison.currentMonth.profit / analytics.monthlyComparison.currentMonth.revenue) * 100).toFixed(1)}%</h3>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
                        <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></div>
                        <span>High Operating Leverage</span>
                    </div>
                </div>
            </div>

            {/* Trend Graphs */}
            <div className="dashboard-grid pf-mb-2">
                <div style={{ gridColumn: 'span 2', background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--pharmacy-primary)' }}>show_chart</span>
                            Revenue Trendline
                        </h3>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>Avg. Daily: ₹{(analytics.revenue[timeRange].reduce((a,b)=>a+b,0)/analytics.revenue[timeRange].length).toFixed(0)}</span>
                    </div>
                    {renderChart(analytics.revenue[timeRange], 'var(--pharmacy-primary)', `Data visualization for the last ${timeRange} sessions.`)}
                </div>
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="material-symbols-outlined" style={{ color: '#27ae60' }}>bar_chart</span>
                        Profit Margin
                    </h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textAlign: 'center', padding: '1rem' }}>Margin visualization currently optimizing based on SKU-level cost data.</p>
                    </div>
                </div>
            </div>

            {/* Market Excellence Table */}
            <div className="pf-table-container">
                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#1e293b' }}>🏆 Top Performing Inventory</h3>
                </div>
                <table className="pf-table">
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ padding: '1.5rem 2rem', fontSize: '0.65rem', color: '#64748b' }}>Market Rank</th>
                            <th style={{ padding: '1.5rem 1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Pharmaceutical / Molecule</th>
                            <th style={{ padding: '1.5rem 1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Volume Metrics</th>
                            <th style={{ padding: '1.5rem 1.5rem', fontSize: '0.65rem', color: '#64748b' }}>Revenue Yield</th>
                            <th style={{ padding: '1.5rem 2rem', fontSize: '0.65rem', color: '#64748b' }}>Performance Index</th>
                        </tr>
                    </thead>
                    <tbody style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        {analytics.topSellingMedicines.map((medicine, index) => {
                            const maxRevenue = analytics.topSellingMedicines[0].revenue
                            const percentage = (medicine.revenue / maxRevenue) * 100
                            return (
                                <tr key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }} className="group">
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ 
                                            width: '32px', height: '32px', borderRadius: '10px', 
                                            background: index === 0 ? 'linear-gradient(135deg, #ffd700, #b8860b)' : index === 1 ? '#e2e8f0' : index === 2 ? '#ffedd5' : '#f8fafc',
                                            color: index === 0 ? '#fff' : '#475569',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.75rem'
                                        }}>
                                            #{index + 1}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.875rem' }}>{medicine.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Active Pharmaceutical Ingredient</div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '4px 12px', background: 'rgba(73, 165, 242, 0.1)', color: 'var(--pharmacy-primary)', borderRadius: '100px' }}>
                                            {medicine.units} units sold
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: '900', color: '#1e293b' }}>₹{medicine.revenue.toLocaleString()}</td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: '1', height: '6px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
                                                <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--pharmacy-primary)', borderRadius: '100px' }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', minWidth: '35px' }}>{percentage.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </PharmacyLayout>
    )
}

export default Analytics
