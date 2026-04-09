import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getPrescriptions, uploadPrescription } from '../services/apiClient'
import ProtectedRoute from '../components/ProtectedRoute'

function PharmacyPrescriptionPage() {
    const { user } = useAuth()
    const [prescriptions, setPrescriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [uploading, setUploading] = useState(false)

    const [formData, setFormData] = useState({
        patientName: '',
        patientPhone: '',
        file: null
    })

    useEffect(() => {
        if (user?.pharmacy_id) {
            loadPrescriptions()
        }
    }, [user?.pharmacy_id])

    const loadPrescriptions = async () => {
        try {
            const data = await getPrescriptions(user.pharmacy_id)
            setPrescriptions(data)
        } catch (err) {
            setError('Failed to load prescriptions.')
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] })
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!formData.file || !formData.patientName) {
            setError('Patient name and prescription file are required.')
            return
        }

        setUploading(true)
        setError('')
        setSuccess('')

        const uploadData = new FormData()
        uploadData.append('patient_name', formData.patientName)
        uploadData.append('patient_phone', formData.patientPhone)
        uploadData.append('image', formData.file)

        try {
            await uploadPrescription(user.pharmacy_id, uploadData)
            setSuccess('Prescription stored successfully!')
            setFormData({ patientName: '', patientPhone: '', file: null })
            loadPrescriptions()
        } catch (err) {
            setError('Failed to upload prescription.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <ProtectedRoute requirePharmacy>
            <div className="page-container">
                <section className="card">
                    <div className="card-header-row">
                        <div>
                            <h2 className="pf-hero-title" style={{ fontSize: '1.8rem' }}>Prescription Vault</h2>
                            <p className="card-description">Secure digital storage for patient prescriptions</p>
                        </div>
                    </div>

                    <form className="form" onSubmit={handleUpload} style={{
                        background: '#f8f9fa',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Upload New Prescription</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Patient Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.patientName}
                                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                    placeholder="Full name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.patientPhone}
                                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                                    placeholder="e.g. 9876543210"
                                />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label>Prescription Image *</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'block', marginTop: '0.5rem' }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="primary-button"
                            disabled={uploading}
                            style={{ marginTop: '1rem' }}
                        >
                            {uploading ? 'Storing...' : 'Archive Prescription'}
                        </button>
                        {error && <p className="error-text">{error}</p>}
                        {success && <p className="success-text">{success}</p>}
                    </form>

                    {loading ? (
                        <div className="loading-spinner"></div>
                    ) : prescriptions.length === 0 ? (
                        <p className="info-text">No prescriptions archived yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {prescriptions.map(p => (
                                <div key={p.id} className="stat-card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ fontWeight: '600' }}>{p.patient_name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{p.patient_phone || 'No phone'}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>Uploaded: {new Date(p.uploaded_at).toLocaleDateString()}</div>
                                    {p.image && (
                                        <a href={p.image} target="_blank" rel="noreferrer" style={{
                                            display: 'inline-block',
                                            marginTop: '0.5rem',
                                            color: 'var(--primary-color)',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            textDecoration: 'none'
                                        }}>
                                            View Document ↗
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </ProtectedRoute>
    )
}

export default PharmacyPrescriptionPage
