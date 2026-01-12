import { AuthTabs } from "@/components/auth/auth-tabs";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to FundLoom
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to create campaigns or support projects
          </p>
        </div>
        <AuthTabs />
      </div>
    </div>
  );
}
