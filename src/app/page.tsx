import Link from "next/link";
import Nav from "@/components/Nav";

const features = [
  {
    number: "01",
    title: "Brand Blueprint",
    description:
      "Define your visual identity, tone of voice, and content pillars so every post feels unmistakably you.",
  },
  {
    number: "02",
    title: "Content Strategy",
    description:
      "Build a repeatable posting system around your niche — from Reels to carousels, always with intention.",
  },
  {
    number: "03",
    title: "Growth Dashboard",
    description:
      "Track engagement, follower growth, and content performance in one clean, distraction-free view.",
  },
  {
    number: "04",
    title: "Caption & Hook Studio",
    description:
      "Craft captions that stop the scroll. Generate hooks, CTAs, and hashtag sets aligned to your brand voice.",
  },
];

const steps = [
  {
    step: "01",
    title: "Tell us about your brand",
    body: "Answer a short onboarding sequence to map your niche, aesthetic, and audience.",
  },
  {
    step: "02",
    title: "Get your Blueprint",
    body: "Receive a tailored brand document — your north star for every piece of content.",
  },
  {
    step: "03",
    title: "Create with confidence",
    body: "Use your dashboard to plan, draft, and publish content that compounds over time.",
  },
];

export default function LandingPage() {
  return (
    <>
      <Nav />

      {/* Hero */}
      <section className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 pt-14">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-6">
            Tema Moda — Creator Studio
          </p>
          <h1 className="text-5xl sm:text-7xl font-semibold leading-[1.05] tracking-tight mb-8">
            Build an Instagram brand that actually sells.
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
            From brand blueprint to content calendar — everything a fashion creator
            needs to grow with clarity and consistency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="bg-white text-black text-sm font-medium px-8 py-3.5 rounded-full hover:bg-white/90 transition-colors"
            >
              Start your studio
            </Link>
            <Link
              href="/brand"
              className="text-white/60 text-sm hover:text-white transition-colors"
            >
              View sample blueprint →
            </Link>
          </div>
        </div>

        <div className="mt-24 w-full max-w-6xl mx-auto border-t border-white/10 pt-10 grid grid-cols-3 gap-8 text-center pb-16">
          {[
            { stat: "3×", label: "avg engagement lift" },
            { stat: "90 days", label: "to brand clarity" },
            { stat: "100%", label: "built for fashion creators" },
          ].map(({ stat, label }) => (
            <div key={label}>
              <p className="text-3xl font-semibold text-white">{stat}</p>
              <p className="text-sm text-white/40 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-black/30 mb-4">
            What&apos;s inside
          </p>
          <h2 className="text-4xl font-semibold tracking-tight mb-16 max-w-sm">
            Everything in one studio.
          </h2>
          <div className="grid sm:grid-cols-2 gap-px bg-black/10 border border-black/10">
            {features.map(({ number, title, description }) => (
              <div key={number} className="bg-white p-10">
                <p className="text-xs font-mono text-black/30 mb-4">{number}</p>
                <h3 className="text-lg font-semibold mb-3">{title}</h3>
                <p className="text-sm text-black/50 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28 px-6 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-4">
            How it works
          </p>
          <h2 className="text-4xl font-semibold tracking-tight mb-20">
            Three steps to your brand.
          </h2>
          <div className="grid sm:grid-cols-3 gap-12">
            {steps.map(({ step, title, body }) => (
              <div key={step} className="border-t border-white/20 pt-8">
                <p className="text-xs font-mono text-white/30 mb-6">{step}</p>
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8 border border-black p-12">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight mb-2">
              Ready to build your brand?
            </h2>
            <p className="text-sm text-black/50">
              Takes less than 5 minutes to get your Blueprint.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="shrink-0 bg-black text-white text-sm font-medium px-8 py-3.5 rounded-full hover:bg-black/80 transition-colors"
          >
            Start for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-widest uppercase">Tema Moda</p>
          <p className="text-xs text-black/40">
            © 2026 Tema Moda Creator Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
