"use client";

import { uitChain } from "../config/web3";
import { useState } from "react";

interface NetworkStatusProps {
  className?: string;
}

export function NetworkStatus({ className = "" }: NetworkStatusProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [lastBlockNumber, setLastBlockNumber] = useState<bigint | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "success" | "error" | "idle"
  >("idle");

  const checkConnection = async () => {
    setIsChecking(true);
    setConnectionStatus("idle");

    try {
      // Make direct JSON-RPC call to get block number
      const response = await fetch(uitChain.rpcUrls.default.http[0], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.result && typeof data.result === "string") {
          const blockNumber = BigInt(parseInt(data.result, 16));
          setLastBlockNumber(blockNumber);
          setLastCheckTime(new Date());
          setConnectionStatus("success");
        } else {
          console.error("Invalid response format:", data);
          setConnectionStatus("error");
          setLastBlockNumber(null);
          setLastCheckTime(new Date());
        }
      } else {
        setConnectionStatus("error");
        setLastBlockNumber(null);
        setLastCheckTime(new Date());
      }
    } catch (error) {
      console.error("Connection check failed:", error);
      setConnectionStatus("error");
      setLastBlockNumber(null);
      setLastCheckTime(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "success":
        return `Connected (Block #${lastBlockNumber?.toString()})`;
      case "error":
        return "Connection Failed";
      default:
        return "Not Checked";
    }
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Network Status</span>
        <button
          onClick={checkConnection}
          disabled={isChecking}
          className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-2 py-1 rounded transition-colors duration-200"
        >
          {isChecking ? "Checking..." : "Test"}
        </button>
      </div>
      <div className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </div>
      {lastCheckTime && (
        <div className="text-xs text-gray-500 mt-1">
          Last checked: {lastCheckTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
