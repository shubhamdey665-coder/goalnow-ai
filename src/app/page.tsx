"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";

// ── ANIMATION 1: Particle Canvas ─────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0;

    const PARTICLE_COUNT = 90;
    type P = { x: number; y: number; vx: number; vy: number; r: number; alpha: number };
    let particles: P[] = [];

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }

    function spawn(): P {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.55 + 0.1,
      };
    }

    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, spawn);
    window.addEventListener("resize", resize);

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(34,211,238,${0.13 * (1 - dist / 130)})`;
            ctx!.lineWidth = 0.6;
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }

      // draw particles
      particles.forEach((p) => {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(103,232,249,${p.alpha})`;
        ctx!.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      });

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.45 }}
    />
  );
}

// ── ANIMATION 2: Scroll-Reveal Hook ──────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ── ANIMATION 3: Animated counter ────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const start = performance.now();
          function tick(now: number) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(Math.round(eased * to));
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  useScrollReveal();

  useEffect(() => {
    let isMounted = true;
    async function checkUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      setUserEmail(data.user?.email ?? null);
      setIsCheckingAuth(false);
    }
    checkUser();
    return () => { isMounted = false; };
  }, []);

  const isLoggedIn = Boolean(userEmail);

  const features = [
    { icon: "🧠", title: "AI Roadmap", text: "Break any goal into day-by-day tasks, weekly targets, and long-term milestones — generated in seconds." },
    { icon: "✅", title: "Daily Tracking", text: "Check off today's tasks with a single tap. Your streak stays honest because future days stay locked." },
    { icon: "📝", title: "Weekly Test", text: "A short quiz every seven days reveals exactly where you're slipping before it becomes a pattern." },
    { icon: "📊", title: "Progress Report", text: "See completion rate, consistency score, skipped days, and over-performance in one clean view." },
    { icon: "🤖", title: "AI Mentor", text: "Ask anything. Get short, practical guidance tailored to your goal — not a generic motivational speech." },
    { icon: "⚡", title: "Command Dashboard", text: "Every goal, tracker, report, test, and mentor session lives in one place. Switch in two clicks." },
  ];

  const steps = [
    { step: "01", title: "Name your goal", text: "Pick a category, set a deadline, and describe what success looks like." },
    { step: "02", title: "Choose a tracker", text: "Simple habits use Normal Tracker. Big plans use the AI Complex Tracker." },
    { step: "03", title: "Execute daily", text: "Complete tasks, mark the day done, and keep your streak moving forward." },
    { step: "04", title: "Review & improve", text: "Weekly tests and AI reports show what's working and what to fix." },
  ];

  return (
    <>
      <ParticleCanvas />
      <Navbar />

      <main className="relative z-10 min-h-screen overflow-x-hidden bg-slate-950 text-white">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden px-6 pt-24 pb-28 md:pt-32 md:pb-36">
          {/* ambient blobs */}
          <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[140px]" />
          <div className="absolute right-[-5%] top-32 h-[360px] w-[360px] rounded-full bg-blue-600/12 blur-[120px]" />
          <div className="absolute left-[-5%] bottom-0 h-[320px] w-[320px] rounded-full bg-violet-600/10 blur-[100px]" />

          <div className="relative mx-auto max-w-7xl">
            {/* eyebrow */}
            <div
              data-reveal
              className="reveal-item inline-flex items-center gap-2.5 rounded-full border border-cyan-400/30 bg-cyan-400/8 px-5 py-2.5 text-sm font-bold text-cyan-200 shadow-lg shadow-cyan-500/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
              </span>
              AI-powered goal planning and daily execution
            </div>

            {/* headline */}
            <h1
              data-reveal
              className="reveal-item mt-8 max-w-5xl text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[1.04] tracking-tight text-white"
              style={{ animationDelay: "80ms" }}
            >
              Stop planning.
              <br />
              <span className="hero-gradient-text">Start executing.</span>
            </h1>

            <p
              data-reveal
              className="reveal-item mt-7 max-w-2xl text-lg leading-8 text-slate-400 md:text-xl"
              style={{ animationDelay: "160ms" }}
            >
              GoalNow-AI turns any goal into a structured daily system with AI
              roadmaps, habit trackers, weekly tests, progress reports, and a
              mentor that gives you the next step — not a pep talk.
            </p>

            {/* CTA row */}
            <div
              data-reveal
              className="reveal-item mt-10 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "240ms" }}
            >
              {isCheckingAuth ? (
                <div className="h-14 w-44 animate-pulse rounded-2xl bg-white/10" />
              ) : isLoggedIn ? (
                <Link href="/dashboard" className="glow-cta-btn rounded-2xl px-8 py-4 text-center text-base font-black text-slate-950">
                  Open Dashboard →
                </Link>
              ) : (
                <Link href="/login" className="glow-cta-btn rounded-2xl px-8 py-4 text-center text-base font-black text-slate-950">
                  Start for free →
                </Link>
              )}
              <a
                href="#how"
                className="rounded-2xl border border-white/12 bg-white/5 px-8 py-4 text-center text-base font-bold text-white backdrop-blur transition hover:bg-white/10"
              >
                See how it works
              </a>
            </div>

            {/* stat pills */}
            <div
              data-reveal
              className="reveal-item mt-12 flex flex-wrap gap-4"
              style={{ animationDelay: "320ms" }}
            >
              {[
                { label: "Tracker modes", val: 2, suffix: "" },
                { label: "AI features", val: 6, suffix: "+" },
                { label: "Days of structure", val: 365, suffix: "+" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="stat-pill flex items-baseline gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur"
                >
                  <span className="text-3xl font-black text-cyan-300">
                    <Counter to={s.val} suffix={s.suffix} />
                  </span>
                  <span className="text-sm text-slate-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* floating app preview */}
          <div
            data-reveal
            className="reveal-item relative mx-auto mt-20 max-w-3xl"
            style={{ animationDelay: "400ms" }}
          >
            <div className="app-preview-shell rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
              <div className="rounded-[2rem] border border-white/8 bg-slate-950 p-6">
                {/* preview header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Live Dashboard Preview</p>
                    <h2 className="mt-1 text-2xl font-black">Google SWE Prep</h2>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                    ● Active
                  </span>
                </div>

                {/* progress bar */}
                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-400">Day 38 of 90</span>
                    <span className="font-bold text-white">42%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div className="preview-progress-bar h-full w-[42%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                  </div>
                </div>

                {/* task cards */}
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Today's focus", val: "DP + Graph problems × 3" },
                    { label: "AI Mentor", val: "Review BFS edge cases" },
                    { label: "Weekly test", val: "Due in 2 days" },
                  ].map((c) => (
                    <div key={c.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                      <p className="text-xs text-slate-500">{c.label}</p>
                      <p className="mt-1 text-sm font-bold text-white">{c.val}</p>
                    </div>
                  ))}
                </div>

                {/* checklist */}
                <div className="mt-5 space-y-2.5">
                  {[
                    { done: true, text: "Solve 3 LeetCode medium problems" },
                    { done: true, text: "Read CLRS Ch. 22 — Graph algorithms" },
                    { done: false, text: "Write BFS & DFS from scratch" },
                  ].map((t) => (
                    <label
                      key={t.text}
                      className={`flex items-center gap-3 rounded-2xl border p-3.5 ${
                        t.done
                          ? "border-cyan-400/20 bg-cyan-400/6"
                          : "border-white/8 bg-black/30"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-black ${
                          t.done
                            ? "border-cyan-400 bg-cyan-400 text-slate-950"
                            : "border-white/20 bg-white/5 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className={`text-sm ${t.done ? "text-slate-400 line-through" : "text-slate-200"}`}>
                        {t.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* glow under preview */}
            <div className="absolute inset-x-20 -bottom-8 h-24 rounded-full bg-cyan-500/20 blur-2xl" />
          </div>
        </section>

        {/* ── TRACKER MODES ── */}
        <section id="trackers" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="reveal-item mx-auto max-w-3xl text-center">
              <p className="section-eyebrow">Tracker Modes</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Two systems. One dashboard.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-400">
                Pick the tracker that fits your goal — or run both at the same time.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              {/* Normal */}
              <div data-reveal className="reveal-item tracker-card rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-2xl font-black text-slate-950 shadow-lg shadow-emerald-400/30">
                  N
                </div>
                <h3 className="mt-6 text-3xl font-black">Normal Tracker</h3>
                <p className="mt-3 text-base leading-7 text-slate-400">
                  Built for simple daily habits. One tap to mark the day done — no plan required.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    { t: "Calendar heat map", d: "See which days you hit or missed at a glance." },
                    { t: "Future day lock", d: "Can't mark tomorrow done — keeps progress honest." },
                    { t: "Streak detection", d: "Visual streak breaks so nothing slips quietly past." },
                  ].map((f) => (
                    <div key={f.t} className="rounded-2xl border border-white/8 bg-black/25 p-4">
                      <p className="font-bold text-white">{f.t}</p>
                      <p className="mt-1 text-sm text-slate-400">{f.d}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complex AI */}
              <div data-reveal className="reveal-item tracker-card-ai rounded-[2.5rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/12 to-blue-500/8 p-8 backdrop-blur" style={{ animationDelay: "120ms" }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-400 text-2xl font-black text-slate-950 shadow-lg shadow-cyan-400/30">
                  AI
                </div>
                <h3 className="mt-6 text-3xl font-black">Complex AI Tracker</h3>
                <p className="mt-3 text-base leading-7 text-slate-300">
                  For serious multi-month goals. AI generates your full roadmap; you execute it day by day.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    { t: "AI-generated roadmap", d: "Daily tasks, weekly themes, and long-term milestones." },
                    { t: "Active-day progression", d: "Plan advances only when the current day is completed." },
                    { t: "Weekly tests & reports", d: "Know exactly where you stand and what to fix next." },
                  ].map((f) => (
                    <div key={f.t} className="rounded-2xl border border-white/8 bg-black/25 p-4">
                      <p className="font-bold text-white">{f.t}</p>
                      <p className="mt-1 text-sm text-slate-400">{f.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="border-y border-white/8 bg-white/[0.02] px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="reveal-item max-w-3xl">
              <p className="section-eyebrow">Everything included</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Built like a real productivity tool.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-400">
                Not a to-do list. Not a notes app. A complete system for turning
                goals into consistent daily action.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  data-reveal
                  className="reveal-item feature-card group rounded-[1.75rem] border border-white/8 bg-slate-950 p-6"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="feature-icon mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/8 text-3xl shadow-lg shadow-cyan-500/10 transition-transform duration-300 group-hover:scale-110">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-black text-white">{f.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="reveal-item mx-auto max-w-3xl text-center">
              <p className="section-eyebrow">How it works</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Goal to execution in four steps.
              </h2>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-4">
              {steps.map((s, i) => (
                <div
                  key={s.step}
                  data-reveal
                  className="reveal-item step-card relative rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* connector line */}
                  {i < steps.length - 1 && (
                    <div className="absolute right-0 top-9 hidden h-px w-6 translate-x-full bg-gradient-to-r from-cyan-400/40 to-transparent md:block" />
                  )}
                  <p className="step-num text-5xl font-black">{s.step}</p>
                  <h3 className="mt-5 text-xl font-black">{s.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF BAND ── */}
        <section className="border-y border-white/8 bg-white/[0.02] px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="reveal-item grid gap-8 md:grid-cols-3">
              {[
                { icon: "🎯", headline: "Purpose-built", body: "Every feature exists to move your goal forward, not to pad a feature list." },
                { icon: "🔒", headline: "Your data, your account", body: "Goals live in your Supabase account. Delete your account, delete everything." },
                { icon: "📱", headline: "Works everywhere", body: "Same experience on phone and desktop. Check off today's task from your pocket." },
              ].map((c, i) => (
                <div
                  key={c.headline}
                  data-reveal
                  className="reveal-item flex gap-5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                    {c.icon}
                  </span>
                  <div>
                    <p className="font-black text-white">{c.headline}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="px-6 py-24">
          <div
            data-reveal
            className="reveal-item mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-500/12 via-blue-600/8 to-violet-600/6 p-10 text-center shadow-2xl shadow-cyan-500/8 md:p-16"
          >
            {/* background grid lines */}
            <div className="cta-grid-lines pointer-events-none absolute inset-0 opacity-20" />

            <p className="section-eyebrow mx-auto">Get started today</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
              Your goals deserve a real system.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Sign up free, pick a goal, and have your first daily plan ready in
              under three minutes.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {isCheckingAuth ? (
                <div className="h-14 w-48 animate-pulse rounded-2xl bg-white/10" />
              ) : isLoggedIn ? (
                <Link href="/dashboard" className="glow-cta-btn rounded-2xl px-10 py-4 text-base font-black text-slate-950">
                  Open Dashboard →
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="glow-cta-btn rounded-2xl px-10 py-4 text-base font-black text-slate-950">
                    Create free account →
                  </Link>
                  <Link href="/login" className="rounded-2xl border border-white/15 bg-white/8 px-10 py-4 text-base font-bold text-white backdrop-blur transition hover:bg-white/15">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        /* ── Core tokens ── */
        .hero-gradient-text {
          background: linear-gradient(120deg, #67e8f9, #22d3ee, #38bdf8, #818cf8);
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: textShimmer 5s linear infinite;
        }

        @keyframes textShimmer {
          0% { background-position: 0% center; }
          100% { background-position: 300% center; }
        }

        /* ── Glow CTA button ── */
        .glow-cta-btn {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #67e8f9, #22d3ee, #38bdf8);
          box-shadow: 0 0 0 0 rgba(34,211,238,0.4);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .glow-cta-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 50px rgba(34,211,238,0.28), 0 0 0 3px rgba(34,211,238,0.12);
        }
        .glow-cta-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent);
          transform: translateX(-100%);
          animation: ctaShine 3s ease-in-out infinite;
        }
        @keyframes ctaShine {
          0%, 40% { transform: translateX(-100%); }
          65% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }

        /* ── Section eyebrow ── */
        .section-eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #67e8f9;
          border: 1px solid rgba(103,232,249,0.25);
          background: rgba(103,232,249,0.08);
          border-radius: 999px;
          padding: 4px 14px;
        }

        /* ── Scroll-reveal base ── */
        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }
        [data-reveal].revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── App preview animation ── */
        .app-preview-shell {
          animation: floatPreview 5s ease-in-out infinite;
        }
        @keyframes floatPreview {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .preview-progress-bar {
          animation: growBar 1.4s cubic-bezier(0.22,1,0.36,1) 0.5s both;
        }
        @keyframes growBar {
          from { width: 0%; }
          to { width: 42%; }
        }

        /* ── Tracker card hovers ── */
        .tracker-card {
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .tracker-card:hover {
          transform: translateY(-4px);
          border-color: rgba(52,211,153,0.3);
          box-shadow: 0 24px 60px rgba(52,211,153,0.08);
        }
        .tracker-card-ai {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .tracker-card-ai:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(34,211,238,0.14);
        }

        /* ── Feature card hover ── */
        .feature-card {
          transition: transform 0.3s ease, border-color 0.3s ease, background 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(103,232,249,0.25);
          background: rgba(255,255,255,0.04);
        }

        /* ── Step card ── */
        .step-num {
          background: linear-gradient(135deg, #22d3ee, #818cf8);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          line-height: 1;
        }
        .step-card {
          transition: transform 0.3s ease;
        }
        .step-card:hover {
          transform: translateY(-4px);
        }

        /* ── Stat pill ── */
        .stat-pill {
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .stat-pill:hover {
          transform: translateY(-2px);
          border-color: rgba(34,211,238,0.3);
        }

        /* ── CTA section background grid ── */
        .cta-grid-lines {
          background-image:
            linear-gradient(rgba(34,211,238,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.08) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </>
  );
}