import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'

// Define the custom chain
export const uitChain = defineChain({
  id: 1337, // You can update this to match your actual chain ID
  name: 'UIT Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://10.102.199.73:8080/rpc'],
    },
  },
})

export const config = createConfig({
  chains: [uitChain],
  transports: {
    [uitChain.id]: http(),
  },
})

// Contract configuration
export const FAUCET_CONTRACT = {
  address: '0x1e38cf69DA98506F14D43C82a3ca8Aa825ac8aF7' as const,
  chainId: uitChain.id,
}
