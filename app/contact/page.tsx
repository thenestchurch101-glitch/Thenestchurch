import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { site } from "@/content/site";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="GET IN TOUCH"
        title="CONTACT"
        accent="US"
        lead="We'd love to hear from you! Reach out with questions, prayer requests, or to connect."
        image="/images/nest1.webp"
      />

      <section className="section section-light">
        <div className="container contact-grid">
          <div className="contact-form-panel">
            <div className="section-line" />
            <div className="section-label accent-red">SEND MESSAGE</div>
            <h2 className="section-title">GET IN TOUCH</h2>
            <ContactForm />
          </div>

          <div className="contact-panel">
            <div className="section-line" />
            <div className="section-label accent-red">VISIT US</div>
            <h2 className="section-title">FIND US HERE</h2>
            <div className="contact-list">
              <div className="contact-item">
                <div className="contact-icon">⌖</div>
                <div>
                  <h3>ADDRESS</h3>
                  <p className="text-white-muted">
                    {site.address[0]}
                    <br />
                    {site.address[1]}
                    <br />
                    {site.address[2]}
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">☎</div>
                <div>
                  <h3>PHONE</h3>
                  <p className="text-white-muted">{site.phone}</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">✉</div>
                <div>
                  <h3>EMAIL</h3>
                  <p className="text-white-muted">{site.email}</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">⏰</div>
                <div>
                  <h3>SERVICE TIME</h3>
                  <p className="text-white-muted">Sunday: 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-dark section-center">
        <div className="container">
          <span className="pill">LOCATION</span>
          <h2 className="section-title">
            FIND US ON
            <br />
            <span className="accent-red">THE MAP</span>
          </h2>
          <div className="map-shell">
            <div className="map-placeholder">Interactive Map Coming Soon</div>
          </div>
        </div>
      </section>
    </>
  );
}
