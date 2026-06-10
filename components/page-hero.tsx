type PageHeroProps = {
  eyebrow: string;
  title: string;
  accent?: string;
  lead: string;
  image: string;
  accentClassName?: "accent-red" | "accent-gold";
};

export function PageHero({
  eyebrow,
  title,
  accent,
  lead,
  image,
  accentClassName = "accent-red",
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <img className="page-hero-media" alt="" src={image} />
      <div className="page-hero-shade" />
      <div className="container page-hero-content">
        <span className="pill">{eyebrow}</span>
        <h1 className="page-title">
          {title}
          {accent ? (
            <>
              <br />
              <span className={accentClassName}>{accent}</span>
            </>
          ) : null}
        </h1>
        <p className="page-copy">{lead}</p>
      </div>
    </section>
  );
}
