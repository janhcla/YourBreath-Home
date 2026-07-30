import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YourBreath Community — Help shape YourBreath",
  description: "Suggest, vote and follow what’s next for the calm, private YourBreath breathing app.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"><body><div className="construction-banner" role="status" aria-label="Community under construction"><strong>Under construction</strong><span>This Community is still being built. Features and data may change while the service is prepared for production.</span></div>{children}</body>
    </html>
  );
}
