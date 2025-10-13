import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Copy } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useDisconnect } from "wagmi";
import { useNetworkSwitch } from "@/hooks/use-network-switch";

const CustomConnectButton = () => {
  const { checkAndSwitchNetwork } = useNetworkSwitch();
  const { disconnectAsync } = useDisconnect();
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        const handleLogout = async () => {
          await checkAndSwitchNetwork();
          try {
            await disconnectAsync();
          } catch {}
        };

        const handleAccountDetails = async () => {
          await checkAndSwitchNetwork();
          openAccountModal();
        };

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="text-white text-sm focus:outline-none hover:text-white bg-black cursor-pointer rounded-full px-3 py-2 transition-colors border border-gray-600/50 hover:border-slate-600 hover:!bg-slate-700"
                  >
                    Connect Wallet
                  </button>
                );
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex focus:outline-none text-white items-center gap-2 bg-black/80 hover:bg-black rounded-full py-0.5 pl-0.5 pr-4 border border-gray-600/50 hover:border-white/20 transition-colors">
                      <div className="w-8 h-8 rounded-xl">
                        <Image
                          src="/1.png"
                          className="w-full h-full"
                          width={32}
                          height={32}
                          alt="Profile_Image"
                        />
                      </div>
                      <span className="text-sm capitalize font-semibold text-white">
                        {account.displayName}
                      </span>
                      {account.displayBalance ? (
                        <span className="ml-2 text-xs text-gray-400 font-medium">
                          {account.displayBalance}
                        </span>
                      ) : null}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white">
                    <DropdownMenuItem
                      onClick={() => copyAddress(account.address)}
                      className="cursor-pointer"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleAccountDetails}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Account Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default CustomConnectButton;
