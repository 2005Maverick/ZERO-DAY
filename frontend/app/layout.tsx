import type { Metadata } from "next";
import { Geist, Geist_Mono, Anton, Bebas_Neue, JetBrains_Mono, Inter, Pirata_One, Cinzel, Cormorant_SC, EB_Garamond, IBM_Plex_Mono, Bodoni_Moda, Special_Elite, Fraunces } from "next/font/google";
import { NavigationProvider } from '@/lib/contexts/navigation-context'
import { UserProvider } from '@/lib/contexts/user-context'
import { ToastProvider } from '@/lib/contexts/toast-context'
import { LoadingProvider } from '@/lib/contexts/loading-context'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const pirataOne = Pirata_One({
  weight: "400",
  variable: "--font-pirata",
  subsets: ["latin"],
  display: "swap",
});

const cinzel = Cinzel({
  weight: ["400", "700"],
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const cormorantSC = Cormorant_SC({
  weight: ["400", "600", "700"],
  variable: "--font-cormorant-sc",
  subsets: ["latin"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
});

const bodoni = Bodoni_Moda({
  weight: ["400", "500", "700"],
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

const specialElite = Special_Elite({
  weight: "400",
  variable: "--font-special-elite",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zero Day Market",
  description: "Master trading through history",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} ${inter.variable} ${pirataOne.variable} ${cinzel.variable} ${cormorantSC.variable} ${ebGaramond.variable} ${plexMono.variable} ${bodoni.variable} ${specialElite.variable} ${fraunces.variable} font-sans antialiased`}
      >
        <UserProvider>
          <ToastProvider>
            <LoadingProvider>
              <NavigationProvider>
                {children}
              </NavigationProvider>
            </LoadingProvider>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
