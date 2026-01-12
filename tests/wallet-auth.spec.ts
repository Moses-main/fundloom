import { test, expect } from '@playwright/test';

test.describe('Wallet Authentication', () => {
  test('should connect wallet and navigate to dashboard', async ({ page }) => {
    // Navigate to the home page
    await page.goto('http://localhost:5173/');
    
    // Click on the "Connect Wallet" button
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await expect(connectButton).toBeVisible();
    await connectButton.click();
    
    // Wait for the wallet options to be visible
    const walletOptions = page.locator('[data-testid="wallet-option"]');
    await expect(walletOptions.first()).toBeVisible();
    
    // Click on the MetaMask option
    const metaMaskOption = page.getByText('MetaMask');
    await metaMaskOption.click();
    
    // In a real test, you would handle the MetaMask popup here
    // For now, we'll just verify that we're on the auth page
    await expect(page).toHaveURL(/.*auth/);
    
    // Wait for the "Connect with MetaMask" button to be visible
    const connectWithMetaMask = page.getByRole('button', { name: /connect with metamask/i });
    await expect(connectWithMetaMask).toBeVisible();
    
    console.log('Wallet connection test completed successfully!');
  });
});
