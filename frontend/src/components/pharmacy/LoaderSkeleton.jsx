import '../../pharmacy.css'

function LoaderSkeleton({ count = 3, type = 'card' }) {
    const skeletons = Array.from({ length: count }, (_, i) => i)

    if (type === 'card') {
        return (
            <div className="pf-grid-4">
                {skeletons.map((i) => (
                    <div key={i} className="pf-skeleton pf-skeleton-card" />
                ))}
            </div>
        )
    }

    if (type === 'table') {
        return (
            <div className="pf-table-container">
                <div style={{ padding: '2rem' }}>
                    {skeletons.map((i) => (
                        <div key={i} className="pf-skeleton pf-skeleton-text" style={{ marginBottom: '1.5rem' }} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            {skeletons.map((i) => (
                <div key={i} className="pf-skeleton pf-skeleton-text" />
            ))}
        </div>
    )
}

export default LoaderSkeleton
