import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rasko.org"),
  title: {
    default: "Rasko — Field Service Management & CRM",
    template: "%s | Rasko",
  },
  description:
    "Complete FSM + CRM platform for service businesses. Manage leads, bookings, job cards, and employees from one dashboard. Start your free 30-day trial.",
  keywords: [
    "field service management",
    "FSM software India",
    "service business CRM",
    "job card management",
    "booking management software",
    "appliance repair software",
    "HVAC management",
    "service business app",
  ],
  authors: [{ name: "Rasko Technologies Pvt. Ltd.", url: "https://rasko.org" }],
  creator: "Rasko Technologies Pvt. Ltd.",
  publisher: "Rasko Technologies Pvt. Ltd.",
  applicationName: "Rasko",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://rasko.org",
    siteName: "Rasko",
    title: "Rasko — Field Service Management & CRM",
    description:
      "The complete operations platform for field service businesses. Manage leads, bookings, job cards, and teams without the chaos.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rasko — Field Service Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@raskohq",
    creator: "@raskohq",
    title: "Rasko — Field Service Management & CRM",
    description:
      "The complete operations platform for field service businesses.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "google-site-verification-token",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-100">
        {children}
      </body>
    </html>
  );
}
