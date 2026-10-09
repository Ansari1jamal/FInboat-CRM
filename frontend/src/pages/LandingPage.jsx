import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Check, CircleDollarSign, Clock3, FileCheck2, HandCoins, ShieldCheck, UsersRound, Waves } from "lucide-react";
import { Link } from "react-router-dom";

const workflowSteps = [
  {
    label: "Capture",
    title: "Every conversation starts somewhere.",
    description: "Bring new enquiries into one shared pipeline. Assign an owner, record the context and make the next step obvious.",
    detail: "Lead captured",
    result: "Assigned to Maya Chen",
    icon: UsersRound,
  },
  {
    label: "Assess",
    title: "Move forward with the full picture.",
    description: "Keep application progress, documents and decisions connected, so handoffs happen with context instead of guesswork.",
    detail: "Application reviewed",
    result: "Documents complete · Ready for decision",
    icon: FileCheck2,
  },
  {
    label: "Support",
    title: "Stay close through repayment.",
    description: "Keep loan details and follow-ups visible after approval, helping your team deliver thoughtful, timely support.",
    detail: "Follow-up scheduled",
    result: "Repayment check-in · Thursday",
    icon: HandCoins,
  },
];

const LandingPage = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const revealItems = document.querySelectorAll(".landing-page .reveal");
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -35px 0px" });

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const selectedStep = workflowSteps[activeStep];
  const StepIcon = selectedStep.icon;

  return (
  <main className="landing-page" id="top">
    <header className="landing-nav">
      <Link className="landing-brand" to="/" aria-label="FinBoat CRM home">
        <span className="brand-mark"><Waves size={22} strokeWidth={2.4} /></span>
        <span>finboat<span className="brand-light">.crm</span></span>
      </Link>
      <nav className="landing-nav-links" aria-label="Main navigation">
        <a href="#platform">Platform</a>
        <a href="#workflow">How it works</a>
      </nav>
      <Link className="nav-signin" to="/login">Sign in <ArrowUpRight size={16} /></Link>
    </header>

    <section className="landing-hero landing-section" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="landing-kicker"><span /> LOAN OPERATIONS, IN SYNC</p>
        <h1 id="hero-title">Make every<br />customer journey<br /><em>feel effortless.</em></h1>
        <p className="hero-description">
          From first conversation to final repayment, bring your lending team and customer details together in one clear workspace.
        </p>
        <div className="hero-actions">
          <Link className="primary-cta" to="/login">Open your workspace <ArrowRight size={17} /></Link>
          <a className="text-cta" href="#platform">Explore the platform <span>↓</span></a>
        </div>
        <div className="hero-proof"><span className="proof-check"><Check size={13} /></span> One connected view for your entire lending team</div>
      </div>

      <div className="product-stage" aria-label="FinBoat lending operations dashboard preview">
        <div className="stage-topline"><span>FINBOAT WORKSPACE</span><span className="live-indicator">LIVE OVERVIEW</span></div>
        <div className="dashboard-preview">
          <aside className="preview-rail">
            <div className="preview-logo"><Waves size={17} /></div>
            <span className="rail-icon active"><BriefcaseBusiness size={17} /></span>
            <span className="rail-icon"><HandCoins size={17} /></span>
            <span className="rail-icon"><FileCheck2 size={17} /></span>
          </aside>
          <div className="preview-main">
            <div className="preview-heading"><div><span className="preview-overline">MONDAY, SEPTEMBER 28</span><h2>Good morning, Alex</h2></div><span className="avatar">A</span></div>
            <div className="preview-summary">
              <div className="summary-card"><span>Active leads</span><strong>248</strong><small className="positive"><ArrowUpRight size={13} /> 12.8%</small></div>
              <div className="summary-card"><span>In review</span><strong>36</strong><small><Clock3 size={12} /> 8 need attention</small></div>
              <div className="summary-card"><span>Disbursed</span><strong>$84.2k</strong><small className="positive"><ArrowUpRight size={13} /> 8.4%</small></div>
            </div>
            <div className="preview-work"><div className="work-title"><strong>Recent applications</strong><span>View all <ArrowRight size={12} /></span></div>
              <div className="application-row"><span className="customer-badge badge-coral">JM</span><div className="customer-name"><strong>Jordan Miller</strong><small>Personal loan · 2 hours ago</small></div><span className="status-pill review-pill">In review</span></div>
              <div className="application-row"><span className="customer-badge badge-mint">SK</span><div className="customer-name"><strong>Samira Khan</strong><small>Auto loan · 4 hours ago</small></div><span className="status-pill approved-pill">Approved</span></div>
              <div className="application-row"><span className="customer-badge badge-blue">DW</span><div className="customer-name"><strong>Daniel Wright</strong><small>Business loan · Yesterday</small></div><span className="status-pill new-pill">New lead</span></div>
            </div>
          </div>
        </div>
        <div className="stage-note"><span><CircleDollarSign size={16} /></span><div><strong>Every detail, in one place</strong><small>Leads, applications & repayments</small></div><ArrowUpRight size={16} /></div>
      </div>
    </section>

    <section className="platform-section landing-section" id="platform" aria-labelledby="platform-title">
      <div className="section-heading reveal">
        <p className="section-kicker">01 / ONE CONNECTED WORKSPACE</p>
        <h2 id="platform-title">The details are all here.<br /><em>So is the next move.</em></h2>
        <p>Good lending is built on good follow-through. Give every teammate the context to keep customers moving forward.</p>
      </div>
      <div className="feature-grid">
        <article className="feature-card reveal">
          <span className="feature-icon feature-green"><BriefcaseBusiness size={20} /></span>
          <span className="feature-index">01</span>
          <h3>Lead with context</h3>
          <p>See who owns each relationship, what has happened and what needs to happen next.</p>
          <span className="feature-link">A clearer pipeline <ArrowUpRight size={15} /></span>
        </article>
        <article className="feature-card reveal">
          <span className="feature-icon feature-orange"><FileCheck2 size={20} /></span>
          <span className="feature-index">02</span>
          <h3>Keep applications moving</h3>
          <p>Bring application status, documents and decisions into one easy-to-follow view.</p>
          <span className="feature-link">Fewer stalled handoffs <ArrowUpRight size={15} /></span>
        </article>
        <article className="feature-card reveal">
          <span className="feature-icon feature-blue"><HandCoins size={20} /></span>
          <span className="feature-index">03</span>
          <h3>Stay present after approval</h3>
          <p>Keep repayment activity and customer follow-ups part of the same journey.</p>
          <span className="feature-link">Support that continues <ArrowUpRight size={15} /></span>
        </article>
      </div>
    </section>

    <section className="workflow-section landing-section" id="workflow" aria-labelledby="workflow-title">
      <div className="workflow-intro reveal">
        <p className="section-kicker">02 / A BETTER WAY THROUGH</p>
        <h2 id="workflow-title">From first hello<br />to <em>what’s next.</em></h2>
        <p>One thoughtful process keeps the whole team in step, at every stage of the customer relationship.</p>
        <div className="workflow-steps" role="tablist" aria-label="Customer journey stages">
          {workflowSteps.map((step, index) => (
            <button
              aria-controls="workflow-panel"
              aria-selected={activeStep === index}
              className={`workflow-tab${activeStep === index ? " active" : ""}`}
              id={`workflow-tab-${index}`}
              key={step.label}
              onClick={() => setActiveStep(index)}
              onKeyDown={(event) => {
                const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
                if (!direction) return;
                event.preventDefault();
                const nextStep = (activeStep + direction + workflowSteps.length) % workflowSteps.length;
                setActiveStep(nextStep);
                document.getElementById(`workflow-tab-${nextStep}`)?.focus();
              }}
              role="tab"
              tabIndex={activeStep === index ? 0 : -1}
              type="button"
            >
              <span className="step-number">0{index + 1}</span>{step.label}<ArrowRight size={15} />
            </button>
          ))}
        </div>
      </div>
      <div
        aria-labelledby={`workflow-tab-${activeStep}`}
        className="workflow-panel reveal"
        id="workflow-panel"
        key={selectedStep.label}
        role="tabpanel"
        tabIndex={0}
      >
        <div className="workflow-panel-top"><span>THE CUSTOMER JOURNEY</span><span className="step-count">0{activeStep + 1} <i>/ 03</i></span></div>
        <div className="workflow-progress"><span style={{ width: `${((activeStep + 1) / workflowSteps.length) * 100}%` }} /></div>
        <div className="workflow-content">
          <span className="workflow-icon"><StepIcon size={23} /></span>
          <h3>{selectedStep.title}</h3>
          <p>{selectedStep.description}</p>
        </div>
        <div className="workflow-activity">
          <span className="activity-check"><Check size={14} /></span>
          <div><strong>{selectedStep.detail}</strong><small>{selectedStep.result}</small></div>
          <span className="activity-time">JUST NOW</span>
        </div>
      </div>
    </section>

    <section className="closing-section landing-section" id="start" aria-labelledby="closing-title">
      <div className="closing-orbit orbit-one" aria-hidden="true" />
      <div className="closing-orbit orbit-two" aria-hidden="true" />
      <div className="closing-copy reveal">
        <span className="closing-icon"><ShieldCheck size={20} /></span>
        <p className="section-kicker">03 / MADE FOR THE PEOPLE BEHIND EVERY LOAN</p>
        <h2 id="closing-title">Your team has a lot<br />to keep in motion.</h2>
        <p>Give them one calmer place to do it all, together.</p>
        <Link className="closing-cta" to="/login">Step into FinBoat <ArrowRight size={17} /></Link>
      </div>
      <div className="closing-note reveal"><span>FINBOAT CRM</span><strong>Better connected.<br />Better cared for.</strong><small>One customer. One shared picture.</small></div>
    </section>

    <footer className="landing-footer">
      <Link className="footer-brand" to="/" aria-label="FinBoat CRM home"><Waves size={16} /> finboat.crm</Link>
      <span>FinBoat CRM <span className="footer-dot">·</span> Lending, made clearer.</span>
      <Link to="#top">Back to top <ArrowUpRight size={14} /></Link>
    </footer>
  </main>
  );
};

export default LandingPage;