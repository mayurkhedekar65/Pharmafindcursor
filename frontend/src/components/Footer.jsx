function Footer() {
  return (
    <footer className="pf-global-footer full-bleed">
      <div className="content-wrapper">
        <div className="pf-footer-top">
          <div className="pf-footer-brand">
            <span className="pf-footer-logo">PharmaFind</span>
            <p>Bringing Goa's pharmacy network to your fingertips.</p>
          </div>
          <div className="pf-footer-links">
            <div className="pf-footer-col">
              <h5>Company</h5>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Press</a>
            </div>
            <div className="pf-footer-col">
              <h5>Support</h5>
              <a href="#">Help Center</a>
              <a href="#">Safety Center</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
        <div className="pf-footer-bottom">
          <p>© {new Date().getFullYear()} PharmaFind. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
