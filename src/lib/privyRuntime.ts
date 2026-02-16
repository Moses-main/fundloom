type PrivyLoginMethod = "wallet" | "email" | "social";

type PrivyUserWallet = {
  address?: string;
  walletClientType?: string;
  chainType?: string;
};

type PrivyUserLike = {
  id?: string;
  email?: { address?: string } | string;
  wallet?: PrivyUserWallet;
  wallets?: PrivyUserWallet[];
  linkedAccounts?: Array<{ type?: string; subject?: string; address?: string; email?: string }>;
};

type PrivyLoginResult = {
  user?: PrivyUserLike;
  token?: string;
};

type PrivyClientLike = {
  init?: (input: { appId: string }) => Promise<void> | void;
  login?: (input?: Record<string, unknown>) => Promise<PrivyLoginResult | void>;
  logout?: () => Promise<void> | void;
  getUser?: () => Promise<PrivyUserLike | null>;
  getAccessToken?: () => Promise<string | null>;
  user?: PrivyUserLike | null;
  auth?: {
    login?: (input?: Record<string, unknown>) => Promise<PrivyLoginResult | void>;
    logout?: () => Promise<void> | void;
  };
};

declare global {
  interface Window {
    privy?: PrivyClientLike;
    Privy?:
      | {
          createClient?: (input: { appId: string }) => PrivyClientLike;
        }
      | ((input: { appId: string }) => PrivyClientLike);
  }
}

const DEFAULT_PRIVY_SDK_URL = "https://auth.privy.io/js/privy.js";
const PRIVY_SCRIPT_ID = "fundloom-privy-sdk";

function getPrivyAppId(): string {
  const appId =
    (typeof import.meta !== "undefined" &&
      (import.meta as { env?: { VITE_PRIVY_APP_ID?: string } }).env?.VITE_PRIVY_APP_ID) ||
    "";
  if (!appId) {
    throw new Error("VITE_PRIVY_APP_ID is missing. Add it to your local .env file.");
  }
  return appId;
}

function getPrivySdkUrl(): string {
  return (
    (typeof import.meta !== "undefined" &&
      (import.meta as { env?: { VITE_PRIVY_JS_SDK_URL?: string } }).env?.VITE_PRIVY_JS_SDK_URL) ||
    DEFAULT_PRIVY_SDK_URL
  );
}

async function ensurePrivyScriptLoaded(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.privy || window.Privy) return;

  const existing = document.getElementById(PRIVY_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    if ((existing as HTMLScriptElement).dataset.ready === "true") return;
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Privy SDK script.")), {
        once: true,
      });
    });
    return;
  }

  const script = document.createElement("script");
  script.id = PRIVY_SCRIPT_ID;
  script.src = getPrivySdkUrl();
  script.async = true;

  await new Promise<void>((resolve, reject) => {
    script.onload = () => {
      script.dataset.ready = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Unable to load Privy SDK from configured URL."));
    document.head.appendChild(script);
  });
}

export async function getPrivyClient(): Promise<PrivyClientLike> {
  const appId = getPrivyAppId();
  await ensurePrivyScriptLoaded();

  if (!window.privy && window.Privy) {
    if (typeof window.Privy === "function") {
      window.privy = window.Privy({ appId });
    } else if (window.Privy.createClient) {
      window.privy = window.Privy.createClient({ appId });
    }
  }

  if (!window.privy) {
    throw new Error("Privy runtime unavailable. Check VITE_PRIVY_JS_SDK_URL or SDK loading.");
  }

  if (window.privy.init) {
    await window.privy.init({ appId });
  }

  return window.privy;
}

export async function loginWithPrivyMethod(method: PrivyLoginMethod): Promise<{
  token: string;
  user: PrivyUserLike;
}> {
  const client = await getPrivyClient();

  const loginMethods =
    method === "wallet"
      ? ["wallet"]
      : method === "email"
      ? ["email"]
      : ["google", "apple", "discord", "twitter"];

  const payload = {
    loginMethods,
    disableSignup: false,
  } as Record<string, unknown>;

  const result =
    (await client.login?.(payload)) ||
    (await client.auth?.login?.(payload)) ||
    ({} as PrivyLoginResult);

  const user = result.user || client.user || (await client.getUser?.()) || null;
  if (!user) {
    throw new Error("Privy login succeeded but user profile could not be resolved.");
  }

  const token =
    result.token ||
    (await client.getAccessToken?.()) ||
    `privy:${method}:${user.id || Date.now().toString()}`;

  return { token, user };
}

export async function privyLogout(): Promise<void> {
  if (typeof window === "undefined") return;
  const client = window.privy;
  if (!client) return;
  await client.logout?.();
  await client.auth?.logout?.();
}

export type { PrivyUserLike, PrivyLoginMethod };
