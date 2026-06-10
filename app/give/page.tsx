import { PageHero } from "@/components/page-hero";

const givingTypes = [
  { name: "Tithe", copy: "Min: ₦0.00" },
  { name: "Offering", copy: "Min: ₦0.00" },
  { name: "Building Project", copy: "Min: ₦1,000.00" },
  { name: "Partnership", copy: "Min: ₦0.00" },
  { name: "Special Seed", copy: "Min: ₦0.00" },
  { name: "Benevolence", copy: "Min: ₦0.00" },
];

const presetAmounts = ["₦1,000", "₦2,000", "₦5,000", "₦10,000", "₦20,000", "₦50,000"];

export default function GivePage() {
  return (
    <>
      <PageHero
        eyebrow="GIVING"
        title="GIVE TO"
        accent="THE NEST"
        lead="Your generosity helps us continue our mission of developing young people for earthly relevance with secured eternity."
        image="/images/nest1.webp"
      />

      <section className="section section-light">
        <div className="container" style={{ maxWidth: "64rem" }}>
          <div className="contact-form-panel" style={{ borderRadius: "1rem", boxShadow: "0 20px 45px rgba(0,0,0,0.08)" }}>
            <div className="section-line" />
            <div className="section-label accent-red">SELECT TYPE</div>
            <h2 className="section-title">GIVING TYPE</h2>

            <div className="giving-type-grid" style={{ marginBottom: "2.5rem" }}>
              {givingTypes.map((type) => (
                <div className="giving-option" key={type.name}>
                  <span className="giving-option-title">{type.name}</span>
                  <span className="giving-option-copy">{type.copy}</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "1.5rem" }}>AMOUNT</h3>
            <div className="amount-grid" style={{ marginBottom: "1.5rem" }}>
              {presetAmounts.map((amount) => (
                <button className="amount-option" key={amount} type="button">
                  {amount}
                </button>
              ))}
            </div>

            <div className="field-group">
              <input className="input" placeholder="Enter custom amount" type="number" />
            </div>

            <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "1.5rem" }}>PERSONAL INFORMATION</h3>
            <div className="form-grid-2">
              <div className="field-group">
                <label htmlFor="full_name">FULL NAME</label>
                <input className="input" id="full_name" placeholder="Enter your full name" />
              </div>
              <div className="field-group">
                <label htmlFor="email">EMAIL ADDRESS</label>
                <input className="input" id="email" placeholder="Enter your email" type="email" />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="phone">PHONE NUMBER (OPTIONAL)</label>
              <input className="input" id="phone" placeholder="Enter your phone number" />
            </div>

            <div className="checkbox-item" style={{ marginBottom: "2rem" }}>
              <input id="anonymous" type="checkbox" />
              <label htmlFor="anonymous" style={{ margin: 0, fontWeight: 900 }}>
                MAKE THIS GIVING ANONYMOUS
              </label>
            </div>

            <button className="btn-primary" style={{ width: "100%", borderRadius: "0.75rem" }} type="button">
              PROCEED TO GIVE
            </button>
          </div>

          <div style={{ marginTop: "2rem" }} className="secure-note">
            <span className="secure-note-icon">🔒</span>
            Secure payment powered by Paystack
          </div>
        </div>
      </section>
    </>
  );
}
