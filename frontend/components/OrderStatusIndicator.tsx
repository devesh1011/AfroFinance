"use client";

import React from "react";
import {
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { OrderStatus } from "@/hooks/useOrderEvents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderStatusIndicatorProps {
  status: OrderStatus;
  txHash?: string;
  getHashScanLink: (txHash: string) => string;
}

export function OrderStatusIndicator({
  status,
  txHash,
  getHashScanLink,
}: OrderStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "depositing":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          label: "Depositing HUSDC",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          description: "Your HUSDC is being deposited to escrow...",
        };
      case "pending":
        return {
          icon: <Clock className="h-4 w-4" />,
          label: "Order Pending",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          description:
            "Your order has been submitted and is awaiting processing...",
        };
      case "processing":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          label: "Processing Order",
          color: "bg-purple-100 text-purple-800 border-purple-200",
          description:
            "Backend is processing your order and preparing settlement...",
        };
      case "settled":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          label: "Order Settled",
          color: "bg-green-100 text-green-800 border-green-200",
          description:
            "Your order has been settled successfully! LQD tokens minted.",
        };
      case "failed":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: "Order Failed",
          color: "bg-red-100 text-red-800 border-red-200",
          description: "Your order failed to process. Please try again.",
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();

  if (!config || status === "idle") {
    return null;
  }

  return (
    <div className={`rounded-lg border p-4 ${config.color}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{config.icon}</div>
          <div className="space-y-1">
            <p className="font-medium text-sm">{config.label}</p>
            <p className="text-xs opacity-80">{config.description}</p>
          </div>
        </div>
        {txHash && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => window.open(getHashScanLink(txHash), "_blank")}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            <span className="text-xs">View</span>
          </Button>
        )}
      </div>
    </div>
  );
}

interface OrderHistoryItemProps {
  event: {
    type: "deposited" | "buyOrder" | "sellOrder" | "settlement";
    txHash: string;
    timestamp: number;
    ticker?: string;
    amount?: bigint;
    status: OrderStatus;
  };
  getHashScanLink: (txHash: string) => string;
}

export function OrderHistoryItem({
  event,
  getHashScanLink,
}: OrderHistoryItemProps) {
  const getEventLabel = () => {
    switch (event.type) {
      case "deposited":
        return "Deposited HUSDC";
      case "buyOrder":
        return `Buy Order Created: ${event.ticker}`;
      case "sellOrder":
        return `Sell Order Created: ${event.ticker}`;
      case "settlement":
        return `Settlement: ${event.ticker}`;
      default:
        return "Unknown Event";
    }
  };

  const getEventIcon = () => {
    switch (event.status) {
      case "settled":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (event.status) {
      case "settled":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Settled
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Failed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Processing
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{event.status}</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        {getEventIcon()}
        <div>
          <p className="text-sm font-medium">{getEventLabel()}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(event.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => window.open(getHashScanLink(event.txHash), "_blank")}
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
