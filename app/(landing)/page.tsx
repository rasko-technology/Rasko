import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ClipboardList,
  Calendar,
  Users,
  BarChart3,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  Star,
  ChevronDown,
  PhoneCall,
  Wrench,
  MapPin,
  Bell,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Navbar } from "@/app/components/landing/Navbar";
import { Footer } from "@/app/components/landing/Footer";

export const metadata: Metadata = {
  title: "Rasko — Field Service Management & CRM for Service Businesses",
  description:
    "Rasko is the complete FSM + CRM platform for service businesses. Manage leads, bookings, job cards, and employees — all in one place. Start your free 30-day trial today.",
  keywords: [
    "field service management",
    "FSM software",
    "CRM for service businesses",
    "job card management",
    "booking management",
    "lead management",
    "employee management",
    "service business software",
    "appliance repair software",
    "HVAC management software",
  ],
  openGraph: {
    title: "Rasko — Field Service Management & CRM",
    description:
      "The complete operations platform for field service businesses. Manage leads, bookings, job cards, and teams without the chaos.",
    url: "https://rasko.org",
    siteName: "Rasko",
    images: [
      {
        url: "https://rasko.org/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rasko — Field Service Management",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rasko — Field Service Management & CRM",
    description:
      "The complete operations platform for field service businesses.",
    images: ["https://rasko.org/og-image.png"],
    creator: "@raskohq",
  },
  alternates: {
    canonical: "https://rasko.org",
  },
};

const FEATURES = [
  {
    icon: PhoneCall,
    title: "Lead Management",
    description:
      "Capture every inquiry from calls, WhatsApp, and forms. Never miss a potential customer again with smart lead tracking.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Calendar,
    title: "Smart Booking System",
    description:
      "Schedule service visits effortlessly. Assign technicians, set time slots, and send automatic confirmations to customers.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: ClipboardList,
    title: "Job Card Management",
    description:
      "Create detailed job cards with parts, labour, photos and signatures. Track every job from start to finish.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Users,
    title: "Employee Management",
    description:
      "Onboard technicians, assign roles, and track field performance. Your team always knows what to do next.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Bell,
    title: "WhatsApp Notifications",
    description:
      "Keep customers informed at every step with automated WhatsApp updates — booking confirmations, reminders, and receipts.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Understand your business at a glance. Revenue trends, technician performance, and customer insights in real-time.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Set Up Your Business",
    description:
      "Sign up, add your service categories, team members, and pricing in minutes. No IT expertise needed.",
    icon: Wrench,
  },
  {
    step: "02",
    title: "Manage Every Job",
    description:
      "Capture leads, schedule bookings, dispatch technicians, and generate job cards — all from one dashboard.",
    icon: ClipboardList,
  },
  {
    step: "03",
    title: "Grow with Insights",
    description:
      "Use real-time analytics to spot opportunities, improve service quality, and grow your revenue month on month.",
    icon: TrendingUp,
  },
];

const TESTIMONIALS = [
  {
    name: "Rakesh Sharma",
    role: "Owner, CoolBreeze AC Services",
    location: "Hyderabad",
    avatar: "RS",
    text: "Rasko transformed how we handle bookings. We used to miss leads all the time — now every call gets logged and followed up. Our revenue went up 40% in 3 months.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Director, FixIt Home Solutions",
    location: "Bangalore",
    avatar: "PN",
    text: "The job card feature is a game-changer. Our technicians fill them out on mobile and customers get WhatsApp updates automatically. Zero paperwork drama.",
    rating: 5,
  },
  {
    name: "Mohammed Aslam",
    role: "Founder, QuickFix Appliances",
    location: "Chennai",
    avatar: "MA",
    text: "Finally, software built for Indian service businesses. The pricing is fair and the support team actually responds. We manage 200+ jobs a month on Rasko.",
    rating: 5,
  },
];

const FAQS = [
  {
    q: "What is included in the free trial?",
    a: "The 30-day free trial includes full access to all features — leads, bookings, job cards, employee management, and WhatsApp notifications. No credit card required.",
  },
  {
    q: "Can I use Rasko on mobile?",
    a: "Yes! Rasko is fully responsive and works on any smartphone or tablet. Your field technicians can update job cards, capture customer signatures, and upload photos directly from their phones.",
  },
  {
    q: "How many employees can I add?",
    a: "All paid plans include unlimited employee accounts. Add as many technicians, supervisors, and office staff as your business needs.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All data is encrypted in transit and at rest, stored on secure servers in India. We follow industry best practices and comply with applicable data protection regulations.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no lock-in contracts. You can cancel your subscription at any time from your account settings, and you'll retain access until the end of your billing period.",
  },
  {
    q: "Do you support GST invoicing?",
    a: "GST-compliant invoicing is on our roadmap and will be available soon. You can currently generate job cards and service receipts that include all relevant details.",
  },
];

const STATS = [
  { value: "500+", label: "Businesses trust Rasko" },
  { value: "50,000+", label: "Jobs managed" },
  { value: "98%", label: "Customer satisfaction" },
  { value: "4.9★", label: "Average rating" },
];

const INDUSTRIES = [
  "AC & Refrigeration",
  "Plumbing",
  "Electrical",
  "Home Appliances",
  "Pest Control",
  "Cleaning Services",
  "CCTV & Security",
  "Painting",
];

export default function LandingPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://rasko.org/#organization",
                name: "Rasko Technologies Pvt. Ltd.",
                url: "https://rasko.org",
                logo: {
                  "@type": "ImageObject",
                  url: "https://rasko.org/logo.png",
                },
                sameAs: [
                  "https://twitter.com/raskohq",
                  "https://linkedin.com/company/rasko",
                  "https://instagram.com/raskohq",
                ],
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+91-800-000-0000",
                  contactType: "customer support",
                  availableLanguage: ["English", "Hindi"],
                },
              },
              {
                "@type": "SoftwareApplication",
                "@id": "https://rasko.org/#software",
                name: "Rasko",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web, iOS, Android",
                description:
                  "Complete Field Service Management and CRM platform for service businesses. Manage leads, bookings, job cards, employees and customers.",
                offers: [
                  {
                    "@type": "Offer",
                    name: "Monthly Plan",
                    price: "599",
                    priceCurrency: "INR",
                    priceSpecification: {
                      "@type": "UnitPriceSpecification",
                      price: "599",
                      priceCurrency: "INR",
                      unitCode: "MON",
                    },
                  },
                  {
                    "@type": "Offer",
                    name: "Yearly Plan",
                    price: "5999",
                    priceCurrency: "INR",
                    priceSpecification: {
                      "@type": "UnitPriceSpecification",
                      price: "5999",
                      priceCurrency: "INR",
                      unitCode: "ANN",
                    },
                  },
                ],
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.9",
                  reviewCount: "312",
                  bestRating: "5",
                },
              },
              {
                "@type": "WebSite",
                "@id": "https://rasko.org/#website",
                url: "https://rasko.org",
                name: "Rasko",
                description:
                  "Field Service Management & CRM for Service Businesses",
                publisher: { "@id": "https://rasko.org/#organization" },
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate:
                      "https://rasko.org/search?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ],
          }),
        }}
      />

      <Navbar />

      <main className="overflow-x-hidden">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section
          id="hero"
          className="relative min-h-screen flex flex-col items-center justify-center bg-surface-950 pt-28 md:pt-40 pb-16 px-4 overflow-hidden"
        >
          {/* Background gradient blobs */}
          <div
            aria-hidden
            className="absolute -top-40 -left-40 w-150 h-150 rounded-full bg-primary-600/20 blur-[120px] animate-pulse"
          />
          <div
            aria-hidden
            className="absolute -bottom-40 -right-20 w-125 h-125 rounded-full bg-violet-600/15 blur-[120px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 rounded-full bg-primary-900/30 blur-[100px]"
          />

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary-600/15 border border-primary-500/30 text-primary-300 mb-8 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5" />
              30-day Free Trial — No Credit Card Required
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              From First Lead
              <br />
              <span className="bg-linear-to-r from-primary-400 via-violet-400 to-primary-300 bg-clip-text text-transparent">
                to Closed Job
              </span>
              <br />
              All in One Place
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Rasko is the complete operations platform for field service
              businesses. Manage leads, bookings, job cards, and teams — without
              spreadsheets or WhatsApp chaos.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold bg-primary-600 hover:bg-primary-500 text-white transition-all duration-200 shadow-2xl shadow-primary-600/40 hover:shadow-primary-500/50 hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold text-white border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-200 backdrop-blur-sm"
              >
                See How It Works
              </a>
            </div>

            {/* Social proof mini row */}
            <div className="flex items-center justify-center gap-2 text-sm text-surface-500">
              <div className="flex -space-x-2">
                {[
                  "bg-primary-600",
                  "bg-violet-600",
                  "bg-emerald-600",
                  "bg-orange-600",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full ${bg} border-2 border-surface-950 flex items-center justify-center text-[10px] font-bold text-white`}
                  >
                    {["R", "P", "M", "S"][i]}
                  </div>
                ))}
              </div>
              <span>
                Join <strong className="text-surface-300">500+</strong> service
                businesses already on Rasko
              </span>
            </div>
          </div>

          {/* Hero dashboard mockup */}
          <div className="relative z-10 mt-16 max-w-5xl w-full mx-auto">
            <div className="bg-surface-900/60 backdrop-blur-xl border border-surface-700/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-700/50 bg-surface-900/80">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="flex-1 mx-3">
                  <div className="h-5 rounded-md bg-surface-800 px-3 flex items-center">
                    <span className="text-[11px] text-surface-500">
                      app.rasko.org/dashboard
                    </span>
                  </div>
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Stat cards */}
                {[
                  {
                    label: "Open Leads",
                    value: "24",
                    delta: "+3 today",
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                  },
                  {
                    label: "Today's Bookings",
                    value: "8",
                    delta: "4 assigned",
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                  },
                  {
                    label: "Active Jobs",
                    value: "12",
                    delta: "2 pending",
                    color: "text-violet-400",
                    bg: "bg-violet-500/10",
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className={`${card.bg} rounded-xl p-4 border border-surface-700/30`}
                  >
                    <p className="text-xs text-surface-500 mb-1">
                      {card.label}
                    </p>
                    <p className={`text-2xl font-bold ${card.color}`}>
                      {card.value}
                    </p>
                    <p className="text-xs text-surface-500 mt-1">
                      {card.delta}
                    </p>
                  </div>
                ))}

                {/* Job list mockup */}
                <div className="sm:col-span-2 bg-surface-800/50 rounded-xl p-4 border border-surface-700/30">
                  <p className="text-xs font-semibold text-surface-400 mb-3 uppercase tracking-wider">
                    Recent Jobs
                  </p>
                  <div className="space-y-2.5">
                    {[
                      {
                        id: "JC-1042",
                        customer: "Anand Kumar",
                        service: "AC Repair",
                        status: "In Progress",
                        dot: "bg-yellow-400",
                      },
                      {
                        id: "JC-1041",
                        customer: "Suresh M.",
                        service: "RO Installation",
                        status: "Completed",
                        dot: "bg-emerald-400",
                      },
                      {
                        id: "JC-1040",
                        customer: "Kavya R.",
                        service: "Washing Machine",
                        status: "Assigned",
                        dot: "bg-blue-400",
                      },
                    ].map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between py-2 border-b border-surface-700/30 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-surface-500">
                            {job.id}
                          </span>
                          <div>
                            <p className="text-sm text-white font-medium">
                              {job.customer}
                            </p>
                            <p className="text-xs text-surface-500">
                              {job.service}
                            </p>
                          </div>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-surface-400">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${job.dot}`}
                          />
                          {job.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="bg-surface-800/50 rounded-xl p-4 border border-surface-700/30">
                  <p className="text-xs font-semibold text-surface-400 mb-3 uppercase tracking-wider">
                    Quick Actions
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        label: "New Lead",
                        icon: PhoneCall,
                        color: "text-blue-400",
                      },
                      {
                        label: "Book Service",
                        icon: Calendar,
                        color: "text-violet-400",
                      },
                      {
                        label: "Create Job Card",
                        icon: FileText,
                        color: "text-emerald-400",
                      },
                    ].map(({ label, icon: Icon, color }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-700/50 cursor-default"
                      >
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-sm text-surface-300">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-primary-600/20 blur-2xl rounded-full" />
          </div>

          {/* Scroll indicator */}
          <a
            href="#stats"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-surface-600 hover:text-surface-400 transition-colors animate-bounce"
            aria-label="Scroll down"
          >
            <ChevronDown className="w-6 h-6" />
          </a>
        </section>

        {/* ── STATS BAR ───────────────────────────────────────────────── */}
        <section
          id="stats"
          className="bg-surface-900 border-y border-surface-800/60 py-12 px-4"
        >
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-white mb-1">
                  {value}
                </p>
                <p className="text-sm text-surface-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── INDUSTRIES ──────────────────────────────────────────────── */}
        <section className="bg-surface-950 py-12 px-4 overflow-hidden border-b border-surface-800/40">
          <p className="text-center text-sm text-surface-600 mb-6 uppercase tracking-widest">
            Built for every service industry
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {INDUSTRIES.map((ind) => (
              <span
                key={ind}
                className="px-4 py-2 rounded-full text-sm text-surface-400 border border-surface-800 bg-surface-900/60 hover:border-primary-700/50 hover:text-primary-400 transition-colors"
              >
                {ind}
              </span>
            ))}
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────────── */}
        <section
          id="features"
          className="bg-surface-950 py-24 px-4 scroll-mt-16"
        >
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-600/10 border border-primary-500/20 text-primary-400 mb-4">
                <Shield className="w-3 h-3" />
                Everything you need
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                One platform.
                <br />
                <span className="text-surface-500">Zero chaos.</span>
              </h2>
              <p className="text-lg text-surface-400 max-w-2xl mx-auto">
                Every tool your service business needs, designed to work
                together seamlessly from day one.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
                <div
                  key={title}
                  className="group relative bg-surface-900/60 border border-surface-800/60 rounded-2xl p-6 hover:border-surface-700 hover:bg-surface-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-surface-950/50"
                >
                  <div
                    className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${bg} mb-5`}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-surface-500 leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="bg-surface-900/40 border-y border-surface-800/40 py-24 px-4 scroll-mt-16"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
                <Zap className="w-3 h-3" />
                Simple to get started
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                Up and running
                <br />
                <span className="text-surface-500">in under 10 minutes</span>
              </h2>
              <p className="text-lg text-surface-400 max-w-xl mx-auto">
                No implementation partner. No setup fees. Just sign up and start
                managing jobs.
              </p>
            </div>

            <div className="relative">
              {/* Connector line */}
              <div className="hidden lg:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-linear-to-r from-primary-600/30 via-primary-600/60 to-primary-600/30" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
                {HOW_IT_WORKS.map(
                  ({ step, title, description, icon: Icon }, i) => (
                    <div
                      key={step}
                      className="flex flex-col items-center text-center lg:items-start lg:text-left"
                    >
                      <div className="relative mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary-600/15 border border-primary-500/30 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary-400" />
                        </div>
                        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-600 text-white text-[10px] font-black flex items-center justify-center">
                          {i + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {title}
                      </h3>
                      <p className="text-sm text-surface-500 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-500 text-white transition-all shadow-lg shadow-primary-600/25 hover:-translate-y-px"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────────────── */}
        <section
          id="pricing"
          className="bg-surface-950 py-24 px-4 scroll-mt-16"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-4">
                Simple pricing
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                Honest pricing.
                <br />
                <span className="text-surface-500">No surprises.</span>
              </h2>
              <p className="text-lg text-surface-400 max-w-xl mx-auto">
                Start free for 30 days. Upgrade when you&apos;re ready. All
                plans include every feature.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Trial */}
              <div className="bg-surface-900/60 border border-surface-800 rounded-2xl p-6 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">
                    Free Trial
                  </h3>
                  <p className="text-sm text-surface-500">
                    Get started risk-free
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">₹0</span>
                  <span className="text-surface-500 text-sm ml-1">
                    / 30 days
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "All features included",
                    "Up to 5 team members",
                    "Unlimited leads & bookings",
                    "Job card management",
                    "Email support",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-surface-400"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3 rounded-xl text-sm font-semibold text-center border border-surface-700 text-surface-300 hover:border-surface-600 hover:text-white transition-all"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Monthly */}
              <div className="bg-surface-900/60 border border-surface-800 rounded-2xl p-6 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">Monthly</h3>
                  <p className="text-sm text-surface-500">
                    Flexible, cancel anytime
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">₹599</span>
                  <span className="text-surface-500 text-sm ml-1">/ month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "All features included",
                    "Unlimited team members",
                    "Unlimited leads & bookings",
                    "WhatsApp notifications",
                    "Priority support",
                    "Customer reports",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-surface-400"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3 rounded-xl text-sm font-semibold text-center bg-surface-800 hover:bg-surface-700 text-white transition-all"
                >
                  Get Started
                </Link>
              </div>

              {/* Yearly — highlighted */}
              <div className="relative bg-linear-to-b from-primary-900/40 to-surface-900/60 border-2 border-primary-600/60 rounded-2xl p-6 flex flex-col shadow-2xl shadow-primary-600/10">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-bold bg-primary-600 text-white shadow-lg shadow-primary-600/30">
                    Best Value — Save 30%
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">Yearly</h3>
                  <p className="text-sm text-surface-400">
                    Best value for growing teams
                  </p>
                </div>
                <div className="mb-1">
                  <span className="text-4xl font-black text-white">₹5,999</span>
                  <span className="text-surface-400 text-sm ml-1">/ year</span>
                </div>
                <p className="text-xs text-emerald-400 mb-6">
                  That&apos;s just ₹500/month · Save ₹1,189 annually
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Everything in Monthly",
                    "Priority support",
                    "Advanced analytics",
                    "Custom print templates",
                    "API access",
                    "Dedicated account manager",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-surface-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3 rounded-xl text-sm font-semibold text-center bg-primary-600 hover:bg-primary-500 text-white transition-all shadow-lg shadow-primary-600/25 hover:-translate-y-px"
                >
                  Get Started — ₹5,999/yr
                </Link>
              </div>
            </div>

            <p className="text-center text-sm text-surface-600 mt-8">
              All prices are exclusive of GST. Secure payments via Cashfree.
            </p>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────────────────── */}
        <section className="bg-surface-900/40 border-y border-surface-800/40 py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Loved by service businesses
                <br />
                <span className="text-surface-500">across India</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(
                ({ name, role, location, avatar, text, rating }) => (
                  <div
                    key={name}
                    className="bg-surface-900/80 border border-surface-800/60 rounded-2xl p-6 flex flex-col hover:border-surface-700 transition-colors"
                  >
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-surface-300 leading-relaxed flex-1 mb-6">
                      &ldquo;{text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-xs font-bold text-primary-400">
                        {avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {name}
                        </p>
                        <p className="text-xs text-surface-500">
                          {role} · {location}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section className="bg-surface-950 py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Frequently asked questions
              </h2>
              <p className="text-surface-400">
                Can&apos;t find what you&apos;re looking for?{" "}
                <a
                  href="mailto:hello@rasko.org"
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Ask us directly.
                </a>
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map(({ q, a }) => (
                <details
                  key={q}
                  className="group bg-surface-900/60 border border-surface-800/60 rounded-2xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-6 py-5 cursor-pointer text-white font-medium text-sm list-none select-none hover:bg-surface-800/30 transition-colors">
                    {q}
                    <ChevronDown className="w-4 h-4 text-surface-500 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-5 text-sm text-surface-400 leading-relaxed border-t border-surface-800/40 pt-4">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ───────────────────────────────────────────────── */}
        <section className="relative bg-surface-900 border-t border-surface-800/60 py-24 px-4 overflow-hidden">
          {/* Glow */}
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-150 h-75 rounded-full bg-primary-600/15 blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-600/10 border border-primary-500/20 text-primary-400 mb-6">
              <MapPin className="w-3 h-3" />
              Trusted by service businesses across India
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Ready to take control
              <br />
              of your business?
            </h2>
            <p className="text-lg text-surface-400 mb-10 max-w-xl mx-auto">
              Start your free 30-day trial today. No credit card required. Set
              up in under 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold bg-primary-600 hover:bg-primary-500 text-white transition-all duration-200 shadow-2xl shadow-primary-600/30 hover:shadow-primary-500/40 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="mailto:hello@rasko.org"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-medium text-surface-300 hover:text-white border border-surface-700 hover:border-surface-600 transition-all"
              >
                Talk to us
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-surface-500">
              {[
                "No credit card required",
                "30-day free trial",
                "Cancel anytime",
                "Data hosted in India",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500/70" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
