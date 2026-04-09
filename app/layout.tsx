import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rasko — Field Service Management",
  description: "Complete FSM + CRM platform for service businesses. Manage leads, bookings, job cards, and employees.",
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
