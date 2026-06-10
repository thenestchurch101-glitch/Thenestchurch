import Link from "next/link";
import { upcomingEvents } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <img className="hero-media" alt="" src="/images/nest1.webp" />
        <div className="hero-shade" />
        <div className="container hero-content">
          <span className="pill">OUR VISION</span>
          <h1 className="hero-title">
            THE NEST CHURCH
            <br />
            A HOME OF
            <br />
            <span className="accent-red">SOLACE</span>
          </h1>
          <div className="hero-actions">
            <Link className="btn-secondary" href="/live">
              WATCH LIVE
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-light section-center">
        <div className="container">
          <h2 className="section-title">WELCOME HOME!</h2>
          <p className="section-copy" style={{ marginBottom: "0.25rem" }}>
            Dive into our teachings, events and community.
          </p>
          <p className="section-copy">Your journey of faith begins here.</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid-3">
          <Link className="quick-card" href="/about">
            <img alt="About Us" src="/images/nest_member.webp" />
            <div className="quick-card-content">
              <p>WHO WE ARE</p>
              <h3>About us</h3>
              <span>LEARN MORE →</span>
            </div>
          </Link>

          <Link className="quick-card" href="/contact">
            <img alt="Connect" src="/images/nest1.webp" />
            <div className="quick-card-content">
              <p>JOIN OUR COMMUNITY</p>
              <h3>Connect with us</h3>
              <span>SIGN UP →</span>
            </div>
          </Link>

          <Link className="quick-card red" href="/events">
            <img alt="Celebrations" src="/images/nest2.webp" />
            <div className="quick-card-content">
              <p>ENDLESS CELEBRATION</p>
              <h3>Celebrations</h3>
              <span>VIEW EVENTS →</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-center" style={{ marginBottom: "4rem" }}>
            <span className="pill">UPCOMING EVENTS</span>
            <h2 className="section-title">DON'T MISS OUT</h2>
          </div>

          <div className="grid-4">
            {upcomingEvents.map((event) => (
              <article className="event-card" key={event.title}>
                <div className="event-card-image">
                  <img alt={event.title} src={event.image} />
                  <div className="event-date-badge">{event.date}</div>
                </div>
                <div className="event-card-body">
                  <h3>{event.title}</h3>
                  <p className="event-meta">{event.description}</p>
                  <p className="event-meta">{event.location}</p>
                  <p className="event-meta">{event.time}</p>
                  <Link className="btn-dark" href="/events">
                    LEARN MORE
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="section-center" style={{ marginTop: "3rem" }}>
            <Link className="btn-outline" href="/events">
              VIEW ALL EVENTS
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container grid-2">
          <div className="feature-image">
            <img alt="Pastor John Okoi" src="/images/lead.jpg" />
          </div>
          <div>
            <div className="section-line" />
            <div className="section-label accent-red">GLOBAL</div>
            <h2 className="section-title">OUR LEAD PASTOR</h2>
            <p className="body-copy text-white-muted">
              Pastor John Okoi is the Prime Minister of The Nest Church, a dynamic
              and passionate leader with a strong call to raise and mentor young
              people into purpose. His ministry emphasizes spiritual growth,
              prayer, personal transformation, and the manifestation of God's
              power, inspiring many to deepen their walk with Christ and live
              impactful lives.
            </p>
            <p className="body-copy text-white-muted">
              PM John is a firm believer in the power of prayer, he continually
              challenges the next generation to build vibrant prayer lives. He is
              joyfully married to Pastor Miracle Okoi.
            </p>
            <Link className="btn-outline btn-outline-light" href="/about#leadership">
              READ MORE
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <div className="section-center" style={{ marginBottom: "4rem" }}>
            <p className="section-label" style={{ color: "var(--gray-600)" }}>
              MINISTRIES
            </p>
            <h2 className="section-title">
              THERE'S A PLACE
              <br />
              FOR <span className="accent-red">EVERYONE</span>
            </h2>
            <Link className="btn-outline" href="/about">
              SEE ALL MINISTRIES
            </Link>
          </div>

          <div className="grid-2" style={{ marginTop: "4rem" }}>
            <Link className="quick-card" href="/contact">
              <img alt="Counselling" src="/images/nest_member.webp" />
              <div className="quick-card-content">
                <h3>Counselling</h3>
                <p>Professional guidance and support</p>
              </div>
            </Link>

            <Link className="quick-card" href="/prayer">
              <img alt="Prayer Request" src="/images/nest1.webp" />
              <div className="quick-card-content">
                <h3>Prayer Request</h3>
                <p>Submit your prayer needs</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-dark section-center">
        <div className="container">
          <span className="pill">JOIN US</span>
          <h2 className="section-title">SUNDAY SERVICE</h2>
          <div className="schedule-panel">
            <div className="schedule-icon" style={{ width: "5rem", height: "5rem", margin: "0 auto 1.5rem" }}>
              ⏰
            </div>
            <p className="schedule-time">2:00 PM</p>
            <p className="body-copy text-white-muted" style={{ marginBottom: "2rem" }}>
              Every Sunday at Living Stone Hall, Ikotun
            </p>
            <Link className="btn-primary" href="/contact">
              GET DIRECTIONS
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-light section-center">
        <div className="container">
          <h2 className="section-title">
            READY TO TAKE YOUR
            <br />
            <span className="accent-red">NEXT STEP?</span>
          </h2>
          <p className="section-copy" style={{ maxWidth: "42rem", margin: "0 auto 3rem" }}>
            Whether you're new to faith or looking to grow deeper, we're here to
            support your journey.
          </p>
          <div className="hero-actions">
            <Link className="btn-dark" href="/contact">
              VISIT US
            </Link>
            <Link className="btn-outline" href="/live">
              WATCH ONLINE
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
