// Replace with your actual contract address
// This should match the address where your FundLoom contract is deployed
export const FUNDLOOM_CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS';

// This is a simplified ABI that includes only the functions we need
export const FUNDLOOM_ABI = [
  {
    "type": "function",
    "name": "donate",
    "inputs": [
      {
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "createCampaign",
    "inputs": [
      {
        "name": "title",
        "type": "string"
      },
      {
        "name": "description",
        "type": "string"
      },
      {
        "name": "targetAmount",
        "type": "uint256"
      },
      {
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "campaignId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  }
] as const;

// Network configuration
export const NETWORK = {
  // Testnet (Goerli)
  testnet: {
    name: 'goerli',
    chainId: 5, // Goerli chain ID
    rpcUrl: 'https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    blockExplorer: 'https://goerli.etherscan.io'
  },
  // Mainnet
  mainnet: {
    name: 'ethereum',
    chainId: 1, // Ethereum mainnet chain ID
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    blockExplorer: 'https://etherscan.io'
  },
  // Local development
  localhost: {
    name: 'localhost',
    chainId: 31337, // Common local chain ID (e.g., Hardhat Network)
    rpcUrl: 'http://localhost:8545',
    blockExplorer: ''
  }
} as const;

export type NetworkName = keyof typeof NETWORK;
