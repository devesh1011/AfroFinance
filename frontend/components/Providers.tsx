"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http, createConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

const hederaTestnet = defineChain({
  id: 296,
  name: "Hedera Testnet",
  network: "hedera-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "HBAR",
    symbol: "HBAR",
  },
  rpcUrls: {
    default: { http: ["https://testnet.hashio.io/api"] },
    public: { http: ["https://testnet.hashio.io/api"] },
  },
  blockExplorers: {
    default: {
      name: "HashScan",
      url: "https://hashscan.io/testnet",
    },
  },
  testnet: true,
});

const config = createConfig({
  chains: [hederaTestnet],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [hederaTestnet.id]: http(
      process.env.NEXT_PUBLIC_HEDERA_RPC || "https://testnet.hashio.io/api",
      {
        // Hedera-specific optimizations
        retryCount: 3,
        retryDelay: 1000,
        timeout: 10000,
      }
    ),
  },
  // Global polling configuration for Hedera (block time ~3-5 seconds)
  pollingInterval: 5000,
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={hederaTestnet}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
