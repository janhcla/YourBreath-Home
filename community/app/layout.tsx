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
    <html lang="en"><body>{children}</body>
    </html>
  );
}
