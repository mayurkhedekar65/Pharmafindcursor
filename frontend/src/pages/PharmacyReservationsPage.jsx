import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getPharmacyStats } from '../services/apiClient'
import ProtectedRoute from '../components/ProtectedRoute'
import axios from 'axios'

function PharmacyReservationsPage() {
    const { user } = useAuth()
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (user?.pharmacy_id) {
            loadReservations()
        }
    }, [user?.pharmacy_id])

    const loadReservations = async () => {
        setLoading(true)
        try {
            // Use the dashboard stats which returns recent reservations, 
            // but in a real app you'd have a specific endpoint for all reservations
            const data = await getPharmacyStats(user.pharmacy_id)
            setReservations(data.recent_reservations || [])
        } catch (err) {
            setError('Failed to load reservations.')
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id, newStatus) => {
        try {
            // Direct call to update status (this would be in apiClient in a real app)
            await axios.put(`http://localhost:8000/api/pharmacies/reservations/${id}/status/`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('pharmafind_token')}` }
            })
            loadReservations()
        } catch (err) {
            alert('Failed to update status.')
        }
    }

    return (
        <ProtectedRoute requirePharmacy>
            <div className="page-container">
                <div className="card">
                    <h2 className="pf-hero-title">Manage Reservations</h2>
                    <p className="card-description">Track and fulfill medicine pickup/delivery requests</p>

                    {loading ? (
                        <p>Loading reservations...</p>
                    ) : reservations.length === 0 ? (
                        <div className="info-card">No reservations found yet.</div>
                    ) : (
                        <div className="table-responsive" style={{ marginTop: '2rem' }}>
                            <table className="pf-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Medicine</th>
                                        <th>Quantity</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map(res => (
                                        <tr key={res.id}>
                                            <td>#{res.id}</td>
                                            <td style={{ fontWeight: '600' }}>{res.medicine_name}</td>
                                            <td>{res.quantity}</td>
                                            <td style={{ textTransform: 'capitalize' }}>{res.mode}</td>
                                            <td>
                                                <span className={`status-badge ${res.status}`}>
                                                    {res.status}
                                                </span>
                                            </td>
                                            <td>{new Date(res.timestamp).toLocaleDateString()}</td>
                                            <td>
                                                {res.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => updateStatus(res.id, 'completed')}
                                                            className="success-button"
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                        >
                                                            Complete
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(res.id, 'cancelled')}
                                                            className="danger-button"
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}

export default PharmacyReservationsPage
