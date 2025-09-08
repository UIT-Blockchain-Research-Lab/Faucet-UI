"use client";

import { useEffect, useState } from "react";
import { uitChain } from "../config/web3";

interface NetworkCheckProps {
  children: React.ReactNode;
}

export function NetworkCheck({ children }: NetworkCheckProps) {
  const [isNetworkAvailable, setIsNetworkAvailable] = useState<boolean | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkNetworkConnectivity = async () => {
      try {
        // Create a timeout promise to limit the check duration
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Network check timeout")), 10000)
        );

        // Make direct JSON-RPC call to get block number
        const rpcCallPromise = fetch(uitChain.rpcUrls.default.http[0], {
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

        const response = await Promise.race([rpcCallPromise, timeoutPromise]);

        if (response instanceof Response && response.ok) {
          const data = await response.json();

          if (data.result && typeof data.result === "string") {
            const blockNumber = parseInt(data.result, 16);
            console.log(
              "Successfully connected to UIT Chain, current block:",
              blockNumber
            );
            setIsNetworkAvailable(true);
          } else {
            console.error("Invalid response format:", data);
            setIsNetworkAvailable(false);
          }
        } else {
          setIsNetworkAvailable(false);
        }
      } catch (error) {
        console.error("Network connectivity check failed:", error);
        setIsNetworkAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkNetworkConnectivity();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Checking Network Connection
          </h2>
          <p className="text-gray-600">
            Please wait while we verify connectivity to UIT Chain...
          </p>
        </div>
      </div>
    );
  }

  // TEMPORARILY DISABLED FOR DEVELOPMENT - Always allow access
  // TODO: Re-enable network checking when RPC connection is working
  // if (!isNetworkAvailable) {
  if (false && !isNetworkAvailable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Network Connection Required
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Please connect to <strong>UIT WiFi</strong> or use{" "}
            <strong>VPN to UIT WiFi</strong> to access this website.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 mb-2">
              <strong>
                This faucet requires access to the UIT Chain network
              </strong>
            </p>
            <p className="text-sm text-red-600">
              • UIT Chain RPC:{" "}
              <code className="bg-red-100 px-1 rounded text-xs">
                http://10.102.199.73:8080/rpc
              </code>
              <br />• Network access is restricted to UIT network only
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
