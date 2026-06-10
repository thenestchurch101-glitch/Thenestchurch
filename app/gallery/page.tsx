import { galleryItems } from "@/content/site";

export default function GalleryPage() {
  return (
    <section className="section section-dark" style={{ minHeight: "100vh", paddingTop: "8rem" }}>
      <div className="container">
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, marginBottom: "2rem" }}>
          Event Galleries
        </h1>
        <div className="grid-3">
          {galleryItems.map((item) => (
            <a className="gallery-card" href="#" key={item.title}>
              <img alt={item.title} src={item.image} />
              <div className="gallery-card-body">
                <h2 style={{ marginTop: 0 }}>{item.title}</h2>
                <p style={{ color: "rgba(255,255,255,0.7)" }}>{item.imageCount}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
