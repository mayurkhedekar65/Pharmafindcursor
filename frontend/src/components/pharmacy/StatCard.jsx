import { useEffect, useState } from 'react'
import '../../pharmacy.css'

function StatCard({ title, value, icon, type = 'primary', trend, trendLabel, badge, prefix }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        if (typeof value === 'number') {
            const duration = 1000
            const steps = 60
            const increment = value / steps
            let current = 0

            const timer = setInterval(() => {
                current += increment
                if (current >= value) {
                    setDisplayValue(value)
                    clearInterval(timer)
                } else {
                    setDisplayValue(Math.floor(current))
                }
            }, duration / steps)

            return () => clearInterval(timer)
        } else {
            setDisplayValue(value)
        }
    }, [value])

    const formatValue = (val) => {
        const pfx = prefix || ''
        if (typeof val === 'number') {
            if (val >= 1000000) return `${pfx}${(val / 1000000).toFixed(2)}M`
            if (val >= 1000) return `${pfx}${(val / 1000).toFixed(1)}K`
            return `${pfx}${typeof val === 'number' && val % 1 !== 0 ? val.toFixed(2) : val.toLocaleString()}`
        }
        return val
    }

    return (
        <div className="stat-card-premium count-up">
            <div className="stat-card-header">
                <div className="stat-card-title">{title}</div>
                <div className={`stat-card-icon ${type}`}>
                    {icon}
                </div>
            </div>

            {badge && (
                <div style={{ marginBottom: '0.5rem' }}>
                    <span className="stat-card-badge">{badge}</span>
                </div>
            )}

            <div className="stat-card-value">
                {formatValue(displayValue)}
            </div>

            {trend && (
                <div className="stat-card-footer">
                    <span className={`stat-card-trend ${trend > 0 ? 'up' : 'down'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                    <span>{trendLabel || 'vs last period'}</span>
                </div>
            )}
        </div>
    )
}

export default StatCard
