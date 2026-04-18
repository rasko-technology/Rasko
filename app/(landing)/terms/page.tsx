import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/app/components/landing/Navbar";
import { Footer } from "@/app/components/landing/Footer";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions — Rasko",
  description:
    "Rasko Terms & Conditions — the legal agreement governing your use of the Rasko platform.",
  alternates: {
    canonical: "https://rasko.org/terms",
  },
  openGraph: {
    title: "Terms & Conditions — Rasko",
    description: "Legal terms governing your use of the Rasko platform.",
    url: "https://rasko.org/terms",
  },
};

const LAST_UPDATED = "January 1, 2025";
const COMPANY_NAME = "Rasko Technologies Pvt. Ltd.";
const COMPANY_EMAIL = "legal@rasko.org";

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <main className="bg-surface-950 min-h-screen pt-24 pb-20 px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-600/10 border border-primary-500/20 text-primary-400 mb-5">
            <FileText className="w-3 h-3" />
            Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-surface-400">
            Last updated:{" "}
            <time dateTime="2025-01-01" className="text-surface-300">
              {LAST_UPDATED}
            </time>
          </p>
        </div>

        {/* Content */}
        <article className="max-w-3xl mx-auto">
          <div className="bg-surface-900/60 border border-surface-800/60 rounded-2xl p-6 sm:p-8 space-y-10 text-surface-300 leading-relaxed">
            <section>
              <p className="text-surface-400 text-sm bg-primary-900/20 border border-primary-800/30 rounded-xl p-4">
                Please read these Terms and Conditions (&ldquo;Terms&rdquo;)
                carefully before using the Rasko platform operated by{" "}
                {COMPANY_NAME} (&ldquo;Rasko&rdquo;, &ldquo;we&rdquo;,
                &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing or using
                our Service, you agree to be bound by these Terms. If you do not
                agree, please do not use the Service.
              </p>
            </section>

            <Section title="1. Definitions">
              <ul>
                <li>
                  <strong>&ldquo;Service&rdquo;</strong> refers to the Rasko web
                  application, APIs, and related software available at
                  rasko.org.
                </li>
                <li>
                  <strong>&ldquo;User&rdquo;</strong> means any individual or
                  business entity that registers for or uses the Service.
                </li>
                <li>
                  <strong>&ldquo;Subscriber&rdquo;</strong> means a User who has
                  subscribed to a paid plan.
                </li>
                <li>
                  <strong>&ldquo;Content&rdquo;</strong> means any data, text,
                  images, documents, or other materials you submit, post, or
                  display through the Service.
                </li>
                <li>
                  <strong>&ldquo;Subscription Plan&rdquo;</strong> refers to the
                  monthly or yearly plans offered by Rasko.
                </li>
              </ul>
            </Section>

            <Section title="2. Eligibility and Account Registration">
              <ul>
                <li>
                  You must be at least 18 years old and have the legal capacity
                  to enter into a binding agreement to use the Service.
                </li>
                <li>
                  You must provide accurate and complete information when
                  creating your account. You are responsible for maintaining the
                  confidentiality of your credentials.
                </li>
                <li>
                  You are responsible for all activities that occur under your
                  account.
                </li>
                <li>
                  One person or legal entity may not maintain more than one free
                  account. Registered users may maintain multiple paid accounts
                  for different businesses.
                </li>
              </ul>
            </Section>

            <Section title="3. Free Trial">
              <p>
                Rasko offers a 30-day free trial of the Service without
                requiring payment information. Upon expiry of the free trial
                period:
              </p>
              <ul>
                <li>
                  You will need to subscribe to a paid plan to continue
                  accessing the Service.
                </li>
                <li>
                  Your data will be retained for 30 days after trial expiry,
                  after which it may be deleted if no paid subscription is
                  activated.
                </li>
                <li>
                  Rasko reserves the right to modify or discontinue the free
                  trial offer at any time without notice.
                </li>
              </ul>
            </Section>

            <Section title="4. Subscription Plans and Payments">
              <Subsection title="4.1 Plans">
                <p>
                  Rasko offers Monthly (₹599/month + GST) and Yearly
                  (₹5,999/year + GST) subscription plans. All plan features are
                  described on our Pricing page.
                </p>
              </Subsection>
              <Subsection title="4.2 Billing">
                <ul>
                  <li>
                    Subscriptions are charged in advance on a recurring basis
                    (monthly or yearly) through our payment partner, Cashfree
                    Payments.
                  </li>
                  <li>
                    You authorise Rasko to charge your selected payment method
                    for the subscription fee on the applicable billing date.
                  </li>
                  <li>
                    All prices are in Indian Rupees (INR) and exclusive of
                    applicable taxes (including GST at 18%).
                  </li>
                </ul>
              </Subsection>
              <Subsection title="4.3 Failed Payments">
                <p>
                  If payment fails, we will attempt to retry the charge. If the
                  payment remains unsuccessful after reasonable attempts, your
                  account may be suspended or downgraded.
                </p>
              </Subsection>
              <Subsection title="4.4 Price Changes">
                <p>
                  We reserve the right to change subscription prices. We will
                  provide at least 30 days&apos; notice before any price
                  increase takes effect. Continued use of the Service after the
                  effective date constitutes acceptance of the new pricing.
                </p>
              </Subsection>
            </Section>

            <Section title="5. Cancellation and Refunds">
              <Subsection title="5.1 Cancellation by You">
                <p>
                  You may cancel your subscription at any time from your account
                  settings. Cancellation takes effect at the end of the current
                  billing period. You will retain access to the Service until
                  that date.
                </p>
              </Subsection>
              <Subsection title="5.2 Refund Policy">
                <p>
                  All subscription fees are non-refundable except where required
                  by applicable law. We do not provide pro-rated refunds for
                  unused portions of a billing period. If you believe you were
                  charged in error, contact us within 7 days at{" "}
                  <a
                    href={`mailto:${COMPANY_EMAIL}`}
                    className="text-primary-400 hover:text-primary-300"
                  >
                    {COMPANY_EMAIL}
                  </a>
                  .
                </p>
              </Subsection>
              <Subsection title="5.3 Cancellation by Rasko">
                <p>
                  Rasko may suspend or terminate your account immediately if you
                  violate these Terms. In cases of termination for our
                  convenience, we will provide a pro-rated refund for unused
                  subscription time.
                </p>
              </Subsection>
            </Section>

            <Section title="6. Acceptable Use">
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>
                  Violate any applicable law, regulation, or third-party rights;
                </li>
                <li>
                  Upload or transmit malicious code, viruses, or any other
                  harmful content;
                </li>
                <li>
                  Attempt to gain unauthorised access to any part of the Service
                  or its infrastructure;
                </li>
                <li>
                  Engage in data scraping, reverse engineering, or decompiling
                  the Service;
                </li>
                <li>Harass, abuse, or harm other users or third parties;</li>
                <li>
                  Use the Service to send unsolicited communications (spam);
                </li>
                <li>
                  Misrepresent your identity or affiliation with any person or
                  organisation;
                </li>
                <li>Interfere with the proper operation of the Service.</li>
              </ul>
            </Section>

            <Section title="7. Intellectual Property">
              <Subsection title="7.1 Our IP">
                <p>
                  The Service and its original content (excluding User Content),
                  features, and functionality are owned by {COMPANY_NAME} and
                  are protected by applicable intellectual property laws. You
                  may not reproduce, distribute, modify, or create derivative
                  works without our express written consent.
                </p>
              </Subsection>
              <Subsection title="7.2 Your Content">
                <p>
                  You retain ownership of all Content you submit to the Service.
                  By submitting Content, you grant Rasko a limited,
                  non-exclusive, royalty-free licence to use, store, process,
                  and display your Content solely for the purpose of providing
                  the Service.
                </p>
              </Subsection>
              <Subsection title="7.3 Feedback">
                <p>
                  If you provide feedback, suggestions, or ideas about the
                  Service, you grant us the right to use such feedback without
                  restriction or compensation to you.
                </p>
              </Subsection>
            </Section>

            <Section title="8. Data and Privacy">
              <p>
                Your use of the Service is subject to our{" "}
                <Link
                  href="/privacy"
                  className="text-primary-400 hover:text-primary-300"
                >
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms by reference. By using
                the Service, you consent to the collection and use of
                information as described in the Privacy Policy.
              </p>
            </Section>

            <Section title="9. Disclaimers and Limitation of Liability">
              <Subsection title="9.1 Service Provided &ldquo;As Is&rdquo;">
                <p>
                  The Service is provided on an &ldquo;as is&rdquo; and
                  &ldquo;as available&rdquo; basis without warranties of any
                  kind, express or implied, including but not limited to
                  warranties of merchantability, fitness for a particular
                  purpose, and non-infringement.
                </p>
              </Subsection>
              <Subsection title="9.2 Limitation of Liability">
                <p>
                  To the maximum extent permitted by applicable law, in no event
                  shall Rasko, its directors, employees, or agents be liable for
                  any indirect, incidental, special, consequential, or punitive
                  damages, including loss of profits, data, or business
                  opportunities, arising out of or in connection with your use
                  of the Service, even if advised of the possibility of such
                  damages.
                </p>
                <p>
                  Our aggregate liability for direct damages shall not exceed
                  the total amount you paid to Rasko in the 12 months preceding
                  the event giving rise to the claim.
                </p>
              </Subsection>
            </Section>

            <Section title="10. Indemnification">
              <p>
                You agree to indemnify, defend, and hold harmless {COMPANY_NAME}
                and its officers, directors, employees, and agents from any
                claims, liabilities, damages, losses, and expenses (including
                reasonable legal fees) arising out of or related to your use of
                the Service, your violation of these Terms, or your violation of
                any third-party rights.
              </p>
            </Section>

            <Section title="11. Service Availability and Modifications">
              <ul>
                <li>
                  We strive to maintain high availability but do not guarantee
                  uninterrupted access to the Service.
                </li>
                <li>
                  We reserve the right to modify, suspend, or discontinue any
                  part of the Service at any time with reasonable notice.
                </li>
                <li>
                  Scheduled maintenance will be communicated in advance where
                  possible.
                </li>
              </ul>
            </Section>

            <Section title="12. Governing Law and Disputes">
              <p>
                These Terms are governed by and construed in accordance with the
                laws of India. Any disputes arising out of or relating to these
                Terms or the Service shall be subject to the exclusive
                jurisdiction of the courts located in{" "}
                <strong className="text-surface-300">[City], India</strong>.
              </p>
              <p>
                Before initiating legal proceedings, you agree to attempt in
                good faith to resolve any dispute informally by contacting us at{" "}
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="text-primary-400 hover:text-primary-300"
                >
                  {COMPANY_EMAIL}
                </a>
                .
              </p>
            </Section>

            <Section title="13. Changes to These Terms">
              <p>
                We reserve the right to modify these Terms at any time. We will
                provide at least 30 days&apos; notice of material changes by
                email and/or in-app notification. Your continued use of the
                Service after the effective date constitutes acceptance of the
                revised Terms.
              </p>
            </Section>

            <Section title="14. Contact Information">
              <p>For any questions about these Terms, please contact:</p>
              <div className="bg-surface-800/50 border border-surface-700/40 rounded-xl p-4 text-sm space-y-1">
                <p className="font-semibold text-white">{COMPANY_NAME}</p>
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

            {/* Nav links */}
            <div className="pt-4 border-t border-surface-800/60 flex flex-wrap gap-4 text-sm">
              <Link
                href="/privacy"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                View Privacy Policy →
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
      <div className="text-surface-400 space-y-2">{children}</div>
    </div>
  );
}
