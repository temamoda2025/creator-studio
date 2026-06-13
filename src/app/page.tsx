import Link from "next/link";
import Nav from "@/components/Nav";

const features = [
  {
    number: "01",
    title: "Content Research",
    description:
      "Discover what's already going viral on Instagram and TikTok by niche or keyword — so you always know what to create next.",
  },
  {
    number: "02",
    title: "ADORAR™ Content Generator",
    description:
      "Generate scroll-stopping captions in each brand's unique voice using our proprietary ADORAR™ framework — trained on the world's best copywriters.",
  },
  {
    number: "03",
    title: "Multi-Brand Management",
    description:
      "Manage up to 10 client brands in one place. Switch brands instantly and keep every voice, tone, and strategy completely separate.",
  },
  {
    number: "04",
    title: "Brand Blueprint",
    description:
      "AI-generated brand strategy using the Ikigai framework — defining voice, pillars, and positioning so every post feels unmistakably on-brand.",
  },
  {
    number: "05",
    title: "Reel Script Generator",
    description:
      "Coming soon — generate high-converting Reel scripts tailored to each brand's niche and audience, ready to film.",
  },
  {
    number: "06",
    title: "Content Calendar & Scheduling",
    description:
      "Coming soon — plan, schedule, and publish across Instagram and TikTok from a single agency-grade calendar.",
  },
];

const steps = [
  {
    step: "01",
    title: "Research what works",
    body: "Search by niche or keyword and instantly surface the viral content your audience is already engaging with.",
  },
  {
    step: "02",
    title: "Set up your brands",
    body: "Add your clients, complete the Brand Blueprint, and let the AI learn each brand's unique voice and positioning.",
  },
  {
    step: "03",
    title: "Create your version faster",
    body: "Use ADORAR™ to generate original content inspired by what's working — in the right voice, every time.",
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
            Creator Studio — Agency Platform
          </p>
          <h1 className="text-5xl sm:text-7xl font-semibold leading-[1.05] tracking-tight mb-8">
            Find what works. Create your version faster.
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
            The AI-powered platform that discovers viral content in any niche, then helps you create original content for every client brand — in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="bg-white text-black text-sm font-medium px-8 py-3.5 rounded-full hover:bg-white/90 transition-colors"
            >
              Set up your first brand
            </Link>
            <Link
              href="/dashboard"
              className="text-white/60 text-sm hover:text-white transition-colors"
            >
              Go to dashboard →
            </Link>
          </div>
        </div>

        <div className="mt-24 w-full max-w-6xl mx-auto border-t border-white/10 pt-10 grid grid-cols-3 gap-8 text-center pb-16">
          {[
            { stat: "10", label: "client brands per workspace" },
            { stat: "2 platforms", label: "Instagram & TikTok research" },
            { stat: "ADORAR™", label: "proprietary content framework" },
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
          <h2 className="text-4xl font-semibold tracking-tight mb-16 max-w-md">
            Everything an agency needs. Nothing it doesn&apos;t.
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
            From research to publish in three steps.
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
              Ready to scale your content?
            </h2>
            <p className="text-sm text-black/50">
              Set up your first brand in under 5 minutes.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="shrink-0 bg-black text-white text-sm font-medium px-8 py-3.5 rounded-full hover:bg-black/80 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-widest uppercase">Creator Studio</p>
          <p className="text-xs text-black/40">
            © 2026 Creator Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
