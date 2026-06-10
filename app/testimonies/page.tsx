import { testimonyItems } from "@/content/site";

export default function TestimoniesPage() {
  return (
    <>
      <section className="hero">
        <img className="hero-media" alt="" src="/images/nest1.webp" />
        <div className="hero-shade" />
        <div className="container hero-content">
          <span className="pill">STORIES</span>
          <h1 className="hero-title">
            GOD'S GIVEN
            <br />
            <span className="accent-red">EXPERIENCE</span>
          </h1>
          <p className="page-copy">
            Inspiring testimonies of God's faithfulness in our church community
          </p>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <div className="section-center" style={{ marginBottom: "4rem" }}>
            <p className="section-label" style={{ color: "var(--gray-600)" }}>
              TESTIMONIES
            </p>
            <h2 className="section-title">
              STORIES OF
              <br />
              <span className="accent-red">FAITH</span>
            </h2>
          </div>

          <div className="grid-3" style={{ marginBottom: "3rem" }}>
            {testimonyItems.map((testimony) => (
              <article className="testimony-card" key={testimony.title}>
                <div className="quote-mark">“</div>
                <p className="section-copy" style={{ fontStyle: "italic", marginBottom: "1.5rem" }}>
                  {testimony.body}
                </p>
                <div className="author-row">
                  {testimony.image ? (
                    <img alt={testimony.author} className="author-avatar" src={testimony.image} />
                  ) : (
                    <div className="author-avatar-placeholder">{testimony.author[0]}</div>
                  )}
                  <div>
                    <p style={{ margin: 0, fontWeight: 900 }}>{testimony.author}</p>
                    <p className="event-meta" style={{ margin: 0 }}>
                      Member since {testimony.memberSince}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="pagination-row" style={{ marginBottom: "3rem" }}>
            <a className="btn-dark" href="#">
              ← PREVIOUS
            </a>
            <div className="pagination-pills">
              <span className="pagination-pill-active">1</span>
              <a className="pagination-pill" href="#">
                2
              </a>
              <a className="pagination-pill" href="#">
                3
              </a>
            </div>
            <a className="btn-dark" href="#">
              NEXT →
            </a>
          </div>

          <div className="section-center">
            <a className="btn-primary" href="#">
              SHARE YOUR TESTIMONY
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
