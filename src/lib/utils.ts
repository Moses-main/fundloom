/**
 * Formats an Ethereum address to a shorter version
 * @param address - The full Ethereum address
 * @param startLength - Number of characters to show from the start (default: 6)
 * @param endLength - Number of characters to show from the end (default: 4)
 * @returns Formatted address (e.g., "0x1a2b...3c4d")
 */
export function formatAddress(
  address: string | null | undefined,
  startLength = 6,
  endLength = 4
): string {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Checks if the current device is a mobile device
 * @returns boolean indicating if the device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Validates if a string is a valid Ethereum address
 * @param address - The address to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Shortens a transaction hash for display
 * @param hash - The transaction hash
 * @param startLength - Number of characters to show from the start (default: 8)
 * @param endLength - Number of characters to show from the end (default: 6)
 * @returns Formatted transaction hash
 */
export function formatTransactionHash(
  hash: string,
  startLength = 8,
  endLength = 6
): string {
  if (!hash) return '';
  if (hash.length <= startLength + endLength) return hash;
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}

/**
 * Converts wei to ether
 * @param wei - The amount in wei
 * @param decimals - Number of decimal places (default: 4)
 * @returns The amount in ether
 */
export function weiToEther(wei: string | number, decimals = 4): string {
  const value = typeof wei === 'string' ? parseFloat(wei) : wei;
  return (value / 1e18).toFixed(decimals);
}

/**
 * Copies text to clipboard
 * @param text - The text to copy
 * @returns Promise that resolves when text is copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy text: ', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
    document.body.removeChild(textArea);
  }
}
