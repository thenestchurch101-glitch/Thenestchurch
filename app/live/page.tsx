import { livestreams } from "@/content/site";

export default function LivePage() {
  const [latest, ...previous] = livestreams;

  return (
    <>
      <section className="hero">
        <img className="hero-media" alt="" src="/images/nest1.webp" />
        <div className="hero-shade" />
        <div className="container hero-content">
          <span className="pill">WATCH LIVE</span>
          <h1 className="hero-title">
            WATCH
            <br />
            <span className="accent-red">LIVE</span>
          </h1>
          <p className="page-copy">
            Join us for live worship and experience God's presence wherever you are.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "#111827" }}>
        <div className="container">
          <div className="section-center" style={{ maxWidth: "48rem", margin: "0 auto 4rem" }}>
            <h2 className="section-title" style={{ color: "var(--gold-500)" }}>
              Watch Live
            </h2>
            <p className="page-copy" style={{ color: "var(--gold-500)" }}>
              Join us for live worship and experience God's presence wherever you are.
            </p>
          </div>

          <div style={{ marginBottom: "4rem" }}>
            <div className="video-frame">
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                src={latest.embedUrl}
                title={latest.title}
              />
            </div>
            <div className="section-center" style={{ marginTop: "1.5rem" }}>
              <h2 style={{ color: "var(--gold-500)" }}>{latest.title}</h2>
              <p style={{ color: "var(--gold-500)" }}>{latest.description}</p>
              {latest.isLive ? (
                <span className="pill" style={{ marginTop: "1rem" }}>
                  LIVE NOW
                </span>
              ) : null}
            </div>
          </div>

          <div style={{ marginBottom: "4rem" }}>
            <h2 className="section-title section-center" style={{ color: "var(--gold-500)", fontSize: "clamp(2rem,5vw,3rem)" }}>
              Previous Services
            </h2>
            <div className="grid-3">
              {previous.map((stream) => (
                <article className="dark-card" key={stream.title}>
                  <div className="video-frame">
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      src={stream.embedUrl}
                      title={stream.title}
                    />
                  </div>
                  <h3 style={{ color: "var(--gold-500)", marginTop: "1.5rem" }}>{stream.title}</h3>
                  <p style={{ color: "var(--gold-500)", fontSize: "0.875rem" }}>{stream.date}</p>
                  <p style={{ color: "var(--gold-500)" }}>{stream.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "4rem" }}>
            <div className="dark-card section-center">
              <h2 className="section-title" style={{ color: "var(--gold-500)", fontSize: "clamp(2rem,5vw,3rem)" }}>
                Support Our Ministry
              </h2>
              <p style={{ color: "var(--gold-500)", marginBottom: "1.5rem" }}>
                Your generous giving helps us continue spreading God's love and reaching more souls.
              </p>
              <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
                {["₦1,000", "₦5,000", "₦10,000"].map((amount) => (
                  <button
                    key={amount}
                    className="btn-secondary"
                    style={{ background: "var(--gold-500)", color: "#111827", borderRadius: "0.75rem" }}
                    type="button"
                  >
                    {amount}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
                <input
                  className="input"
                  placeholder="Enter custom amount"
                  style={{ maxWidth: "20rem", background: "#111827", color: "var(--gold-500)", borderColor: "var(--gold-500)" }}
                />
                <button className="btn-secondary" style={{ background: "var(--gold-500)", color: "#111827", borderRadius: "0.75rem" }} type="button">
                  Donate Now
                </button>
              </div>
            </div>
          </div>

          <div className="section-center">
            <h2 className="section-title" style={{ color: "var(--gold-500)", fontSize: "clamp(2rem,5vw,3rem)" }}>
              Join Us Live Every Week
            </h2>
            <div className="grid-3">
              <div className="dark-card">
                <h3 style={{ color: "var(--gold-500)" }}>Sunday Service</h3>
                <p style={{ color: "var(--gold-500)" }}>2:00 PM - 4:00 PM</p>
              </div>
              <div className="dark-card">
                <h3 style={{ color: "var(--gold-500)" }}>Counselling With PM</h3>
                <p style={{ color: "var(--gold-500)" }}>9:00 AM - 6:00 PM</p>
              </div>
              <div className="dark-card">
                <h3 style={{ color: "var(--gold-500)" }}>Powered Week Prayers</h3>
                <p style={{ color: "var(--gold-500)" }}>Monday 6:30 AM - 7:00 AM</p>
                <p style={{ color: "var(--gold-500)", fontSize: "0.875rem" }}>on all online platforms</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
