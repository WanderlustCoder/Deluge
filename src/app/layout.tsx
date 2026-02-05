import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Deluge",
    default: "Deluge — One by One, All at Once",
  },
  description:
    "Community-driven giving platform where your attention and contributions flow together to fund projects that matter.",
  keywords: [
    "community giving",
    "crowdfunding",
    "social impact",
    "ad-funded giving",
    "community projects",
    "watershed",
    "microloans",
    "charitable giving",
  ],
  openGraph: {
    type: "website",
    siteName: "Deluge",
    title: "Deluge — One by One, All at Once",
    description:
      "Community-driven giving platform where your attention and contributions flow together to fund projects that matter.",
    url: "https://deluge.fund",
    images: [
      {
        url: "https://deluge.fund/og-default.png",
        width: 1200,
        height: 630,
        alt: "Deluge — One by One, All at Once",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deluge — One by One, All at Once",
    description:
      "Community-driven giving platform where your attention and contributions flow together to fund projects that matter.",
    images: ["https://deluge.fund/og-default.png"],
  },
  metadataBase: new URL("https://deluge.fund"),
  themeColor: "#0D47A1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('deluge-theme');
                  var isDark = theme === 'dark' || (!theme || theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (isDark) document.documentElement.classList.add('dark');
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-foam text-storm dark:bg-dark-bg dark:text-dark-text antialiased">
        {children}
      </body>
    </html>
  );
}
