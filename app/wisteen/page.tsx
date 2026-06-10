const technicalSkills = [
  "Python",
  "Django",
  "JavaScript",
  "FastAPI",
  "MongoDB",
  "SQL",
  "Git & GitHub",
  "HTML/CSS",
  "Linux",
  "RESTful APIs",
  "Agile/Scrum",
  "IT Support",
];

const softSkills = [
  "Leadership",
  "Team Collaboration",
  "Problem Solving",
  "Communication",
  "Project Management",
  "Adaptability",
  "Critical Thinking",
  "Time Management",
  "Mentoring",
  "Cross-cultural",
  "Remote Work",
  "Client Relations",
];

const projects = [
  ["Harmlex Homes", "https://www.harmlexhomes.com"],
  ["The Nest Expression", "http://thenestexpression.com/"],
  ["Dan-Graciousland Schools", "https://dan-graciouslandschools.com/"],
  ["VirtuaKids", "http://virtuakids.ng/"],
  ["Cleohn Ltd", "https://cleohnltd.com"],
  ["DevSocial", "https://devsocial.name.ng"],
  ["Jumot Collections", "https://jumotcollections.com.ng"],
  ["Educeptis Africa", "#"],
  ["TrekTrax Dynamics", "https://trektraxdynamics.com/"],
];

export default function WisteenPage() {
  return (
    <section className="wisteen-shell">
      <div className="wisteen-card">
        <div className="wisteen-left">
          <img
            alt="Wisdom Isaac Oku - Software Engineer"
            className="wisteen-avatar"
            src="/images/wisdom_isaac_oku.jpeg"
          />
          <h1 className="wisteen-name">Wisdom Isaac Oku</h1>
          <p className="wisteen-title">Software Engineer | Backend Developer | IT Support | Founder</p>

          <div className="wisteen-contact">
            <div className="wisteen-contact-item">
              <span className="wisteen-contact-icon">✉</span>
              <span>wisdomisaac168@gmail.com</span>
            </div>
            <div className="wisteen-contact-item">
              <span className="wisteen-contact-icon">☎</span>
              <span>+234 901 2544 2676</span>
            </div>
            <div className="wisteen-contact-item">
              <span className="wisteen-contact-icon">⌖</span>
              <span>Lagos, Nigeria</span>
            </div>
            <div className="wisteen-contact-item">
              <span className="wisteen-contact-icon">⌘</span>
              <span>github.com/wisteen</span>
            </div>
          </div>
        </div>

        <div className="wisteen-right">
          <div className="wisteen-section">
            <h2 className="wisteen-section-title">Summary</h2>
            <p className="wisteen-exp-copy">
              Eager Python developer with 6 years of experience and commendable project performance. Proven skills in Django, FastAPI, and JavaScript. Contributed to significant efficiency increases in automation tasks and backend optimizations.
            </p>
          </div>

          <div className="wisteen-section">
            <h2 className="wisteen-section-title">Technical Skills</h2>
            <div className="wisteen-skills">
              {technicalSkills.map((skill) => (
                <div className="wisteen-tag" key={skill}>
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div className="wisteen-section">
            <h2 className="wisteen-section-title">Soft Skills</h2>
            <div className="wisteen-skills">
              {softSkills.map((skill) => (
                <div className="wisteen-tag" key={skill}>
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div className="wisteen-section">
            <h2 className="wisteen-section-title">Experience</h2>
            <div className="wisteen-exp">
              <div className="wisteen-exp-title">Founder & CEO</div>
              <div className="wisteen-exp-meta">Educeptis Africa Limited, Lagos | 2025 - Present</div>
              <p className="wisteen-exp-copy">Founded and leading an educational technology company focused on innovative learning solutions across Africa.</p>
            </div>
            <div className="wisteen-exp">
              <div className="wisteen-exp-title">Python Backend Developer</div>
              <div className="wisteen-exp-meta">Zidepeople, Lagos | 2024 - 2025 (Contract)</div>
              <p className="wisteen-exp-copy">Create endpoints using FastAPI, MongoDB, and SQL for mobile app integration. Deploy APIs on cloud platforms and provide UI/UX suggestions during sprints.</p>
            </div>
            <div className="wisteen-exp">
              <div className="wisteen-exp-title">Fullstack Web Developer</div>
              <div className="wisteen-exp-meta">Virtual Safe Hub, Lagos | 2023 - 2024</div>
              <p className="wisteen-exp-copy">Led multiple team projects, improving code quality by 30% and reducing bugs by 25%. Developed backend for virtualsafe.org and mentored junior developers.</p>
            </div>
          </div>

          <div className="wisteen-section">
            <h2 className="wisteen-section-title">Showcased Websites</h2>
            <div className="wisteen-projects">
              {projects.map(([title, href]) => (
                <div className="wisteen-project" key={title}>
                  <div className="wisteen-project-title">{title}</div>
                  <a className="wisteen-project-link" href={href} rel="noreferrer" target="_blank">
                    {href === "#" ? "Educational Technology Solutions" : href}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="wisteen-section">
            <h2 className="wisteen-section-title">Certifications</h2>
            <ul className="wisteen-cert-list">
              <li className="wisteen-cert">
                <a href="https://savanna.alxafrica.com/certificates/X9hsezJY3T" rel="noreferrer" target="_blank">
                  ALX Software Engineering Programme (Back-end Specialization) – 2024
                </a>
              </li>
              <li className="wisteen-cert">
                <a href="https://freecodecamp.org/certification/wisteentechnology/responsive-web-design" rel="noreferrer" target="_blank">
                  freeCodeCamp – Responsive Web Design Developer – 2021
                </a>
              </li>
              <li className="wisteen-cert">
                <a href="https://www.freecodecamp.org/certification/wisteentechnology/scientific-computing-with-python-v7" rel="noreferrer" target="_blank">
                  freeCodeCamp – Scientific Computing with Python – 2023
                </a>
              </li>
              <li className="wisteen-cert">
                <a href="https://www.udemy.com/certificate/UC-b1d28918-7e99-4115-9e56-d778e2e0eada/" rel="noreferrer" target="_blank">
                  Udemy – The Complete Python Developer
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
