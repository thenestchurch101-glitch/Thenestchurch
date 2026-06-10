import Link from "next/link";
import { navigation, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img alt="The Nest Church logo" src="/images/logo1.png" />
              <div className="footer-brand-copy">
                <span>THE NEST</span>
                <span>CHURCH</span>
              </div>
            </div>
            <p className="footer-copy">
              A home of solace where every heart finds peace and purpose in Christ.
            </p>
          </div>

          <div>
            <h4 className="footer-title">QUICK LINKS</h4>
            <div className="footer-links">
              {navigation.slice(1, 5).map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer-title">SERVICE TIMES</h4>
            <div className="footer-contact">
              <div>SUNDAY SERVICE</div>
              <div>2:00 PM - 4:00 PM</div>
              <div>COUNSELLING WITH PM</div>
              <div>9:00 AM - 6:00 PM</div>
              <div>POWERED WEEK PRAYERS</div>
              <div>Monday 6:30 AM - 7:00 AM</div>
            </div>
          </div>

          <div>
            <h4 className="footer-title">CONTACT US</h4>
            <div className="footer-contact">
              <div>{site.address[0]}</div>
              <div>{site.address[1]}</div>
              <div>{site.address[2]}</div>
              <div>{site.phone}</div>
              <div>{site.email}</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 The Grid Department (Wisteen technology). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
