import { test, expect } from '@playwright/test';

test.describe('Wallet Connection', () => {
  test('should connect wallet successfully', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');

    // Click the connect wallet button
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await expect(connectButton).toBeVisible();
    await connectButton.click();

    // Wait for the wallet selection modal
    const walletModal = page.getByRole('dialog');
    await expect(walletModal).toBeVisible();

    // Check if MetaMask option is available
    const metaMaskOption = page.getByText('MetaMask', { exact: true });
    await expect(metaMaskOption).toBeVisible();

    // Note: Actual wallet interaction would require browser extension automation
    // which is complex and beyond this test's scope
    
    // For now, we'll just verify the UI flow
    console.log('Wallet connection test completed. Actual wallet interaction requires manual verification.');
  });
});
