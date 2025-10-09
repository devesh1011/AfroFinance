"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplet, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function FaucetPage() {
  const { address: connectedAddress, isConnected } = useAccount();
  const [address, setAddress] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [lastClaimTx, setLastClaimTx] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const handlePasteAddress = () => {
    if (connectedAddress) {
      setAddress(connectedAddress);
      toast.success("Address pasted from connected wallet");
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaim = async () => {
    if (!address) {
      toast.error("Please enter a wallet address");
      return;
    }

    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      toast.error("Invalid Ethereum address format");
      return;
    }

    setIsClaiming(true);
    setLastClaimTx(null);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const apiKey = process.env.NEXT_PUBLIC_BACKEND_API_KEY;

      console.log("Claiming HUSDC:", { backendUrl, address, amount: 1000 });

      const response = await fetch(`${backendUrl}/web3/faucet/husdc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
        body: JSON.stringify({
          address: address,
          amount: 1000, // 1000 HUSDC
        }),
      });

      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(
          `Server error: ${response.status} ${response.statusText}. ${text}`
        );
      }

      console.log("Response data:", data);

      if (!response.ok) {
        const errorMessage =
          data.error ||
          data.message ||
          `Server error: ${response.status} ${response.statusText}`;
        console.error("Backend error:", errorMessage, data);
        throw new Error(errorMessage);
      }

      if (!data.success) {
        const errorMessage =
          data.error || data.message || "Failed to claim HUSDC";
        console.error("Claim failed:", errorMessage, data);
        throw new Error(errorMessage);
      }

      setLastClaimTx(data.txHash || "pending");
      toast.success(
        `Successfully claimed 1000 HUSDC! Transaction: ${data.txHash?.slice(0, 10)}...`
      );
    } catch (error) {
      console.error("Error claiming HUSDC:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to claim HUSDC. Please check your connection and try again.";
      toast.error(errorMessage);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto px-6">
      {/* Header */}

      {/* Faucet Card */}
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/30 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Claim HUSDC Tokens
          </CardTitle>
          <CardDescription className="text-slate-600">
            Enter your Hedera EVM wallet address to receive 1000 HUSDC tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address Input */}
          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-sm font-medium text-slate-700"
            >
              Wallet Address
            </Label>
            <div className="flex gap-2">
              <Input
                id="address"
                type="text"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 font-mono text-sm"
                disabled={isClaiming}
              />
              {isConnected && (
                <Button
                  variant="outline"
                  onClick={handlePasteAddress}
                  disabled={isClaiming}
                  className="shrink-0"
                >
                  Use Connected
                </Button>
              )}
              {address && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAddress}
                  disabled={isClaiming}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            {connectedAddress && (
              <p className="text-xs text-slate-500">
                Connected: {connectedAddress.slice(0, 6)}...
                {connectedAddress.slice(-4)}
              </p>
            )}
          </div>

          {/* Token Address Info */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Droplet className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-900 mb-2">
                  HUSDC Token Contract
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-emerald-200 text-emerald-800 flex-1 break-all">
                    0x7f4a1138bc9a86C8E75e4745C96062625A30029b
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "0x7f4a1138bc9a86C8E75e4745C96062625A30029b"
                      );
                      setTokenCopied(true);
                      toast.success("Token address copied to clipboard");
                      setTimeout(() => setTokenCopied(false), 2000);
                    }}
                    className="shrink-0"
                  >
                    {tokenCopied ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-emerald-700">
                  Import this token address in your wallet to view your HUSDC
                  balance.
                  <br />
                  <strong>Symbol:</strong> HUSDC | <strong>Decimals:</strong> 6
                </p>
              </div>
            </div>
          </div>

          {/* Claim Info */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Droplet className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-900 mb-1">
                  You will receive:{" "}
                  <span className="font-bold">1,000 HUSDC</span>
                </p>
                <p className="text-xs text-emerald-700">
                  Tokens will be sent to the address you specify. Make sure you
                  control this address.
                </p>
              </div>
            </div>
          </div>

          {/* Claim Button */}
          <Button
            onClick={handleClaim}
            disabled={!address || isClaiming}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg"
            size="lg"
          >
            {isClaiming ? (
              <>
                <span className="mr-2">Claiming...</span>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </>
            ) : (
              <>
                <Droplet className="w-5 h-5 mr-2" />
                Claim 1000 HUSDC
              </>
            )}
          </Button>

          {/* Last Transaction Info */}
          {lastClaimTx && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-1">
                    Transaction Submitted
                  </p>
                  <p className="text-xs text-green-700 font-mono break-all">
                    {lastClaimTx}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> This faucet is for Hedera Testnet only.
                  Tokens have no real value and are for testing purposes only.
                  You may need to wait a few moments for the transaction to be
                  processed.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
