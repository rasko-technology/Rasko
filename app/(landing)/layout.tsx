import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://rasko.org"),
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
