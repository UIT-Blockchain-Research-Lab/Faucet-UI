"use client";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  useReadContract,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { FAUCET_CONTRACT } from "../config/web3";
import { faucetAbi } from "../contract";
import { formatEther } from "viem";
import { useState } from "react";

export function FaucetUI() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, isPending, isError, error } = useWriteContract();
  const [txStatus, setTxStatus] = useState<string>("");

  // Read faucet amount
  const { data: faucetAmount } = useReadContract({
    address: FAUCET_CONTRACT.address,
    abi: faucetAbi,
    functionName: "FAUCET_AMOUNT",
  });

  // Check if user can request funds
  const { data: canRequestData } = useReadContract({
    address: FAUCET_CONTRACT.address,
    abi: faucetAbi,
    functionName: "canRequestFunds",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const canRequest = canRequestData?.[0];
  const timeLeft = canRequestData?.[1];

  const handleDrip = async () => {
    if (!address) return;

    try {
      setTxStatus("Requesting tokens...");

      writeContract({
        address: FAUCET_CONTRACT.address,
        abi: faucetAbi,
        functionName: "drip",
        args: [address],
      });

      setTxStatus("Transaction submitted! Check your wallet for confirmation.");
    } catch (err) {
      console.error("Drip failed:", err);
      setTxStatus("Failed to request tokens");
    }
  };

  const formatTimeLeft = (seconds: bigint) => {
    const mins = Number(seconds) / 60;
    const hours = mins / 60;
    if (hours >= 1) {
      return `${Math.floor(hours)}h ${Math.floor(mins % 60)}m`;
    }
    return `${Math.floor(mins)}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            UIT Chain Faucet
          </h1>
          <p className="text-gray-600">Get test tokens for development</p>
        </div>

        {!isConnected ? (
          <div className="space-y-4">
            <button
              onClick={() => connect({ connector: injected() })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Connect Wallet
            </button>
            <p className="text-sm text-gray-500 text-center">
              Connect your wallet to receive test tokens
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Connected Wallet</div>
              <div className="font-mono text-sm text-gray-800 break-all">
                {address}
              </div>
              <button
                onClick={() => disconnect()}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Disconnect
              </button>
            </div>

            {faucetAmount && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-700 mb-1">Faucet Amount</div>
                <div className="text-lg font-semibold text-green-800">
                  {formatEther(faucetAmount)} ETH
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleDrip}
                disabled={isPending || !canRequest}
                className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                  canRequest && !isPending
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
              >
                {isPending
                  ? "Processing..."
                  : canRequest
                  ? "Request Tokens"
                  : "Rate Limited"}
              </button>

              {!canRequest && timeLeft && (
                <p className="text-sm text-orange-600 text-center">
                  Please wait {formatTimeLeft(timeLeft)} before requesting again
                </p>
              )}
            </div>

            {txStatus && (
              <div
                className={`p-4 rounded-lg text-sm ${
                  txStatus.includes("success") || txStatus.includes("received")
                    ? "bg-green-50 text-green-700"
                    : txStatus.includes("Failed")
                    ? "bg-red-50 text-red-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {txStatus}
              </div>
            )}

            {isError && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-700">
                  Error: {error.message}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
