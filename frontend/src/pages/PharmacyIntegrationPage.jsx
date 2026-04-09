import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getIntegrationSettings, updateIntegrationSettings, syncInventory } from '../services/apiClient'
import ProtectedRoute from '../components/ProtectedRoute'

function PharmacyIntegrationPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [settings, setSettings] = useState({
        system_type: 'custom',
        api_key: '',
        api_url: '',
        is_active: false,
        last_sync: null
    })
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (user?.pharmacy_id) {
            loadSettings()
        }
    }, [user?.pharmacy_id])

    const loadSettings = async () => {
        setLoading(true)
        try {
            const data = await getIntegrationSettings(user.pharmacy_id)
            setSettings(data)
        } catch (err) {
            console.error(err)
            setError('Failed to load integration settings.')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setMessage('')
        setError('')
        try {
            const data = await updateIntegrationSettings(user.pharmacy_id, settings)
            setSettings(data)
            setMessage('Settings updated successfully!')
        } catch (err) {
            setError('Failed to update settings.')
        }
    }

    const handleSync = async () => {
        if (!settings.is_active) {
            setError('Please activate integration before syncing.')
            return
        }
        setSyncing(true)
        setMessage('')
        setError('')
        try {
            const resp = await syncInventory(user.pharmacy_id)
            setMessage(resp.detail)
            loadSettings() // Refresh last sync time
        } catch (err) {
            setError(err.response?.data?.detail || 'Sync failed.')
        } finally {
            setSyncing(false)
        }
    }

    return (
        <ProtectedRoute requirePharmacy>
            <div className="page-container">
                <div className="card">
                    <h2 className="pf-hero-title" style={{ fontSize: '1.8rem' }}>External System Integration</h2>
                    <p className="card-description">
                        Connect your existing pharmacy management system or ERP to automatically sync your inventory levels.
                    </p>

                    {message && <p className="success-text" style={{ padding: '1rem', backgroundColor: '#eafaf1', borderRadius: '8px' }}>{message}</p>}
                    {error && <p className="error-text" style={{ padding: '1rem', backgroundColor: '#fdf2f2', borderRadius: '8px' }}>{error}</p>}

                    <form onSubmit={handleUpdate} style={{ marginTop: '2rem' }}>
                        <div className="form-group">
                            <label>External System Type</label>
                            <select
                                className="form-input"
                                value={settings.system_type}
                                onChange={(e) => setSettings({ ...settings, system_type: e.target.value })}
                            >
                                <option value="generic">Standard ERP (Local)</option>
                                <option value="multiloc">Cloud Multi-location System</option>
                                <option value="custom">Custom REST API</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>API Endpoint / System URL</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://api.your-system.com/v1"
                                value={settings.api_url}
                                onChange={(e) => setSettings({ ...settings, api_url: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>API Key / Authentication Token</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter your system API key"
                                value={settings.api_key}
                                onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                            />
                        </div>

                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={settings.is_active}
                                onChange={(e) => setSettings({ ...settings, is_active: e.target.checked })}
                            />
                            <label htmlFor="is_active" style={{ marginBottom: 0 }}>Enable Real-time Sync</label>
                        </div>

                        <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="primary-button">
                                Save Integration Settings
                            </button>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={handleSync}
                                disabled={syncing || !settings.is_active}
                                style={{ background: syncing ? '#ccc' : 'var(--secondary-color)' }}
                            >
                                {syncing ? 'Syncing...' : 'Sync Now'}
                            </button>
                        </div>
                    </form>

                    {settings.last_sync && (
                        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Last successful sync: {new Date(settings.last_sync).toLocaleString()}
                        </div>
                    )}
                </div>

                <div className="card" style={{ marginTop: '2rem', borderTop: '4px solid var(--primary-color)' }}>
                    <h3>How it works?</h3>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem', lineHeight: '1.6' }}>
                        <li>Enter your external system credentials provided by your IT department.</li>
                        <li>Once active, PharmaFind will fetch your latest stock levels every hour.</li>
                        <li>You can also manually trigger a sync using the "Sync Now" button above.</li>
                        <li>Integrations reduce manual data entry and ensure accurate availability for customers.</li>
                    </ul>
                </div>
            </div>
        </ProtectedRoute>
    )
}

export default PharmacyIntegrationPage
