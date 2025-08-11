import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Shield, KeyRound, HelpCircle } from "lucide-react";

export default function ForgotWalletPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Wallet Recovery</h1>
        <p className="text-muted-foreground mt-2">
          Lost access to your wallet? Follow these steps to recover or create a
          new wallet.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-0 dark:border border-border bg-card shadow-[0_8px_24px_#aaa]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-teal-700" />
              <CardTitle>Before you start</CardTitle>
            </div>
            <CardDescription>
              For your security, we cannot recover seed phrases or private keys.
              Recovery must be done through your wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Never share your seed phrase or private key with anyone.</li>
              <li>
                Only enter your seed phrase in your wallet app or extension.
              </li>
              <li>Double-check you are on the official wallet website/app.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 dark:border border-border bg-card shadow-[0_8px_24px_#aaa]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-teal-700" />
              <CardTitle>Recovery options</CardTitle>
            </div>
            <CardDescription>
              Choose the wallet you use and follow their official guide.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              className="rounded-xl border p-4 hover:border-gray-300 transition-colors"
              href="https://support.metamask.io/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="font-medium">MetaMask</div>
              <div className="text-xs text-muted-foreground">
                Restore using Secret Recovery Phrase
              </div>
            </a>
            <a
              className="rounded-xl border p-4 hover:border-gray-300 transition-colors"
              href="https://walletconnect.com/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="font-medium">WalletConnect</div>
              <div className="text-xs text-muted-foreground">
                Use your original wallet app
              </div>
            </a>
            <a
              className="rounded-xl border p-4 hover:border-gray-300 transition-colors"
              href="https://www.coinbase.com/wallet"
              target="_blank"
              rel="noreferrer"
            >
              <div className="font-medium">Coinbase Wallet</div>
              <div className="text-xs text-muted-foreground">
                Restore with recovery phrase
              </div>
            </a>
            <a
              className="rounded-xl border p-4 hover:border-gray-300 transition-colors"
              href="https://help.phantom.app/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="font-medium">Phantom</div>
              <div className="text-xs text-muted-foreground">
                Use backup/recovery options
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="border-0 dark:border border-border bg-card shadow-[0_8px_24px_#aaa]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-teal-700" />
              <CardTitle>Can’t recover?</CardTitle>
            </div>
            <CardDescription>
              If recovery isn’t possible, you can create a new wallet and link
              it to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link to="/auth?mode=signup">Create a New Account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth?mode=login">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <p>
            Tip: Consider setting up a hardware wallet and securely storing your
            recovery phrase in multiple safe locations.
          </p>
        </div>
      </div>
    </div>
  );
}
