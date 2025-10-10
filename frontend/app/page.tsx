"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Wallet,
  Settings,
  Eye,
  RefreshCw,
  PieChart,
  Activity,
  Shield,
  Zap,
  Users,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { PixelTrail } from "@/components/ui/pixel-trail";
import { useScreenSize } from "@/hooks/use-screen-size";
import { GradientBars } from "@/components/gradient-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Features } from "@/components/features";
import { Footer } from "@/components/ui/footer";
import { Hero } from "@/components/ui/animated-hero";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const screenSize = useScreenSize();

  const socialLinks = [
    {
      icon: <Twitter className="h-5 w-5" />,
      href: "https://twitter.com/afrofinance",
      label: "Twitter",
    },
    {
      icon: <Github className="h-5 w-5" />,
      href: "https://github.com/afrofinance",
      label: "GitHub",
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      href: "https://linkedin.com/company/afrofinance",
      label: "LinkedIn",
    },
  ];

  const mainLinks = [
    { href: "/app/trade", label: "Trade" },
    { href: "/app/markets", label: "Markets" },
    { href: "/app/earn", label: "Earn" },
    { href: "/docs", label: "Docs" },
    { href: "/blog", label: "Blog" },
    { href: "/security", label: "Security" },
  ];

  const legalLinks = [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/cookies", label: "Cookies" },
  ];

  const platformStats = [
    { value: "$2.4M", label: "Total Volume", change: "+12.5%" },
    { value: "1,247", label: "Active Users", change: "+8.2%" },
    { value: "99.9%", label: "Uptime", change: "Stable" },
    { value: "0.1%", label: "Trading Fees", change: "Low Cost" },
  ];

  const liveMarkets = [
    { symbol: "AAPL", price: "$189.84", change: "+2.1%", volume: "45.2M" },
    { symbol: "TSLA", price: "$248.42", change: "-1.3%", volume: "32.1M" },
    { symbol: "MSFT", price: "$424.58", change: "+0.8%", volume: "28.7M" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />

      {/* Proof of Reserve Section */}
      <section className="relative py-24 bg-white overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-6">
              Proof of Reserve
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Every token is fully backed 1:1 by investment-grade bond ETFs,
              held by qualified U.S. custodians for maximum security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative z-10 py-10 mb-12">
            {/* Card 1 - Total Reserve Value */}
            <div className="flex flex-col lg:border-r py-10 relative group/feature border-slate-200">
              <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-slate-100 to-transparent pointer-events-none" />
              <div className="mb-4 relative z-10 px-10 text-slate-600">
                <Shield className="w-8 h-8" />
              </div>
              <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-slate-300 group-hover/feature:bg-slate-400 transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-slate-900">
                  $2.4B Reserve
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 max-w-xs relative z-10 px-10 mb-3">
                  Total Reserve Value
                </p>
                <div className="px-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-600">
                      Backing Ratio
                    </span>
                    <span className="font-bold text-slate-900">1:1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Last Audit</span>
                    <span className="text-xs font-semibold text-slate-900">
                      Today
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - AAA-Rated */}
            <div className="flex flex-col lg:border-r py-10 relative group/feature border-slate-200">
              <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-slate-100 to-transparent pointer-events-none" />
              <div className="mb-4 relative z-10 px-10 text-slate-600">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-slate-300 group-hover/feature:bg-slate-400 transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-slate-900">
                  AAA-Rated ETF
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 max-w-xs relative z-10 px-10 mb-3">
                  Investment Grade Backing
                </p>
                <div className="px-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-600">Primary ETF</span>
                    <span className="font-bold text-slate-900">LQD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Custodian</span>
                    <span className="text-xs font-semibold text-slate-900">
                      U.S. Qualified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - 100% Collateralized */}
            <div className="flex flex-col py-10 relative group/feature border-slate-200">
              <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-slate-100 to-transparent pointer-events-none" />
              <div className="mb-4 relative z-10 px-10 text-slate-600">
                <Activity className="w-8 h-8" />
              </div>
              <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-slate-300 group-hover/feature:bg-slate-400 transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-slate-900">
                  100% Secure
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 max-w-xs relative z-10 px-10 mb-3">
                  Fully Collateralized
                </p>
                <div className="px-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-600">Reserve Type</span>
                    <span className="font-bold text-slate-900">Bonds</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Insurance</span>
                    <span className="text-xs font-semibold text-slate-900">
                      FDIC
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-slate-200/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Investment-Grade Security
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Each token is backed 1:1 by investment-grade bond ETFs like
                  LQD, held by a qualified U.S. custodian. This ensures maximum
                  security and stability for your investments.
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    AAA-rated corporate bond ETFs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    Qualified U.S. custodian oversight
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    Real-time reserve verification
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Transparent Reserves
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Our proof of reserve system provides complete transparency.
                  View real-time data showing exactly how your tokens are backed
                  by high-quality, liquid assets.
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    Daily reserve audits
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    Public blockchain verification
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    Independent third-party validation
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/app">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-slate-300 hover:border-slate-600 text-slate-700 hover:text-slate-600 px-8 py-3 rounded-xl"
              >
                View Reserve Details
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-white overflow-hidden">
        <Features />
      </section>

      {/* Footer */}
      <Footer
        logo={
          <Image src="/Afro.png" alt="AfroFinance" width={32} height={32} />
        }
        brandName="AfroFinance"
        socialLinks={socialLinks}
        mainLinks={mainLinks}
        legalLinks={legalLinks}
        copyright={{
          text: `© ${new Date().getFullYear()} AfroFinance. All rights reserved.`,
          license: "Licensed under MIT",
        }}
      />
    </div>
  );
}
