import { PageHero } from "@/components/page-hero";
import { pastEvents, upcomingEvents } from "@/content/site";

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="EVENTS"
        title="CHURCH"
        accent="EVENTS"
        lead="Join us for fellowship, worship, and community gatherings that strengthen our faith together"
        image="/images/nest1.webp"
      />

      <section className="section section-light">
        <div className="container">
          <div className="section-center" style={{ marginBottom: "4rem" }}>
            <div className="section-line" style={{ margin: "0 auto 1rem" }} />
            <p className="section-label accent-red">UPCOMING</p>
            <h2 className="section-title">
              UPCOMING
              <br />
              <span className="accent-red">EVENTS</span>
            </h2>
            <p className="section-copy" style={{ maxWidth: "42rem", margin: "0 auto" }}>
              Don't miss these exciting opportunities to connect and grow
            </p>
          </div>

          <div className="grid-3">
            {upcomingEvents.map((event) => (
              <article className="event-card" key={event.title}>
                <div className="event-card-image">
                  <img alt={event.title} src={event.image} />
                </div>
                <div className="event-card-body">
                  <p className="blog-date">{event.date} • {event.time}</p>
                  <h3>{event.title}</h3>
                  <p className="section-copy">{event.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                    <span className="event-meta">{event.location}</span>
                    <a className="accent-red" href="#">
                      VIEW DETAILS
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <div className="section-center" style={{ marginBottom: "4rem" }}>
            <div className="section-line" style={{ margin: "0 auto 1rem" }} />
            <p className="section-label accent-red">CALENDAR</p>
            <h2 className="section-title">
              EVENT
              <br />
              <span className="accent-red">CALENDAR</span>
            </h2>
          </div>

          <div className="dark-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0 }}>QUICK CALENDAR</h3>
              <span className="accent-red" style={{ fontWeight: 700 }}>SHOW FULL CALENDAR</span>
            </div>
            <div className="grid-4" style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0.5rem", textAlign: "center" }}>
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                <div key={day} style={{ color: "var(--red-500)", fontWeight: 900, padding: "0.5rem 0" }}>
                  {day}
                </div>
              ))}
              {Array.from({ length: 31 }, (_, index) => (
                <div
                  key={index}
                  style={{
                    padding: "0.5rem 0.25rem",
                    borderRadius: "0.5rem",
                    background: index === 1 ? "var(--red-600)" : "transparent",
                    color: "#fff",
                  }}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <div className="section-center" style={{ marginBottom: "4rem" }}>
            <div className="section-line" style={{ margin: "0 auto 1rem" }} />
            <p className="section-label accent-red">MEMORIES</p>
            <h2 className="section-title">
              PAST
              <br />
              <span className="accent-red">EVENTS</span>
            </h2>
            <p className="section-copy" style={{ maxWidth: "42rem", margin: "0 auto" }}>
              Celebrating the memories we've made together
            </p>
          </div>

          <div className="grid-4">
            {pastEvents.map((event) => (
              <article className="event-card" key={event.title} style={{ opacity: 0.85 }}>
                <div className="event-card-image" style={{ height: "8rem" }}>
                  <img alt={event.title} src={event.image} />
                </div>
                <div className="event-card-body">
                  <p className="blog-date">{event.date}</p>
                  <h3 style={{ fontSize: "1rem" }}>{event.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
