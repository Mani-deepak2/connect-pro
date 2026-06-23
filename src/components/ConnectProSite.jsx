"use client";
import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  ArrowRight, Menu, X, Video, Code2, BrainCircuit, BarChart3, Palette,
  PenTool, Smartphone, Megaphone, ShieldCheck, MessageSquare,
  Coins, Send, CheckCircle2, Lock, Sparkles, Star, ChevronDown,
  Globe2, Eye, EyeOff, Mail, ArrowLeft, Twitter, Linkedin, Instagram, Github, MessageCircle, Briefcase, Camera
} from "lucide-react";
import { IMAGES } from "./constants";

/* ------------------------------------------------------------------ */
/* Fonts                                                                 */
/* ------------------------------------------------------------------ */
const FONT_LINK_ID = "connectpro-fonts-v2";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ------------------------------------------------------------------ */
/* Simple page router context                                          */
/* ------------------------------------------------------------------ */
const NavCtx = createContext({ page: "home", go: () => {} });
const usePages = () => useContext(NavCtx);

/* ------------------------------------------------------------------ */
/* Reveal-on-scroll                                                     */
/* ------------------------------------------------------------------ */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(28px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Counter                                                              */
/* ------------------------------------------------------------------ */
function Counter({ end, suffix = "", duration = 1500 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return (
    <span>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page transition wrapper                                              */
/* ------------------------------------------------------------------ */
function PageTransition({ children, keyId }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(false);
    const t = setTimeout(() => setShow(true), 20);
    return () => clearTimeout(t);
  }, [keyId]);

  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0px)" : "translateY(14px)",
        transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nav                                                                   */
/* ------------------------------------------------------------------ */
const NAV_LINKS = [
  { label: "Our mission", page: "home", anchor: "#mission" },
  { label: "Services", page: "home", anchor: "#categories" },
  { label: "How it works", page: "home", anchor: "#how-it-works" },
  { label: "Pricing", page: "home", anchor: "#pricing" },
];

function Logo({ dark }) {
  return (
    <span className="flex items-center gap-2 font-display font-bold text-2xl leading-none">
      <span className={dark ? "text-white" : "text-[#15171C]"}>Connect</span>
      <span className="text-[#2563EB]">Pro</span>
    </span>
  );
}

function Nav() {
  const { page, go } = usePages();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = page === "home";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? "bg-white/90 backdrop-blur-md border-b border-[#ECEAE5] shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[76px] flex items-center justify-between">
        <button onClick={() => go("home")} className="shrink-0">
          <Logo />
        </button>

        <nav className="hidden lg:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.anchor}
              onClick={() => go("home")}
              className="text-[15px] font-semibold text-[#3A3D45] hover:text-[#15171C] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => go("login")}
            className="text-[15px] font-semibold text-[#3A3D45] hover:text-[#15171C] transition-colors px-2"
          >
            Log in
          </button>
          <button
            onClick={() => go("signup")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
          >
            Get started
          </button>
        </div>

        <button className="lg:hidden p-2 text-[#15171C]" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#ECEAE5] bg-white px-5 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.anchor}
              onClick={() => { go("home"); setOpen(false); }}
              className="px-2 py-2.5 text-sm font-semibold text-[#3A3D45]"
            >
              {link.label}
            </a>
          ))}
          <div className="border-t border-[#ECEAE5] my-2" />
          <button onClick={() => { go("login"); setOpen(false); }} className="px-2 py-2.5 text-sm font-semibold text-left text-[#3A3D45]">
            Log in
          </button>
          <button onClick={() => { go("signup"); setOpen(false); }} className="px-2 py-2.5 text-sm font-semibold text-center text-white bg-[#2563EB] rounded-full">
            Get started
          </button>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                  */
/* ------------------------------------------------------------------ */
function Hero() {
  const { go } = usePages();
  return (
    <section className="relative overflow-hidden bg-[#F7F6F3]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 min-h-[640px] lg:min-h-[720px]">
        {/* Left copy */}
        <div className="flex flex-col justify-center py-16 lg:py-0 relative z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E4E1DA] bg-white px-4 py-1.5 mb-7 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="text-xs font-semibold text-[#5B5E68]">
                10,000+ freelancers · 2,500+ clients
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="font-display font-extrabold text-[44px] sm:text-[56px] lg:text-[64px] leading-[1.05] tracking-tight text-[#15171C] mb-6 max-w-xl">
              Hire top freelancers, or find your next opportunity
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-lg text-[#5B5E68] max-w-md mb-10 leading-relaxed">
              Connect with skilled professionals worldwide. Post projects, hire experts,
              manage payments securely, and grow your business — all in one platform.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => go("signup")}
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-[#15171C] hover:bg-[#2563EB] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
              >
                Hire talent
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => go("signup")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-[#15171C] border border-[#D8D5CD] bg-white hover:bg-[#F1EFEA] transition-all hover:-translate-y-0.5"
              >
                Start freelancing
              </button>
            </div>
          </Reveal>
        </div>

        {/* Right image */}
        <div className="relative hidden lg:block">
          <Reveal delay={120} className="absolute inset-y-0 right-0 w-[120%]">
            <div className="relative h-full w-full overflow-hidden rounded-bl-[2.5rem]">
              <img
                src={IMAGES.heroTeam}
                alt="Team collaborating around a table, viewed from above"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F7F6F3] via-transparent to-transparent w-1/4" />
            </div>
          </Reveal>

          {/* Floating credential card */}
          <div className="absolute bottom-10 left-2 z-10 float-medium hidden xl:block">
            <div className="rounded-2xl border border-[#ECEAE5] bg-white/95 backdrop-blur-sm shadow-xl shadow-black/5 px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#15171C]">Verified payments</div>
                <div className="text-xs text-[#8A8D96]">Escrow-protected transactions</div>
              </div>
            </div>
          </div>

          {/* Floating rating card */}
          <div className="absolute top-12 right-12 z-10 float-slow hidden xl:block">
            <div className="rounded-2xl border border-[#ECEAE5] bg-white/95 backdrop-blur-sm shadow-xl shadow-black/5 px-5 py-3.5 flex items-center gap-2.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-[#15171C]">4.9/5</span>
              <span className="text-xs text-[#8A8D96]">avg. rating</span>
            </div>
          </div>
        </div>

        {/* Mobile image */}
        <div className="lg:hidden -mx-5 -mb-1">
          <img
            src={IMAGES.heroTeam}
            alt="Team collaborating around a table, viewed from above"
            className="w-full h-64 object-cover"
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stats strip                                                          */
/* ------------------------------------------------------------------ */
const STATS = [
  { label: "Freelancers", value: 10000, suffix: "+" },
  { label: "Clients", value: 2500, suffix: "+" },
  { label: "Projects completed", value: 50000, suffix: "+" },
  { label: "Client satisfaction", value: 95, suffix: "%" },
];

function Stats() {
  return (
    <section id="mission" className="bg-[#15171C] py-16">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="text-center lg:text-left">
              <div className="font-display text-4xl sm:text-5xl font-bold text-white mb-1.5">
                <Counter end={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-[#A3A6AE] font-medium">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Mission strip                                                         */
/* ------------------------------------------------------------------ */
function Mission() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <Reveal>
          <div className="relative rounded-3xl overflow-hidden">
            <img
              src={IMAGES.heroAlt}
              alt="Overhead view of a creative workspace with laptops and notes"
              className="w-full h-[380px] lg:h-[440px] object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <span className="text-sm font-bold text-[#2563EB] uppercase tracking-wide">Our mission</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#15171C] mt-3 mb-5 leading-tight">
            We're the global services provider for your external workforce
          </h2>
          <p className="text-[#5B5E68] leading-relaxed mb-6">
            ConnectPro brings clients and independent professionals together on one
            trusted platform — handling matching, secure payments, communication, and
            project tracking, so both sides can focus on the work that matters.
          </p>
          <ul className="space-y-3">
            {[
              "Vetted, verified freelance professionals",
              "Escrow-protected payments on every project",
              "Built-in messaging, files, and milestone tracking",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <span className="text-[#3A3D45] font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Categories with real images                                         */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { icon: Video, name: "Video Editing", img: IMAGES.videoEditing },
  { icon: Code2, name: "Web Development", img: IMAGES.webDev },
  { icon: BrainCircuit, name: "AI Development", img: IMAGES.aiDev },
  { icon: BarChart3, name: "Data Analysis", img: IMAGES.dataAnalysis },
  { icon: Palette, name: "Graphic Design", img: IMAGES.graphicDesign },
  { icon: PenTool, name: "Content Writing", img: IMAGES.contentWriting },
  { icon: Smartphone, name: "Mobile Development", img: IMAGES.mobileDev },
  { icon: Megaphone, name: "Digital Marketing", img: IMAGES.digitalMarketing },
];

function Categories() {
  return (
    <section id="categories" className="py-24 lg:py-32 bg-[#F7F6F3]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="max-w-2xl mb-14">
          <span className="text-sm font-bold text-[#2563EB] uppercase tracking-wide">Services</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#15171C] mt-3 mb-4">
            Every skill your project needs
          </h2>
          <p className="text-[#5B5E68] leading-relaxed">
            Browse vetted professionals across the categories businesses request most —
            and find the right fit in minutes.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Reveal key={cat.name} delay={(i % 4) * 70}>
                <a
                  href="#"
                  className="group relative block rounded-2xl overflow-hidden aspect-[4/5] hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-black/10"
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-display font-bold text-white text-base">{cat.name}</h3>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                              */
/* ------------------------------------------------------------------ */
const FEATURES = [
  { icon: Sparkles, title: "Smart talent matching", desc: "Match clients with the best-fit freelancers based on skills, history, and project scope." },
  { icon: Lock, title: "Secure payments", desc: "Every transaction is protected with escrow-based payment protection on the platform." },
  { icon: Coins, title: "Credit-based applications", desc: "Freelancers receive free starter credits and can purchase more whenever they need them." },
  { icon: MessageSquare, title: "Real-time chat", desc: "Communicate directly with clients or freelancers without leaving the platform." },
  { icon: Star, title: "Portfolio showcase", desc: "Display previous work, case studies, and achievements to build instant credibility." },
  { icon: ShieldCheck, title: "Verified profiles", desc: "Identity verification badges increase trust between clients and freelancers." },
  { icon: BarChart3, title: "Project tracking", desc: "Monitor milestones, deadlines, and progress across every active project." },
  { icon: Send, title: "File delivery system", desc: "Securely share project files, drafts, and final deliverables in one place." },
];

function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="max-w-2xl mb-14">
          <span className="text-sm font-bold text-[#2563EB] uppercase tracking-wide">Platform</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#15171C] mt-3 mb-4">
            Everything both sides need to work together
          </h2>
          <p className="text-[#5B5E68] leading-relaxed">
            Built for speed, trust, and transparency — from the first message to the
            final payment.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={(i % 4) * 70}>
                <div className="group h-full rounded-2xl border border-[#ECEAE5] bg-white p-6 hover:border-[#2563EB]/30 hover:shadow-lg hover:shadow-black/5 transition-all hover:-translate-y-1">
                  <div className="w-11 h-11 rounded-xl bg-[#EEF3FF] flex items-center justify-center mb-4 group-hover:bg-[#2563EB] transition-colors">
                    <Icon className="w-5 h-5 text-[#2563EB] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-display font-bold text-[#15171C] text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-[#5B5E68] leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                          */
/* ------------------------------------------------------------------ */
const CLIENT_STEPS = ["Create your account", "Post a project", "Review applications", "Hire a freelancer", "Receive your work securely"];
const FREELANCER_STEPS = ["Create your profile", "Receive free starter credits", "Apply for projects", "Collaborate with clients", "Get paid securely"];

function StepList({ title, steps, accent }) {
  return (
    <Reveal className="rounded-3xl border border-[#ECEAE5] bg-white p-7 sm:p-9 h-full">
      <h3 className="font-display font-bold text-xl text-[#15171C] mb-7">{title}</h3>
      <ol className="space-y-5">
        {steps.map((step, i) => (
          <li key={step} className="flex items-start gap-4">
            <span
              className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm ${
                accent === "blue" ? "bg-[#2563EB] text-white" : "bg-[#15171C] text-white"
              }`}
            >
              {i + 1}
            </span>
            <span className="text-[#3A3D45] font-medium leading-relaxed pt-1.5">{step}</span>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-[#F7F6F3]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="max-w-2xl mb-14">
          <span className="text-sm font-bold text-[#2563EB] uppercase tracking-wide">How it works</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#15171C] mt-3 mb-4">
            A clear path for both sides
          </h2>
          <p className="text-[#5B5E68] leading-relaxed">
            Whether you're hiring or freelancing, the path from sign-up to payment
            stays simple and transparent.
          </p>
        </Reveal>
        <div className="grid lg:grid-cols-2 gap-6">
          <StepList title="For clients" steps={CLIENT_STEPS} accent="blue" />
          <StepList title="For freelancers" steps={FREELANCER_STEPS} accent="dark" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Credit system                                                         */
/* ------------------------------------------------------------------ */
function CreditSystem() {
  const points = [
    { icon: Sparkles, title: "Free starter credits", desc: "New freelancers receive free credits the moment they create a profile." },
    { icon: Send, title: "Apply with credits", desc: "Credits are spent when applying for projects — no upfront fees required." },
    { icon: Coins, title: "Top up anytime", desc: "Need more applications? Purchase additional credits whenever you need them." },
    { icon: ShieldCheck, title: "Fair, transparent pricing", desc: "Every credit cost is shown up front — no hidden charges or surprise deductions." },
  ];

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <Reveal>
          <span className="text-sm font-bold text-[#2563EB] uppercase tracking-wide">Credit system</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#15171C] mt-3 mb-4">
            A fairer way to apply for work
          </h2>
          <p className="text-[#5B5E68] leading-relaxed mb-8 max-w-lg">
            ConnectPro's credit model keeps applications meaningful — freelancers
            start with free credits, spend them thoughtfully, and top up only when
            they need to.
          </p>

          <div className="space-y-5">
            {points.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-[#EEF3FF] flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-[#2563EB]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#15171C] text-sm mb-1">{p.title}</h4>
                    <p className="text-sm text-[#5B5E68] leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative max-w-md mx-auto">
            <div className="relative rounded-3xl border border-[#ECEAE5] bg-[#F7F6F3] p-7 sm:p-8 shadow-xl shadow-black/5 float-medium">
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-bold uppercase tracking-wide text-[#8A8D96]">Credit wallet</span>
                <Coins className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="font-display text-5xl font-bold text-[#15171C] mb-1">1,240</div>
              <p className="text-sm text-[#8A8D96] mb-8">available credits</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm py-3 border-t border-[#ECEAE5]">
                  <span className="text-[#5B5E68]">Starter bonus</span>
                  <span className="font-semibold text-emerald-600">+500</span>
                </div>
                <div className="flex items-center justify-between text-sm py-3 border-t border-[#ECEAE5]">
                  <span className="text-[#5B5E68]">Applications sent</span>
                  <span className="font-semibold text-[#3A3D45]">−180</span>
                </div>
                <div className="flex items-center justify-between text-sm py-3 border-t border-[#ECEAE5]">
                  <span className="text-[#5B5E68]">Top-up purchased</span>
                  <span className="font-semibold text-emerald-600">+920</span>
                </div>
              </div>

              <button className="w-full mt-7 py-3.5 rounded-full text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-all hover:shadow-lg hover:shadow-blue-500/25">
                Buy more credits
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                               */
/* ------------------------------------------------------------------ */
const PLANS = [
  { name: "Starter", price: "Free", desc: "For freelancers just getting started.", features: ["Free account", "Starter credit pack", "Basic profile"], cta: "Get started", highlight: false },
  { name: "Professional", price: "$19", period: "/month", desc: "For freelancers ready to grow faster.", features: ["More monthly credits", "Priority visibility in search", "Advanced earnings analytics"], cta: "Upgrade now", highlight: true },
  { name: "Premium", price: "$49", period: "/month", desc: "For top-tier professionals and agencies.", features: ["Maximum visibility placement", "Unlimited project applications", "Premium support"], cta: "Go premium", highlight: false },
];

function Pricing() {
  const { go } = usePages();
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-[#F7F6F3]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-bold text-[#2563EB] uppercase tracking-wide">Pricing</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#15171C] mt-3 mb-4">
            Plans that grow with you
          </h2>
          <p className="text-[#5B5E68] leading-relaxed">
            Start free. Upgrade only when more visibility and credits start paying for themselves.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100}>
              <div className={`relative h-full rounded-3xl p-7 sm:p-8 border transition-all hover:-translate-y-1 ${
                plan.highlight ? "border-[#2563EB] bg-white shadow-xl shadow-blue-500/10" : "border-[#ECEAE5] bg-white"
              }`}>
                {plan.highlight && (
                  <span className="absolute -top-3 right-7 text-[11px] font-bold text-white bg-[#2563EB] px-3 py-1 rounded-full">
                    Most popular
                  </span>
                )}
                <h3 className="font-display font-bold text-xl text-[#15171C] mb-1">{plan.name}</h3>
                <p className="text-sm text-[#8A8D96] mb-6">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-7">
                  <span className="font-display text-4xl font-bold text-[#15171C]">{plan.price}</span>
                  {plan.period && <span className="text-sm text-[#8A8D96]">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-[#3A3D45]">
                      <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => go("signup")}
                  className={`w-full text-center py-3 rounded-full text-sm font-semibold transition-all ${
                    plan.highlight ? "text-white bg-[#2563EB] hover:bg-[#1D4ED8] hover:shadow-lg hover:shadow-blue-500/25" : "text-[#15171C] border border-[#D8D5CD] hover:bg-[#F7F6F3]"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Testimonials                                                          */
/* ------------------------------------------------------------------ */
const TESTIMONIALS = [
  { name: "Lena Vasquez", role: "Video Editor", img: IMAGES.testimonial1, quote: "I went from zero clients to a full calendar in two months. The credit system actually made me more selective." },
  { name: "Marcus Webb", role: "Web Developer", img: IMAGES.testimonial2, quote: "Escrow payments removed the awkward 'will I get paid' conversation entirely. Clients trust the platform." },
  { name: "Priya Nandakumar", role: "Startup Founder", img: IMAGES.testimonial3, quote: "We hired our entire early product team through ConnectPro. The matching quality genuinely surprised me." },
  { name: "Daniel Osei", role: "Data Analyst", img: IMAGES.testimonial4, quote: "Project tracking keeps every client conversation organized. I haven't lost a deliverable thread since." },
];

function Testimonials() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="max-w-2xl mb-14">
          <span className="text-sm font-bold text-[#2563EB] uppercase tracking-wide">Testimonials</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#15171C] mt-3">
            Trusted by people doing the work
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 2) * 100}>
              <div className="h-full rounded-2xl border border-[#ECEAE5] bg-white p-6 sm:p-7 hover:shadow-lg hover:shadow-black/5 transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, idx) => <Star key={idx} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-[#3A3D45] leading-relaxed mb-6 text-sm sm:text-base">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-[#15171C] text-sm">{t.name}</div>
                    <div className="text-xs text-[#8A8D96]">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                   */
/* ------------------------------------------------------------------ */
const FAQS = [
  { q: "How does the credit system work?", a: "New freelancers receive a free starter pack of credits when they create a profile. Credits are spent each time you apply for a project. When you run low, you can purchase additional credits at transparent, published rates." },
  { q: "How are payments protected?", a: "All payments move through ConnectPro's escrow system. Funds are held securely once a project starts and released once the client confirms delivery." },
  { q: "How do freelancers get hired?", a: "Freelancers build a profile, showcase their portfolio, and apply to projects using credits. Clients review applications and message candidates before hiring." },
  { q: "Is the platform secure?", a: "Yes. Profiles can be identity-verified, payments run through escrow, and all messages and files stay within ConnectPro's encrypted environment." },
  { q: "Can I work with international clients?", a: "Absolutely. ConnectPro supports freelancers and clients worldwide, with secure cross-border payments and multi-currency support built in." },
];

function FAQItem({ faq, open, onClick }) {
  return (
    <div className="border-b border-[#ECEAE5]">
      <button onClick={onClick} className="w-full flex items-center justify-between gap-4 py-5 text-left group">
        <span className="font-semibold text-[#15171C] text-sm sm:text-base group-hover:text-[#2563EB] transition-colors">{faq.q}</span>
        <ChevronDown className={`w-4 h-4 text-[#8A8D96] shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-[#2563EB]" : ""}`} />
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? "200px" : "0px" }}>
        <p className="text-sm text-[#5B5E68] leading-relaxed pb-5 pr-8">{faq.a}</p>
      </div>
    </div>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section id="faq" className="py-24 lg:py-32 bg-[#F7F6F3]">
      <div className="max-w-3xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center mb-12">
          <span className="text-sm font-bold text-[#2563EB] uppercase tracking-wide">FAQ</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#15171C] mt-3">Frequently asked questions</h2>
        </Reveal>
        <Reveal>
          <div className="bg-white rounded-2xl border border-[#ECEAE5] px-6 sm:px-8">
            {FAQS.map((faq, i) => (
              <FAQItem key={faq.q} faq={faq} open={openIndex === i} onClick={() => setOpenIndex(openIndex === i ? -1 : i)} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                             */
/* ------------------------------------------------------------------ */
function FinalCTA() {
  const { go } = usePages();
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <img src={IMAGES.ctaCollab} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[#15171C]/80" />
      <div className="relative max-w-4xl mx-auto px-5 lg:px-8 text-center">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mb-5 leading-tight">
            Ready to build your career, or hire top talent?
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-[#D5D7DC] mb-9 max-w-xl mx-auto">
            Join thousands of clients and freelancers already growing on ConnectPro.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => go("signup")} className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-[#15171C] bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Get started free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#categories" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white border border-white/30 hover:bg-white/10 backdrop-blur-sm transition-all hover:-translate-y-0.5">
              Explore opportunities
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                                */
/* ------------------------------------------------------------------ */
function Footer() {
  const { go } = usePages();
  return (
    <footer className="bg-white border-t border-[#ECEAE5] py-14">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-10 mb-10">
          <div>
            <button onClick={() => go("home")} className="mb-4"><Logo /></button>
            <p className="text-sm text-[#8A8D96] max-w-xs leading-relaxed">
              The freelance marketplace connecting skilled professionals with the businesses that need them.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#8A8D96] mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="text-[#5B5E68] hover:text-[#15171C] transition-colors">About</a></li>
                <li><a href="#" className="text-[#5B5E68] hover:text-[#15171C] transition-colors">Careers</a></li>
                <li><a href="#" className="text-[#5B5E68] hover:text-[#15171C] transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#8A8D96] mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="text-[#5B5E68] hover:text-[#15171C] transition-colors">Privacy policy</a></li>
                <li><a href="#" className="text-[#5B5E68] hover:text-[#15171C] transition-colors">Terms of service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#8A8D96] mb-4">Follow</h4>
              <div className="flex gap-3">
                {[MessageCircle, Briefcase, Camera, Code2].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full border border-[#ECEAE5] flex items-center justify-center text-[#8A8D96] hover:text-[#15171C] hover:border-[#D8D5CD] transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-[#ECEAE5] text-center text-xs text-[#8A8D96]">
          © 2026 ConnectPro. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Auth shared layout                                                    */
/* ------------------------------------------------------------------ */
function AuthLayout({ children, image, badge }) {
  const { go } = usePages();
  return (
    <div className="min-h-[calc(100vh-76px)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 sm:px-10 py-16">
        <div className="w-full max-w-md">
          <button onClick={() => go("home")} className="inline-flex items-center gap-2 text-sm font-semibold text-[#8A8D96] hover:text-[#15171C] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </button>
          {children}
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden">
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#15171C]/70 via-[#15171C]/10 to-transparent" />
        {badge && (
          <div className="absolute bottom-10 left-10 right-10 float-medium">
            <div className="rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl shadow-black/10 px-6 py-5">
              {badge}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SocialButton({ icon: Icon, label }) {
  return (
    <button className="w-full inline-flex items-center justify-center gap-2.5 py-3 rounded-full border border-[#D8D5CD] bg-white hover:bg-[#F7F6F3] text-sm font-semibold text-[#3A3D45] transition-colors">
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Login page                                                            */
/* ------------------------------------------------------------------ */
function LoginPage() {
  const { go } = usePages();
  const [showPw, setShowPw] = useState(false);

  return (
    <AuthLayout
      image={IMAGES.authSide}
      badge={
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="font-bold text-[#15171C] text-sm">Welcome back</div>
            <div className="text-xs text-[#8A8D96]">Your projects and messages are waiting.</div>
          </div>
        </div>
      }
    >
      <h1 className="font-display font-bold text-3xl text-[#15171C] mb-2">Log in to ConnectPro</h1>
      <p className="text-[#8A8D96] mb-8">Enter your details to access your dashboard.</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <SocialButton icon={Globe2} label="Google" />
        <SocialButton icon={Code2} label="GitHub" />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-px bg-[#ECEAE5] flex-1" />
        <span className="text-xs text-[#8A8D96] font-medium">or continue with email</span>
        <div className="h-px bg-[#ECEAE5] flex-1" />
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-semibold text-[#15171C] mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8D96]" />
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#D8D5CD] bg-white text-sm text-[#15171C] placeholder-[#B0B3BB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-[#15171C]">Password</label>
            <a href="#" className="text-xs font-semibold text-[#2563EB] hover:underline">Forgot password?</a>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8D96]" />
            <input
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#D8D5CD] bg-white text-sm text-[#15171C] placeholder-[#B0B3BB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8D96] hover:text-[#15171C]">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" className="w-full py-3.5 rounded-full text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5">
          Log in
        </button>
      </form>

      <p className="text-center text-sm text-[#8A8D96] mt-7">
        Don't have an account?{" "}
        <button onClick={() => go("signup")} className="font-semibold text-[#2563EB] hover:underline">Sign up</button>
      </p>
    </AuthLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Sign up page                                                          */
/* ------------------------------------------------------------------ */
function SignupPage() {
  const { go } = usePages();
  const [role, setRole] = useState("client");
  const [showPw, setShowPw] = useState(false);

  return (
    <AuthLayout
      image={IMAGES.heroAlt}
      badge={
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#EEF3FF] flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <div className="font-bold text-[#15171C] text-sm">Get 500 free credits</div>
            <div className="text-xs text-[#8A8D96]">Awarded automatically on sign-up.</div>
          </div>
        </div>
      }
    >
      <h1 className="font-display font-bold text-3xl text-[#15171C] mb-2">Create your account</h1>
      <p className="text-[#8A8D96] mb-7">Join ConnectPro in less than a minute.</p>

      {/* Role toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-[#F1EFEA] mb-7">
        <button
          onClick={() => setRole("client")}
          className={`py-2.5 rounded-full text-sm font-semibold transition-all ${
            role === "client" ? "bg-white text-[#15171C] shadow-sm" : "text-[#8A8D96]"
          }`}
        >
          I'm hiring
        </button>
        <button
          onClick={() => setRole("freelancer")}
          className={`py-2.5 rounded-full text-sm font-semibold transition-all ${
            role === "freelancer" ? "bg-white text-[#15171C] shadow-sm" : "text-[#8A8D96]"
          }`}
        >
          I'm freelancing
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <SocialButton icon={Globe2} label="Google" />
        <SocialButton icon={Code2} label="GitHub" />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-px bg-[#ECEAE5] flex-1" />
        <span className="text-xs text-[#8A8D96] font-medium">or continue with email</span>
        <div className="h-px bg-[#ECEAE5] flex-1" />
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#15171C] mb-1.5">First name</label>
            <input type="text" placeholder="Jordan" className="w-full px-4 py-3 rounded-xl border border-[#D8D5CD] bg-white text-sm text-[#15171C] placeholder-[#B0B3BB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#15171C] mb-1.5">Last name</label>
            <input type="text" placeholder="Lee" className="w-full px-4 py-3 rounded-xl border border-[#D8D5CD] bg-white text-sm text-[#15171C] placeholder-[#B0B3BB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#15171C] mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8D96]" />
            <input type="email" placeholder="you@example.com" className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#D8D5CD] bg-white text-sm text-[#15171C] placeholder-[#B0B3BB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#15171C] mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8D96]" />
            <input type={showPw ? "text" : "password"} placeholder="Create a password" className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#D8D5CD] bg-white text-sm text-[#15171C] placeholder-[#B0B3BB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all" />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8D96] hover:text-[#15171C]">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-xs text-[#8A8D96] leading-relaxed">
          By creating an account, you agree to ConnectPro's Terms of Service and Privacy Policy.
        </p>

        <button type="submit" className="w-full py-3.5 rounded-full text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5">
          {role === "client" ? "Create account & post a project" : "Create account & claim credits"}
        </button>
      </form>

      <p className="text-center text-sm text-[#8A8D96] mt-7">
        Already have an account?{" "}
        <button onClick={() => go("login")} className="font-semibold text-[#2563EB] hover:underline">Log in</button>
      </p>
    </AuthLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Home page                                                             */
/* ------------------------------------------------------------------ */
function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Mission />
      <Categories />
      <Features />
      <HowItWorks />
      <CreditSystem />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Root                                                                  */
/* ------------------------------------------------------------------ */
export default function ConnectProSite() {
  useFonts();
  const [page, setPage] = useState("home");
  const nextRouter = typeof window !== 'undefined' ? require('next/navigation') : null;

  const go = (p) => {
    // Route login and signup to the real Next.js auth pages
    if (p === "login") {
      if (nextRouter) {
        window.location.href = "/login";
      }
      return;
    }
    if (p === "signup") {
      if (nextRouter) {
        window.location.href = "/signup";
      }
      return;
    }
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <NavCtx.Provider value={{ page, go }}>
      <div className="min-h-screen bg-white text-[#15171C] antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{`
          .font-display { font-family: 'Sora', sans-serif; }

          @keyframes float-slow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes float-medium {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          .float-slow { animation: float-slow 6.5s ease-in-out infinite; }
          .float-medium { animation: float-medium 5.5s ease-in-out infinite; }

          @media (prefers-reduced-motion: reduce) {
            .float-slow, .float-medium { animation: none !important; }
          }

          html { scroll-behavior: smooth; }
          *:focus-visible {
            outline: 2px solid #2563EB;
            outline-offset: 2px;
            border-radius: 4px;
          }
        `}</style>

        <Nav />
        <PageTransition keyId={page}>
          {page === "home" && <HomePage />}
        </PageTransition>
        {page === "home" && <Footer />}
      </div>
    </NavCtx.Provider>
  );
}
