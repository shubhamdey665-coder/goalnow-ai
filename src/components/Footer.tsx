import Link from "next/link";

// FooterLink with inline underline animation via Tailwind group trick
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group relative inline-block text-slate-400 transition hover:text-white">
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-slate-950 px-6 py-14 text-slate-300">
      {/* top glow line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <span className="text-xl font-black tracking-tight text-white">
            GoalNow<span className="text-cyan-300">-AI</span>
          </span>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            AI goal planning, daily tracking, weekly tests, and a personal mentor
            — everything to stay consistent.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="mailto:shubhamdey665@gmail.com"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
              aria-label="Email"
            >
              ✉
            </a>
            <a
              href="https://github.com/shubhamdey665-coder/GoalNow-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
              aria-label="GitHub"
            >
              ⌥
            </a>
          </div>
        </div>

        {/* Product */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white">Product</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Create Goal", href: "/goals/new" },
              { label: "Daily Tracker", href: "/dashboard" },
              { label: "Progress Report", href: "/dashboard" },
            ].map((l) => (
              <li key={l.label}>
                <FooterLink href={l.href}>{l.label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white">Features</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { label: "AI Roadmap", href: "/dashboard" },
              { label: "AI Mentor", href: "/dashboard" },
              { label: "Weekly Test", href: "/dashboard" },
              { label: "Goal Analytics", href: "/dashboard" },
            ].map((l) => (
              <li key={l.label}>
                <FooterLink href={l.href}>{l.label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white">Company</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { label: "Home", href: "/" },
              { label: "Get Started", href: "/signup" },
              { label: "Contact", href: "mailto:shubhamdey665@gmail.com" },
              { label: "GitHub", href: "https://github.com/shubhamdey665-coder/GoalNow-AI" },
            ].map((l) => (
              <li key={l.label}>
                <FooterLink href={l.href}>{l.label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-7 text-sm text-slate-500 md:flex-row">
        <p>
          © 2026{" "}
          <span className="font-semibold text-slate-300">GoalNow-AI</span>.
          Built by Shubham Dey. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          {["Privacy Policy", "Terms", "Security"].map((t) => (
            <Link key={t} href="/" className="transition hover:text-white">
              {t}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}