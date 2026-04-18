import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/app/components/landing/Navbar";
import { Footer } from "@/app/components/landing/Footer";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Rasko",
  description:
    "Rasko Privacy Policy — understand how we collect, use, and protect your personal data.",
  alternates: {
    canonical: "https://rasko.org/privacy",
  },
  openGraph: {
    title: "Privacy Policy — Rasko",
    description: "How Rasko collects, uses, and protects your personal data.",
    url: "https://rasko.org/privacy",
  },
};

const LAST_UPDATED = "January 1, 2025";
const COMPANY_NAME = "Rasko Technologies Pvt. Ltd.";
const COMPANY_EMAIL = "privacy@rasko.org";
const COMPANY_ADDRESS =
  "Rasko Technologies Pvt. Ltd., [Registered Address], India";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />

      <main className="bg-surface-950 min-h-screen pt-24 pb-20 px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-600/10 border border-primary-500/20 text-primary-400 mb-5">
            <Shield className="w-3 h-3" />
            Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-surface-400">
            Last updated:{" "}
            <time dateTime="2025-01-01" className="text-surface-300">
              {LAST_UPDATED}
            </time>
          </p>
        </div>

        {/* Content */}
        <article className="max-w-3xl mx-auto prose prose-invert prose-sm sm:prose-base">
          <div className="bg-surface-900/60 border border-surface-800/60 rounded-2xl p-6 sm:p-8 space-y-10 text-surface-300 leading-relaxed">
            <section>
              <p className="text-surface-400 text-sm bg-primary-900/20 border border-primary-800/30 rounded-xl p-4">
                This Privacy Policy explains how {COMPANY_NAME}{" "}
                (&ldquo;Rasko&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
                &ldquo;our&rdquo;) collects, uses, shares, and protects
                information in connection with our Field Service Management
                platform available at{" "}
                <a
                  href="https://rasko.org"
                  className="text-primary-400 hover:text-primary-300 no-underline"
                >
                  rasko.org
                </a>{" "}
                (the &ldquo;Service&rdquo;). By accessing or using the Service,
                you agree to the practices described in this Policy.
              </p>
            </section>

            <Section title="1. Information We Collect">
              <p>We collect the following categories of information:</p>
              <Subsection title="1.1 Information You Provide">
                <ul>
                  <li>
                    <strong>Account Information:</strong> Name, email address,
                    phone number, and password when you register.
                  </li>
                  <li>
                    <strong>Business Information:</strong> Business name,
                    address, GSTIN, logo, and service categories.
                  </li>
                  <li>
                    <strong>Customer Data:</strong> Names, phone numbers,
                    addresses, and service history of your customers that you
                    enter into the platform.
                  </li>
                  <li>
                    <strong>Payment Information:</strong> Billing details
                    processed securely through our payment partners (Cashfree).
                    We do not store raw card or bank account data.
                  </li>
                  <li>
                    <strong>Content:</strong> Job cards, notes, photos, and
                    other content you upload or create in the Service.
                  </li>
                </ul>
              </Subsection>
              <Subsection title="1.2 Information Collected Automatically">
                <ul>
                  <li>
                    <strong>Usage Data:</strong> Pages visited, features used,
                    actions taken, and session duration.
                  </li>
                  <li>
                    <strong>Device Data:</strong> IP address, browser type,
                    operating system, and device identifiers.
                  </li>
                  <li>
                    <strong>Cookies &amp; Tracking:</strong> We use cookies and
                    similar technologies to operate and improve the Service (see
                    Section 7 below).
                  </li>
                  <li>
                    <strong>Location Data:</strong> With your permission, we may
                    collect approximate location data to assist with field
                    dispatch features.
                  </li>
                </ul>
              </Subsection>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve the Service;</li>
                <li>Process transactions and send related notices;</li>
                <li>
                  Send operational communications such as booking confirmations,
                  job updates, and account alerts;
                </li>
                <li>
                  Send WhatsApp or SMS notifications on your behalf to your
                  customers (as enabled by you);
                </li>
                <li>
                  Respond to your comments, questions, and support requests;
                </li>
                <li>
                  Send marketing communications where you have opted in (you can
                  opt out at any time);
                </li>
                <li>
                  Monitor and analyse usage patterns to improve user experience;
                </li>
                <li>
                  Detect, investigate, and prevent fraudulent transactions and
                  other illegal activities;
                </li>
                <li>Comply with legal obligations.</li>
              </ul>
            </Section>

            <Section title="3. How We Share Your Information">
              <p>
                We do not sell your personal data. We may share it in the
                following limited circumstances:
              </p>
              <ul>
                <li>
                  <strong>Service Providers:</strong> We share data with
                  third-party vendors who assist us in operating the Service
                  (e.g., cloud hosting, payment processing, analytics, email
                  delivery, WhatsApp Business API). These vendors are bound by
                  confidentiality obligations.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger,
                  acquisition, or sale of all or substantially all of our
                  assets, your data may be transferred as part of that
                  transaction.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose your
                  information when required by applicable law, court order, or
                  governmental authority, or to protect the rights, property, or
                  safety of Rasko, its users, or others.
                </li>
                <li>
                  <strong>Consent:</strong> We may share your information with
                  your explicit consent.
                </li>
              </ul>
            </Section>

            <Section title="4. Data Storage and Security">
              <p>
                Your data is stored on secure servers in India. We implement
                industry-standard technical and organisational measures to
                protect your information against unauthorised access,
                alteration, disclosure, or destruction. These measures include:
              </p>
              <ul>
                <li>Encryption of data in transit (TLS/HTTPS);</li>
                <li>Encryption of sensitive data at rest;</li>
                <li>Role-based access controls;</li>
                <li>Regular security assessments.</li>
              </ul>
              <p>
                Despite our best efforts, no method of transmission over the
                internet or electronic storage is 100% secure. You are
                responsible for maintaining the security of your account
                credentials.
              </p>
            </Section>

            <Section title="5. Data Retention">
              <p>
                We retain your personal data for as long as your account is
                active or as needed to provide the Service. If you delete your
                account, we will delete or anonymise your personal data within
                90 days, except where we are required to retain it to comply
                with legal obligations, resolve disputes, or enforce our
                agreements.
              </p>
            </Section>

            <Section title="6. Your Rights">
              <p>
                Subject to applicable law, you have the following rights
                regarding your personal data:
              </p>
              <ul>
                <li>
                  <strong>Access:</strong> Request a copy of the personal data
                  we hold about you.
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  or incomplete data.
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  data (&ldquo;right to be forgotten&rdquo;), subject to legal
                  obligations.
                </li>
                <li>
                  <strong>Portability:</strong> Request a machine-readable copy
                  of your data.
                </li>
                <li>
                  <strong>Objection:</strong> Object to processing of your data
                  for direct marketing purposes.
                </li>
                <li>
                  <strong>Withdrawal of Consent:</strong> Where processing is
                  based on consent, you may withdraw consent at any time.
                </li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{" "}
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="text-primary-400 hover:text-primary-300"
                >
                  {COMPANY_EMAIL}
                </a>
                . We will respond within 30 days.
              </p>
            </Section>

            <Section title="7. Cookies">
              <p>
                We use cookies and similar tracking technologies to operate the
                Service and understand how users interact with it. Cookies we
                use include:
              </p>
              <ul>
                <li>
                  <strong>Essential Cookies:</strong> Required for the Service
                  to function (e.g., authentication tokens, session management).
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Used to understand
                  aggregate usage patterns (e.g., page views, feature usage).
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings
                  and preferences.
                </li>
              </ul>
              <p>
                You can control cookies through your browser settings. Disabling
                essential cookies will impair the functionality of the Service.
              </p>
            </Section>

            <Section title="8. Third-Party Services">
              <p>
                The Service integrates with or links to third-party services:
              </p>
              <ul>
                <li>
                  <strong>Supabase:</strong> Database and authentication
                  infrastructure.
                </li>
                <li>
                  <strong>Cashfree Payments:</strong> Payment processing for
                  subscriptions.
                </li>
                <li>
                  <strong>Amazon Web Services (AWS):</strong> File and media
                  storage.
                </li>
                <li>
                  <strong>WhatsApp Business API:</strong> Customer notification
                  delivery.
                </li>
                <li>
                  <strong>Google Maps API:</strong> Location and mapping
                  features.
                </li>
              </ul>
              <p>
                These services have their own privacy policies, and we encourage
                you to review them.
              </p>
            </Section>

            <Section title="9. Children's Privacy">
              <p>
                The Service is not directed to children under the age of 18. We
                do not knowingly collect personal information from children. If
                we become aware that a child has provided us with personal data,
                we will take steps to delete such data promptly.
              </p>
            </Section>

            <Section title="10. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of material changes by posting the updated policy on
                this page with a revised &ldquo;Last updated&rdquo; date. Where
                required by applicable law, we will also notify you by email or
                in-app notice. Your continued use of the Service after the
                effective date of the updated policy constitutes your acceptance
                of the changes.
              </p>
            </Section>

            <Section title="11. Contact Us">
              <p>
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="bg-surface-800/50 border border-surface-700/40 rounded-xl p-4 text-sm space-y-1">
                <p className="font-semibold text-white">{COMPANY_NAME}</p>
                <p>{COMPANY_ADDRESS}</p>
                <p>
                  Email:{" "}
                  <a
                    href={`mailto:${COMPANY_EMAIL}`}
                    className="text-primary-400 hover:text-primary-300"
                  >
                    {COMPANY_EMAIL}
                  </a>
                </p>
              </div>
            </Section>

            {/* Nav to Terms */}
            <div className="pt-4 border-t border-surface-800/60 flex flex-wrap gap-4 text-sm">
              <Link
                href="/terms"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                View Terms &amp; Conditions →
              </Link>
              <Link
                href="/"
                className="text-surface-500 hover:text-surface-300 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-surface-800/60">
        {title}
      </h2>
      <div className="space-y-3 text-surface-400">{children}</div>
    </section>
  );
}

function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <h3 className="text-base font-semibold text-surface-300 mb-2">{title}</h3>
      <div className="text-surface-400">{children}</div>
    </div>
  );
}
