import { PageHero } from "@/components/page-hero";

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="WHO WE ARE"
        title="ABOUT"
        accent="THE NEST CHURCH"
        accentClassName="accent-gold"
        lead="The Youth Expression of Truth of Calvary Ministries"
        image="/images/nest1.webp"
      />

      <section className="section section-light">
        <div className="container grid-2">
          <div>
            <div className="section-line" />
            <div className="section-label accent-gold">OUR VISION</div>
            <h2 className="section-title">
              DEVELOPING A HOME
              <br />
              OF <span className="accent-gold">SOLACE</span>
            </h2>
            <p className="body-copy">
              Developing a Home of Solace to enlist the prime into God's company
              where they can be bred for earthly relevance with secured eternity.
            </p>
          </div>

          <div className="feature-image">
            <img alt="Vision" src="/images/nest2.webp" />
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container grid-2">
          <div className="feature-image">
            <img alt="Mission" src="/images/nest9.webp" />
          </div>
          <div>
            <div className="section-line" />
            <div className="section-label accent-gold">OUR MISSION</div>
            <h2 className="section-title">
              RAISING A NEW BREED
              <br />
              OF <span className="accent-gold">KINGDOM AMBASSADORS</span>
            </h2>
            <p className="body-copy text-white-muted">
              Raising a new breed of Kingdom Ambassadors to show forth the glory
              of God in all spheres of life.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-dark" id="leadership">
        <div className="container">
          <div className="section-center" style={{ marginBottom: "4rem" }}>
            <p className="section-label accent-gold">LEADERSHIP</p>
            <h2 className="section-title">
              OUR
              <br />
              <span className="accent-gold">LEADERS</span>
            </h2>
          </div>

          <div className="grid-2" style={{ marginBottom: "5rem" }}>
            <div className="leader-image" style={{ height: "30rem" }}>
              <img alt="Pastor Olumide & Pastor Adenike Emmanuel" src="/images/pastor olumide.jpg" />
            </div>
            <div>
              <div className="section-line" />
              <div className="section-label accent-gold">OVERSEER</div>
              <h3 className="section-title" style={{ fontSize: "clamp(2.25rem,5vw,3.5rem)" }}>
                PASTOR OLUMIDE &
                <br />
                PASTOR ADENIKE EMMANUEL
              </h3>
              <p className="body-copy text-white-muted">
                Pastor Olumide and Pastor Adenike Emmanuel serve as the visionary
                Presidents of Truth of Calvary Ministries (TRUCALMS), a dynamic
                movement that oversees a thriving network of churches.
              </p>
              <p className="body-copy text-white-muted">
                Their influence transcends generations, industries, and continents
                through spiritual depth, practical wisdom, and visionary leadership.
              </p>
              <p className="body-copy text-white-muted">
                Their mission remains unwavering: to raise leaders, create wealth,
                and build a legacy that outlives them.
              </p>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: "5rem" }}>
            <div>
              <div className="section-line" />
              <div className="section-label accent-gold">PRIME MINISTER</div>
              <h3 className="section-title" style={{ fontSize: "clamp(2.25rem,5vw,3.5rem)" }}>
                PASTOR JOHN OKOI
              </h3>
              <p className="body-copy text-white-muted">
                Pastor John Okoi is the Prime Minister of The Nest Church, a
                dynamic and passionate leader with a strong call to raise and
                mentor young people into purpose.
              </p>
              <p className="body-copy text-white-muted">
                PM John is a firm believer in the power of prayer, he continually
                challenges the next generation to build vibrant prayer lives. He
                is joyfully married to Pastor Miracle Okoi.
              </p>
            </div>
            <div className="leader-image">
              <img alt="Pastor John Okoi" src="/images/lead.jpg" />
            </div>
          </div>

          <div className="grid-2">
            <div className="leader-image">
              <img alt="Pastor Miracle Okoi" src="/images/lead.jpg" />
            </div>
            <div>
              <div className="section-line" />
              <div className="section-label accent-gold">CO PRIME MINISTER</div>
              <h3 className="section-title" style={{ fontSize: "clamp(2.25rem,5vw,3.5rem)" }}>
                PASTOR MIRACLE OKOI
              </h3>
              <p className="body-copy text-white-muted">
                Miracle Okoi is the co Prime Minister of The Nest Church. She
                brings a unique blend of business prowess, organisational expertise,
                and a deep understanding of the ministry's vision.
              </p>
              <p className="body-copy text-white-muted">
                She heads the media team of The Nest, ensuring the smooth and
                effective running of the media ministry and contributing
                significantly to the overall effectiveness of the church.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <div className="section-center" style={{ marginBottom: "4rem" }}>
            <p className="section-label" style={{ color: "var(--gray-600)" }}>
              WHAT WE BELIEVE
            </p>
            <h2 className="section-title">
              OUR TENETS
              <br />
              OF <span className="accent-gold">FAITH</span>
            </h2>
          </div>

          <div className="grid-2">
            <article className="belief-card">
              <div className="belief-icon">✝</div>
              <h3>THE BIBLE</h3>
              <p className="section-copy">
                The Bible is the inspired Word of God, the product of holy men of
                old who spoke and wrote as they were moved by the Holy Spirit.
              </p>
            </article>

            <article className="belief-card">
              <div className="belief-icon">◉</div>
              <h3>THE TRINITY</h3>
              <p className="section-copy">
                The God-head is comprised of 3 separate and distinct personalities:
                the Father, the Son, and the Holy Spirit.
              </p>
            </article>

            <article className="belief-card">
              <div className="belief-icon">♥</div>
              <h3>MAN & REDEMPTION</h3>
              <p className="section-copy">
                Man was created good and upright. But man, by voluntary
                transgression, fell and his only hope of redemption is in Jesus
                Christ, the Son of God.
              </p>
            </article>

            <article className="belief-card">
              <div className="belief-icon">⚡</div>
              <h3>SALVATION</h3>
              <p className="section-copy">
                The blood of Jesus Christ, shed on the cross, provides the only
                way of salvation through the forgiveness of sin.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container grid-2">
          <div>
            <div className="section-line" />
            <div className="section-label accent-gold">SACRED PRACTICES</div>
            <h2 className="section-title">OUR SACRAMENTS</h2>
            <div style={{ display: "grid", gap: "2rem" }}>
              <div style={{ background: "var(--gray-900)", borderRadius: "1rem", padding: "1.5rem" }}>
                <h3>WATER BAPTISM</h3>
                <p className="body-copy text-white-muted">
                  We practice full-immersion baptism, symbolizing the process of
                  death and resurrection that Jesus went through for us.
                </p>
              </div>
              <div style={{ background: "var(--gray-900)", borderRadius: "1rem", padding: "1.5rem" }}>
                <h3>THE HOLY COMMUNION</h3>
                <p className="body-copy text-white-muted">
                  Communion (The Lord's Supper) is taken by believers in
                  remembrance of Christ's sacrifice on the cross.
                </p>
              </div>
              <div style={{ background: "var(--gray-900)", borderRadius: "1rem", padding: "1.5rem" }}>
                <h3>BAPTISM OF THE HOLY SPIRIT</h3>
                <p className="body-copy text-white-muted">
                  The Baptism of the Holy Spirit is a gift from God as promised by
                  the Lord Jesus Christ to all believers.
                </p>
              </div>
            </div>
          </div>

          <div className="feature-image">
            <img alt="Sacraments" src="/images/nest8.webp" />
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <div className="section-center" style={{ marginBottom: "4rem" }}>
            <p className="section-label" style={{ color: "var(--gray-600)" }}>
              CORE VALUES
            </p>
            <h2 className="section-title">
              WHAT WE
              <br />
              <span className="accent-gold">STAND FOR</span>
            </h2>
          </div>

          <div className="grid-3">
            <article className="value-card">
              <div className="value-icon">♥</div>
              <h3>SANCTIFICATION</h3>
              <p className="section-copy">
                We believe in Sanctification as a definite yet progressive work of grace.
              </p>
            </article>

            <article className="value-card">
              <div className="value-icon">⚡</div>
              <h3>HEALTH & PROSPERITY</h3>
              <p className="section-copy">
                We believe that, as part of Christ's work of Salvation, it is the
                Father's will for believers to become whole, healthy and successful
                in all areas of life.
              </p>
            </article>

            <article className="value-card">
              <div className="value-icon">👥</div>
              <h3>BIBLICAL MARRIAGE</h3>
              <p className="section-copy">
                We believe that God instituted monogamous marriage between male and
                female as the foundation of the family and basic structure of human
                society.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-dark section-center">
        <div className="container">
          <h2 className="section-title">
            READY TO
            <br />
            <span className="accent-gold">JOIN US?</span>
          </h2>
          <p className="body-copy text-white-muted" style={{ maxWidth: "42rem", margin: "0 auto 3rem" }}>
            Be a part of our vibrant community of believers and grow in your faith journey.
          </p>
          <div className="hero-actions">
            <a className="btn-primary" href="#">
              JOIN US
            </a>
            <a className="btn-outline btn-outline-light" href="/contact">
              CONTACT US
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
