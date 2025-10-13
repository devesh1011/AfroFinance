"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider, http, createConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { injected } from "wagmi/connectors";

const queryClient = new QueryClient();

type ClientProvidersProps = { children: ReactNode };

export function ClientProviders({ children }: ClientProvidersProps) {
  // Hedera EVM testnet chain
  const hederaTestnet = {
    id: 296,
    name: "Hedera Testnet",
    network: "hedera-testnet",
    nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
    rpcUrls: {
      default: {
        http: [
          process.env.NEXT_PUBLIC_HEDERA_RPC || "https://testnet.hashio.io/api",
        ],
      },
      public: { http: ["https://testnet.hashio.io/api"] },
    },
    blockExplorers: {
      default: { name: "HashScan", url: "https://hashscan.io/testnet" },
    },
    testnet: true,
  } as const;

  const wagmiConfig = createConfig({
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

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={hederaTestnet}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
