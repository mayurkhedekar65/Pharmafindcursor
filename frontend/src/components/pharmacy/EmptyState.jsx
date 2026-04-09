import '../../pharmacy.css'

function EmptyState({ icon, title, description, action }) {
    return (
        <div className="pf-empty-state">
            <div className="pf-empty-icon">{icon || '📦'}</div>
            <h3 className="pf-empty-title">{title || 'No Data Found'}</h3>
            <p className="pf-empty-description">
                {description || 'There are no items to display at the moment.'}
            </p>
            {action && <div>{action}</div>}
        </div>
    )
}

export default EmptyState
