import { PageHero } from "@/components/page-hero";
import { blogPosts } from "@/content/site";

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="BLOG"
        title="OUR"
        accent="BLOG"
        lead="Insights and Updates from The Nest Church"
        image="/images/nest1.webp"
      />

      <section className="section section-light">
        <div className="container">
          <div className="section-center" style={{ marginBottom: "4rem" }}>
            <p className="section-label" style={{ color: "var(--gray-600)" }}>
              LATEST POSTS
            </p>
            <h2 className="section-title">
              INSIGHTS &
              <br />
              <span className="accent-red">UPDATES</span>
            </h2>
          </div>

          <div className="grid-3" style={{ marginBottom: "3rem" }}>
            {blogPosts.map((post) => (
              <article className="blog-card" key={post.slug}>
                <div className="blog-card-image">
                  <img alt={post.title} src={post.image} />
                </div>
                <div className="blog-card-body">
                  <div className="blog-date">{post.date}</div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 900, marginTop: 0 }}>{post.title}</h2>
                  <p className="section-copy">{post.excerpt}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                    <span className="event-meta">{post.author}</span>
                    <a className="accent-red" href="#">
                      READ MORE →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="pagination-row">
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
        </div>
      </section>
    </>
  );
}
