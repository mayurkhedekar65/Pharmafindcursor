import '../../pharmacy.css'

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) {
    if (!isOpen) return null

    return (
        <div className="pf-modal-overlay" onClick={onClose}>
            <div className="pf-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <div className="pf-modal-header">
                    <h2 className="pf-modal-title">{title || 'Confirm Action'}</h2>
                    <button className="pf-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="pf-modal-body">
                    <p style={{ fontSize: '1rem', color: 'var(--pharmacy-text-light)', lineHeight: '1.6' }}>
                        {message || 'Are you sure you want to proceed with this action?'}
                    </p>
                </div>
                <div className="pf-modal-footer">
                    <button className="secondary-button" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button
                        className={type === 'danger' ? 'danger-button' : 'primary-button'}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
