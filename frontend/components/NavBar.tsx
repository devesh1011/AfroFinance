"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutGrid, TrendingUp, Zap, LucideIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import CustomConnectButton from "@/components/custom-connect-wallet";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { name: "Markets", url: "/app/markets", icon: LayoutGrid },
  { name: "Trade", url: "/app/trade", icon: TrendingUp },
  { name: "Earn", url: "/app/earn", icon: Zap },
];

export default function Navbar() {
  const [activeTab, setActiveTab] = useState(navItems[0].name);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6 w-full sm:w-auto px-4 sm:px-0">
      <div className="flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-2 px-4 rounded-full shadow-lg max-w-full sm:max-w-5xl mx-auto">
        {/* Logo - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 mr-4">
          <Image
            src="/Afro.png"
            alt="AfroFinance Logo"
            width={32}
            height={32}
          />
          <p className="font-black text-sm whitespace-nowrap">AfroFinance</p>
        </div>

        {/* Navigation Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-slate-600",
                isActive && "bg-slate-200/30 text-slate-600"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-slate-200/20 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-500 rounded-t-full">
                    <div className="absolute w-12 h-6 bg-slate-400/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-slate-400/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-slate-400/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-border/50 mx-2" />

        {/* Connect Wallet Button */}
        <div className="hidden md:block ml-2">
          <CustomConnectButton />
        </div>
      </div>
    </div>
  );
}
