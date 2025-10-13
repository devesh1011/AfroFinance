"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const handleLogin = async () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  const handleDisconnect = () => {
    if (disconnect) {
      disconnect();
    }
  };

  if (!isConnected || !address) {
    return (
      <button
        className="truncate bg-zinc-900 border border-zinc-800 text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors"
        onClick={handleLogin}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      className="truncate bg-zinc-900 border border-zinc-800 text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors"
      onClick={handleDisconnect}
    >
      {address}
    </button>
  );
}
