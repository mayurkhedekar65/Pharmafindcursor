function Footer() {
  return (
    <footer className="app-footer">
      <div className="content-wrapper footer-inner">
        <div className="footer-brand">
          <span className="footer-title">PharmaFind</span>
          <span className="footer-subtitle">
            College mini-project • Demo data only • No real purchases
          </span>
        </div>
        <div className="footer-meta">© {new Date().getFullYear()} PharmaFind</div>
      </div>
    </footer>
  )
}

export default Footer

