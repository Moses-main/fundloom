// Replace with your actual contract address
// This should match the address where your FundLoom contract is deployed
export const FUNDLOOM_CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS';

// This is a simplified ABI that includes only the functions we need
export const FUNDLOOM_ABI = [
  {
    "name": "donate",
    "type": "function",
    "inputs": [
      {
        "name": "campaign_id",
        "type": "felt"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  // Add other necessary ABI entries here
];

// Network configuration
export const NETWORK = {
  // Testnet
  testnet: {
    name: 'goerli',
    chainId: '0x534e5f474f45524c49', // SN_GOERLI in hex
    rpcUrl: 'https://starknet-goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID'
  },
  // Mainnet
  mainnet: {
    name: 'mainnet',
    chainId: '0x534e5f4d41494e', // SN_MAIN in hex
    rpcUrl: 'https://starknet-mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'
  }
};
