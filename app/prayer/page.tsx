export default function PrayerPage() {
  return (
    <>
      <section className="hero">
        <img className="hero-media" alt="" src="/images/nest1.webp" />
        <div className="hero-shade" />
        <div className="container hero-content">
          <span className="pill">PRAYER REQUEST</span>
          <h1 className="hero-title">
            SUBMIT PRAYER
            <br />
            <span className="accent-red">REQUEST</span>
          </h1>
          <p className="page-copy">
            Share your prayer needs with our community of believers. We believe in
            the power of prayer and are honored to intercede for you.
          </p>
        </div>
      </section>

      <section className="section section-light">
        <div className="container" style={{ maxWidth: "64rem" }}>
          <div className="contact-form-panel">
            <div className="section-line" />
            <div className="section-label accent-red">PRAYER FORM</div>
            <h2 className="section-title">SHARE YOUR REQUEST</h2>

            <div className="form-grid-2">
              <div className="field-group">
                <label htmlFor="prayer-title">PRAYER TITLE *</label>
                <input className="input" id="prayer-title" />
              </div>
              <div className="field-group">
                <label htmlFor="prayer-category">CATEGORY *</label>
                <select className="input" id="prayer-category" defaultValue="guidance">
                  <option value="guidance">Guidance & Direction</option>
                  <option value="healing">Physical & Mental Healing</option>
                  <option value="financial">Financial Breakthrough</option>
                  <option value="family">Family & Relationships</option>
                  <option value="spiritual">Spiritual Growth</option>
                  <option value="career">Career & Education</option>
                  <option value="other">Other Requests</option>
                </select>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="prayer-description">PRAYER DETAILS *</label>
              <textarea className="textarea" id="prayer-description" />
            </div>

            <div className="form-grid-3">
              <div className="field-group">
                <label htmlFor="prayer-name">YOUR NAME *</label>
                <input className="input" id="prayer-name" />
              </div>
              <div className="field-group">
                <label htmlFor="prayer-email">EMAIL ADDRESS</label>
                <input className="input" id="prayer-email" type="email" />
              </div>
              <div className="field-group">
                <label htmlFor="prayer-phone">PHONE NUMBER</label>
                <input className="input" id="prayer-phone" />
              </div>
            </div>

            <div className="checkbox-row" style={{ marginBottom: "2rem" }}>
              <div className="checkbox-item">
                <input id="anonymous" type="checkbox" />
                <label htmlFor="anonymous" style={{ margin: 0, fontWeight: 900 }}>
                  KEEP MY NAME ANONYMOUS
                </label>
              </div>
              <div className="checkbox-item">
                <input id="private" type="checkbox" />
                <label htmlFor="private" style={{ margin: 0, fontWeight: 900 }}>
                  KEEP THIS PRAYER REQUEST PRIVATE
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
              <button className="btn-primary" type="button">
                SUBMIT PRAYER REQUEST
              </button>
            </div>

            <div className="section-center">
              <p className="helper-text">
                Our prayer team will receive your request and pray for you with love and care
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-dark section-center">
        <div className="container">
          <span className="pill">PRAYER SUPPORT</span>
          <h2 className="section-title">
            WE BELIEVE IN THE
            <br />
            <span className="accent-red">POWER OF PRAYER</span>
          </h2>
          <p className="body-copy text-white-muted" style={{ maxWidth: "48rem", margin: "0 auto 3rem" }}>
            Our dedicated prayer team commits to lifting up every request with faith and love. You are not alone in your journey.
          </p>

          <div className="prayer-support-grid">
            <div className="support-card">
              <div className="support-icon">✝</div>
              <h3>CONFIDENTIAL</h3>
              <p className="text-white-muted">
                Your prayer requests are handled with complete confidentiality and respect.
              </p>
            </div>
            <div className="support-card">
              <div className="support-icon">👥</div>
              <h3>COMMUNITY</h3>
              <p className="text-white-muted">
                Join a community of believers who care and pray for one another.
              </p>
            </div>
            <div className="support-card">
              <div className="support-icon">♥</div>
              <h3>FAITHFUL</h3>
              <p className="text-white-muted">
                We commit to praying faithfully for every request we receive.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
