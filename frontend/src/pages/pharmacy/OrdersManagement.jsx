import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getPharmacyOrders, updateReservationStatus } from '../../services/apiClient'
import PharmacyLayout from '../../layout/PharmacyLayout'
import LoaderSkeleton from '../../components/pharmacy/LoaderSkeleton'
import EmptyState from '../../components/pharmacy/EmptyState'
import '../../pharmacy.css'

function OrdersManagement() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [filterStatus, setFilterStatus] = useState('all')
    const [error, setError] = useState(null)

    useEffect(() => {
        if (user?.pharmacy_id) {
            fetchOrders()
        }
    }, [user])

    useEffect(() => {
        filterOrders()
    }, [orders, filterStatus])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getPharmacyOrders(user.pharmacy_id)
            setOrders(data)
        } catch (err) {
            console.error('Error fetching orders:', err)
            setError('Failed to load orders. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const filterOrders = () => {
        let filtered = [...orders]
        if (filterStatus !== 'all') {
            filtered = filtered.filter(order => order.status === filterStatus)
        }
        setFilteredOrders(filtered)
    }

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await updateReservationStatus(orderId, newStatus)
            
            // Update local state
            setOrders(prev => prev.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ))

            // Show success toast
            const successMsg = document.createElement('div')
            successMsg.textContent = `✅ Order marked as ${newStatus}!`
            successMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, var(--pharmacy-success, #27ae60), #2ecc71);
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
            console.error('Error updating status:', err)
            alert('❌ Failed to update order status. Please try again.')
        }
    }

    if (loading) {
        return (
            <PharmacyLayout title="Orders Management">
                <LoaderSkeleton count={1} type="table" />
            </PharmacyLayout>
        )
    }

    if (error) {
        return (
            <PharmacyLayout title="Orders Management">
                <div className="error-card pf-p-2 pf-center">
                    <p>{error}</p>
                    <button onClick={fetchOrders} className="primary-button pf-mt-md">Try Again</button>
                </div>
            </PharmacyLayout>
        )
    }

    return (
        <PharmacyLayout title="Customer Orders" subtitle="Track and manage your pharmacy reservations.">
            <div className="pf-table-container">
                <div className="pf-table-header pf-flex pf-between pf-align-center pf-p-2">
                    <div className="pf-filter-group">
                        <button className={`pf-filter-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All Orders</button>
                        <button className={`pf-filter-btn ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>Pending ({orders.filter(o => o.status === 'pending').length})</button>
                        <button className={`pf-filter-btn ${filterStatus === 'completed' ? 'active' : ''}`} onClick={() => setFilterStatus('completed')}>Completed</button>
                    </div>
                    <span className="pf-text-small pf-text-secondary">
                         {filteredOrders.length} orders found
                    </span>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="pf-p-3 pf-center">
                        <EmptyState title="No orders found" description="There are no reservations matching your current filter." />
                    </div>
                ) : (
                    <table className="pf-table">
                        <thead>
                            <tr>
                                <th>Order Ref</th>
                                <th>Medication</th>
                                <th>User</th>
                                <th>Mode</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>
                                        <div className="pf-flex pf-column">
                                            <span className="pf-weight-800">#{order.id}</span>
                                            <span className="pf-text-xs pf-text-secondary">{new Date(order.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="pf-flex pf-column">
                                            <span className="pf-weight-700">{order.medicine_name}</span>
                                            <span className="pf-text-xs">Qty: {order.quantity}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="pf-flex pf-align-center pf-gap-xs">
                                            <div className="pf-avatar-xs">
                                                {(order.customer_name || order.user_identifier || 'U')[0]?.toUpperCase()}
                                            </div>
                                            <span className="pf-text-sm">
                                                {order.customer_name || order.user_identifier || 'Store User'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`pf-badge ${order.mode}`}>
                                             {order.mode === 'delivery' ? 'Delivery' : 'Pickup'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`pf-status-dot ${order.status}`}></span>
                                        <span className="pf-text-sm capitalize">{order.status}</span>
                                    </td>
                                    <td>
                                        {order.status === 'pending' && (
                                            <div className="pf-flex pf-gap-xs">
                                                <button 
                                                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                    className="pf-btn pf-btn-success pf-btn-sm"
                                                >
                                                    Complete
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                    className="pf-btn pf-btn-danger pf-btn-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                        {order.status !== 'pending' && (
                                             <span className="pf-text-xs pf-text-secondary italic">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
                .pf-avatar-xs {
                    width: 24px;
                    height: 24px;
                    background: #e2e8f0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    font-weight: 800;
                }
                .pf-badge.delivery { color: var(--primary-color); background: var(--primary-light); }
                .pf-badge.pickup { color: #854d0e; background: #fef9c3; }
                .pf-status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 6px;
                }
                .pf-status-dot.pending { background: #eab308; }
                .pf-status-dot.completed { background: #22c55e; }
                .pf-status-dot.cancelled { background: #ef4444; }
                .pf-btn-sm {
                    padding: 4px 10px;
                    font-size: 0.75rem;
                    border-radius: 6px;
                    cursor: pointer;
                    border: none;
                }
                .pf-btn-success { background: #22c55e; color: white; }
                .pf-btn-danger { background: #ef4444; color: white; }
                .capitalize { text-transform: capitalize; }
                .text-right { text-align: right; }
            `}</style>
        </PharmacyLayout>
    )
}

export default OrdersManagement
