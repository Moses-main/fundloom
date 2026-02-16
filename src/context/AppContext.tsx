// src/context/AppContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  postGuestDonation,
  postAuthDonation,
  createComment as apiCreateComment,
  getCampaignDetails,
  getCampaignComments,
  getCampaigns,
} from "../lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import { sendEth } from "@/lib/crypto";
import { loadingBus } from "@/lib/loadingBus";
import { deriveCampaignLifecycleStatus, type CampaignLifecycleStatus } from "@/lib/campaignLifecycle";

/* ---------- Types (same as your single-file app) ---------- */
export type PaymentMethod = "crypto" | "card" | "bank" | "mobile";

export interface Charity {
  /* not heavily used but kept */ name: string;
  description: string;
  wallet_address: string;
  is_verified: boolean;
  total_raised: number;
  campaigns_count: number;
  registration_date: number;
}

export interface Campaign {
  id: number;
  charity_address: string;
  title: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  deadline: number;
  is_active: boolean;
  is_verified?: boolean;
  lifecycle_status?: CampaignLifecycleStatus;
  moderation_reason?: string | null;
  archived_at?: number | null;
  created_at: number;
  total_donors: number;
  image?: string | null;
  category?: string;
  template?: string;
  funds_used?: { [key: string]: number };
}

export interface Donation {
  id: number;
  donor_address: string;
  donor_name?: string;
  campaign_id: number;
  amount: number;
  timestamp: number;
  donor_message: string;
  payment_method: PaymentMethod;
}

export interface Comment {
  id: number;
  campaign_id: number;
  author: string;
  message: string;
  timestamp: number;
}

/* ---------------------- (legacy localStorage removed) ---------------------- */

/* ------------------ seed data (copied from original) ------------- */
const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    charity_address: "0x123...",
    title: "Clean Water for Rural Communities",
    description:
      "Providing clean drinking water access to remote villages in Nigeria",
    target_amount: 50000,
    raised_amount: 32500,
    deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
    is_active: true,
    created_at: Date.now() - 10 * 24 * 60 * 60 * 1000,
    total_donors: 127,
    image: "/students-coding.png",
    category: "Charity",
    template: "default",
    funds_used: { infrastructure: 15000, operations: 5000, admin: 2000 },
  },
  {
    id: 2,
    charity_address: "0x456...",
    title: "Education for All Children",
    description:
      "Building schools and providing educational materials for underprivileged children",
    target_amount: 75000,
    raised_amount: 18900,
    deadline: Date.now() + 45 * 24 * 60 * 60 * 1000,
    is_active: true,
    created_at: Date.now() - 5 * 24 * 60 * 60 * 1000,
    total_donors: 89,
    image: "/students-tablets-learning.png",
    category: "Education",
    template: "impact",
    funds_used: { supplies: 4000, teachers: 2000 },
  },
  {
    id: 3,
    charity_address: "0x789...",
    title: "Healthcare Mobile Clinics",
    description:
      "Mobile medical units serving remote areas with basic healthcare services",
    target_amount: 100000,
    raised_amount: 67800,
    deadline: Date.now() + 20 * 24 * 60 * 60 * 1000,
    is_active: true,
    created_at: Date.now() - 15 * 24 * 60 * 60 * 1000,
    total_donors: 203,
    image: "/vite.svg",
    category: "Health",
    template: "medical",
    funds_used: { equipment: 30000, staff: 12000 },
  },
];

// Provide default images for campaigns that might be missing `image`
const defaultImageFor = (c: Campaign): string | null => {
  switch (c.id) {
    case 1:
      return "/students-coding.png";
    case 2:
      return "/students-tablets-learning.png";
    case 3:
      return "/vite.svg";
    default:
      return null;
  }
};

const SEED_DONATIONS: Donation[] = [
  {
    id: 1,
    donor_address: "0xabc...",
    donor_name: "Ayo",
    campaign_id: 1,
    amount: 500,
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    donor_message: "Hope this helps! Great cause.",
    payment_method: "crypto",
  },
  {
    id: 2,
    donor_address: "0xdef...",
    donor_name: "Sade",
    campaign_id: 1,
    amount: 1000,
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    donor_message: "Clean water is a basic human right.",
    payment_method: "card",
  },
];

const SEED_COMMENTS: Comment[] = [
  {
    id: 1,
    campaign_id: 1,
    author: "Ayo",
    message: "Amazing initiative — keep it up!",
    timestamp: Date.now() - 36 * 60 * 60 * 1000,
  },
];

/* ------------------- Context shape -------------------- */
export interface AppContextType {
  activeTab: "overview" | "campaigns" | "donated" | "profile" | "wallet";
  setActiveTab: (t: AppContextType["activeTab"]) => void;

  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;

  donations: Donation[];
  setDonations: React.Dispatch<React.SetStateAction<Donation[]>>;

  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;

  selectedCampaign: Campaign | null;
  setSelectedCampaign: (c: Campaign | null) => void;

  walletConnected: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  userAddress: string;
  userName: string;
  setUserName: (s: string) => void;

  // UI / modals / inputs
  showDonationModal: boolean;
  setShowDonationModal: (b: boolean) => void;
  showCreateModal: boolean;
  setShowCreateModal: (b: boolean) => void;
  showThankYou: Donation | null;
  setShowThankYou: (d: Donation | null) => void;

  // donation form fields
  donationAmount: string;
  setDonationAmount: (s: string) => void;
  donationMessage: string;
  setDonationMessage: (s: string) => void;
  selectedPayment: PaymentMethod;
  setSelectedPayment: (m: PaymentMethod) => void;

  // helpers
  formatAmount: (n: number) => string;
  formatDate: (ts: number) => string;
  getDaysLeft: (deadline: number) => number;
  getProgressPercentage: (raised: number, target: number) => number;

  // actions
  handleDonate: (simulateProcessing?: boolean) => void;
  handleCreateCampaign: () => void;
  handleImageUpload: (file?: File) => void;
  copyShareLink: (id: number) => void;
  buildSocialLinks: (c: Campaign) => {
    facebook: string;
    twitter: string;
    whatsapp: string;
    email: string;
  };
  addComment: (campaignId: number) => void;
  leaderboard: {
    address: string;
    name: string;
    total: number;
    count: number;
  }[];
  // backend details for selected backend campaign
  detailsLoading?: boolean;
  detailsError?: string | null;
  backendRecentDonations?: any[];
  backendComments?: any[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
};

/* --------------------------- Provider --------------------------- */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // tabs
  const [activeTab, setActiveTab] =
    useState<AppContextType["activeTab"]>("overview");

  // campaigns now sourced only from backend (no seed)
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  // Donations and comments now live in memory only for UI and are persisted to backend via API
  const [donations, setDonations] = useState<Donation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // UI states
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState<Donation | null>(null);

  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentMethod>("crypto");

  // Backend-driven details for selected campaign
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [backendRecentDonations, setBackendRecentDonations] = useState<
    any[] | undefined
  >(undefined);
  const [backendComments, setBackendComments] = useState<any[] | undefined>(
    undefined
  );
  const { show: toast } = useToast();
  // guard to ensure we only auto-open once from URL param
  const [autoOpenHandled, setAutoOpenHandled] = useState<boolean>(false);

  // Quick refresh helper for backend campaign details
  const refreshBackendDetails = async (backendId: string) => {
    try {
      const details = await getCampaignDetails(String(backendId));
      if (details?.success && details.data) {
        const { campaign, recentDonations } = details.data as any;
        if (campaign && selectedCampaign) {
          setCampaigns((prev) =>
            prev.map((c) =>
              c.id === selectedCampaign.id
                ? {
                    ...c,
                    raised_amount: campaign.raisedAmount ?? c.raised_amount,
                    total_donors: campaign.totalDonors ?? c.total_donors,
                  }
                : c
            )
          );
        }
        setBackendRecentDonations(recentDonations || []);
      }
    } catch {}
  };

  // Removed localStorage persistence for campaigns, donations, and comments

  // No seed backfill anymore

  // Fetch campaigns from backend on mount and map to UI shape
  useEffect(() => {
    let cancelled = false;
    const fetchCampaigns = async () => {
      try {
        const res = await getCampaigns({
          page: 1,
          limit: 50,
          status: "all",
        });
        if (!res?.success || !(res as any).data) return;
        const { campaigns: list } = (res as any).data as { campaigns: any[] };
        const mapped: Campaign[] = (list || []).map((bc, idx) => ({
          id: Date.now() + idx, // UI-local id for selection/share
          charity_address:
            bc.charityAddress || bc.creator?.walletAddress || "0x0",
          title: bc.title,
          description: bc.description,
          target_amount: bc.targetAmount,
          raised_amount: bc.raisedAmount ?? 0,
          deadline: new Date(bc.deadline).getTime(),
          is_active: bc.isActive ?? true,
          is_verified: Boolean(bc?.verification?.isVerified ?? false),
          lifecycle_status: deriveCampaignLifecycleStatus({
            status: bc.lifecycleStatus || bc.status,
            isActive: bc.isActive,
            isVerified: bc?.verification?.isVerified,
            raisedAmount: bc.raisedAmount,
            targetAmount: bc.targetAmount,
            deadline: bc.deadline,
            isArchived: bc.isArchived,
            isFlagged: bc.isFlagged,
          }),
          moderation_reason: bc?.verification?.reason || bc?.moderationReason || null,
          archived_at: bc?.archivedAt ? new Date(bc.archivedAt).getTime() : null,
          created_at: new Date(bc.createdAt).getTime(),
          total_donors: bc.totalDonors ?? 0,
          image: bc.image || null,
          category: bc.category,
          template: bc.template || "default",
          funds_used: bc.fundsUsed
            ? Object.fromEntries(Object.entries(bc.fundsUsed))
            : {},
          // @ts-ignore attach backend id for downstream operations
          backendId: bc._id,
          // @ts-ignore attach evm linkage (chainId, contract, campaignId)
          evm: bc.evm || null,
          // @ts-ignore creator id for ownership filtering
          creatorId: bc.creator?._id || bc.ownerId || null,
        }));
        if (!cancelled) setCampaigns(mapped);
      } catch (e) {
        // Silently ignore; UI continues with seed
      }
    };
    fetchCampaigns();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch backend details when selecting a backend-backed campaign
  useEffect(() => {
    const run = async () => {
      setDetailsError(null);
      setBackendRecentDonations(undefined);
      setBackendComments(undefined);
      if (!selectedCampaign) return;
      const backendId =
        (selectedCampaign as any).backendId || (selectedCampaign as any)?._id;
      if (!backendId) return; // local seed campaign
      setDetailsLoading(true);
      try {
        const details = await getCampaignDetails(String(backendId));
        if (details?.success && details.data) {
          const { campaign, recentDonations } = details.data as any;
          if (campaign) {
            // Update derived stats on the UI campaign instance
            setCampaigns((prev) =>
              prev.map((c) =>
                c.id === selectedCampaign.id
                  ? {
                      ...c,
                      raised_amount: campaign.raisedAmount ?? c.raised_amount,
                      total_donors: campaign.totalDonors ?? c.total_donors,
                      // keep other UI fields
                    }
                  : c
              )
            );
          }
          setBackendRecentDonations(recentDonations || []);
        }
        // Fetch first page of comments for display
        try {
          const commentsRes = await getCampaignComments(
            String(backendId),
            1,
            20
          );
          if (commentsRes?.success)
            setBackendComments((commentsRes.data as any)?.comments || []);
        } catch {}
      } catch (e: any) {
        setDetailsError(e?.message || "Failed to load campaign details");
      } finally {
        setDetailsLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign?.id]);

  // Read initial tab from URL when on /dashboard
  useEffect(() => {
    if (window.location.pathname.startsWith("/dashboard")) {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as AppContextType["activeTab"] | null;
      if (
        tab &&
        ["overview", "campaigns", "donated", "profile"].includes(tab)
      ) {
        setActiveTab(tab);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync with activeTab on /dashboard
  useEffect(() => {
    if (window.location.pathname.startsWith("/dashboard")) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", activeTab);
      window.history.replaceState({}, "", url.toString());
    }
  }, [activeTab]);

  // leaderboard derived
  const leaderboard = useMemo(() => {
    const sums: Record<string, { name: string; total: number; count: number }> =
      {};
    donations.forEach((d) => {
      const key = d.donor_address || d.donor_name || "anonymous";
      if (!sums[key])
        sums[key] = { name: d.donor_name || key, total: 0, count: 0 };
      sums[key].total += d.amount;
      sums[key].count += 1;
    });
    const arr = Object.entries(sums).map(([address, obj]) => ({
      address,
      name: obj.name,
      total: obj.total,
      count: obj.count,
    }));
    arr.sort((a, b) => b.total - a.total);
    return arr;
  }, [donations]);

  /* -------------------- wallet mock -------------------- */
  const connectWallet = async () => {
    setTimeout(() => {
      setWalletConnected(true);
      setUserAddress("0x1234567890abcdef...");
      setUserName("You");
    }, 700);
  };
  const disconnectWallet = () => {
    setWalletConnected(false);
    setUserAddress("");
    setUserName("");
  };

  /* ---------------- formatting helpers ------------------ */
  const formatAmount = (amount: number) =>
    Math.abs(amount) >= 1000
      ? (amount / 1000).toFixed(1) + "K"
      : amount.toString();
  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString();
  const getDaysLeft = (deadline: number) => {
    const days = Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };
  const getProgressPercentage = (raised: number, target: number) =>
    Math.min((raised / target) * 100, 100);

  /* ---------------- donation logic (same as original) ---------------- */
  const handleDonate = async (simulateProcessing = true) => {
    if (!selectedCampaign || !donationAmount) return;
    // Block donations if campaign is inactive or not approved
    const inactive = !selectedCampaign.is_active;
    const unapproved = (selectedCampaign as any).is_verified === false;
    if (inactive || unapproved) {
      toast({
        type: "info",
        title: "Donations disabled",
        description: inactive
          ? "This campaign is inactive. Donations are disabled."
          : "This campaign is not approved yet. Donations are disabled.",
      });
      return;
    }
    const amountNum = parseFloat(donationAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    // Resolve backend id if present (required for non-crypto payments)
    const backendId =
      (selectedCampaign as any).backendId || (selectedCampaign as any)?._id;

    const token = localStorage.getItem("auth_token") || undefined;

    loadingBus.begin("donation");
    try {
      // CRYPTO FLOW: send ETH directly to the campaign's wallet address
      if (selectedPayment === "crypto") {
        // Determine recipient address with fallback to user's Privy wallet
        const isValidEthAddress = (addr?: string | null) =>
          !!addr && /^0x[a-fA-F0-9]{40}$/.test(addr);

        let to: string | undefined = selectedCampaign.charity_address;

        if (!isValidEthAddress(to)) {
          // Fallback: try Privy/EVM wallet attached to authenticated user
          try {
            const raw = localStorage.getItem("auth_user");
            if (raw) {
              const user = JSON.parse(raw);
              if (isValidEthAddress(user?.walletAddress)) {
                to = user.walletAddress;
              } else if (
                Array.isArray(user?.wallets) &&
                isValidEthAddress(user.wallets[0]?.address)
              ) {
                to = user.wallets[0].address;
              }
            }
          } catch {}
        }

        if (!isValidEthAddress(to)) {
          toast({
            type: "warning",
            title: "Invalid recipient",
            description:
              "Campaign wallet address is missing or invalid, and no default wallet was found.",
          });
          return;
        }

        // Send on-chain transaction via injected wallet
        const txHash = await loadingBus.wrap(
          () => sendEth({ to: to!, amountEth: donationAmount }),
          "crypto-tx"
        );

        // Optionally record on backend if available
        if (backendId) {
          if (token) {
            await postAuthDonation(
              {
                campaignId: String(backendId),
                amount: amountNum,
                paymentMethod: selectedPayment,
                message:
                  (donationMessage ? donationMessage + " " : "") +
                  `(tx: ${txHash.slice(0, 10)}...)`,
                isAnonymous: !userName,
              },
              token
            );
          } else {
            await postGuestDonation({
              campaignId: String(backendId),
              amount: amountNum,
              paymentMethod: selectedPayment,
              message:
                (donationMessage ? donationMessage + " " : "") +
                `(tx: ${txHash.slice(0, 10)}...)`,
              isAnonymous: !userName,
              donorName: userName || undefined,
            });
          }
        }
      } else {
        // NON-CRYPTO: require backend id and use server payment flows
        if (!backendId) {
          toast({
            type: "info",
            title: "Not synced",
            description: "Select a server-backed campaign to donate.",
          });
          return;
        }
        if (token) {
          await postAuthDonation(
            {
              campaignId: String(backendId),
              amount: amountNum,
              paymentMethod: selectedPayment,
              message: donationMessage || undefined,
              isAnonymous: !userName,
            },
            token
          );
        } else {
          await postGuestDonation({
            campaignId: String(backendId),
            amount: amountNum,
            paymentMethod: selectedPayment,
            message: donationMessage || undefined,
            isAnonymous: !userName,
            donorName: userName || undefined,
          });
        }
      }

      // For UI, reflect the donation locally (no localStorage persistence)
      const uiDonation: Donation = {
        id: donations.length + 1,
        donor_address:
          userAddress || `anon-${Math.random().toString(36).slice(2, 8)}`,
        donor_name: userName || undefined,
        campaign_id: selectedCampaign.id,
        amount: amountNum,
        timestamp: Date.now(),
        donor_message: donationMessage,
        payment_method: selectedPayment,
      };
      if (simulateProcessing && selectedPayment !== "crypto") {
        setTimeout(() => completeDonation(uiDonation), 600);
        // background refresh for backend-backed campaign stats/donations
        if (backendId) refreshBackendDetails(String(backendId));
      } else {
        completeDonation(uiDonation);
        if (backendId) refreshBackendDetails(String(backendId));
      }
    } catch (e: any) {
      toast({
        type: "error",
        title: "Donation failed",
        description: e?.message || "Please try again.",
      });
    } finally {
      loadingBus.end("donation");
    }
  };

  const completeDonation = (donation: Donation) => {
    setDonations((s) => [...s, donation]);
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === donation.campaign_id
          ? {
              ...c,
              raised_amount: c.raised_amount + donation.amount,
              total_donors: c.total_donors + 1,
            }
          : c
      )
    );
    setShowThankYou(donation);
    setDonationAmount("");
    setDonationMessage("");
    setSelectedPayment("crypto");
    setShowDonationModal(false);
  };

  /* --------------- create campaign helpers --------------- */
  const handleImageUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) =>
      setCampaignImagePreview(String(e.target?.result || null));
    reader.readAsDataURL(file);
  };
  const [campaignImagePreview, setCampaignImagePreview] = useState<
    string | null
  >(null);

  const handleCreateCampaign = (opts?: {
    title?: string;
    description?: string;
    target?: number;
    deadline?: number;
    category?: string;
    template?: string;
    image?: string | null;
  }) => {
    // NOTE: this will rely on a controller in the CreateCampaignModal that calls this or you can call via context wrapper.
    // For compatibility we keep a function that will be triggered in CreateCampaignModal component by reading local component state then calling setCampaigns.
    // But we also expose this function: omitted required params will give an alert in CreateCampaignModal (component handles validations).
  };

  /* ---------------- sharing / social --------------------- */
  const copyShareLink = (id: number) => {
    try {
      const base = `${window.location.origin}/`;
      // Try to resolve a stable backend id for this campaign id
      const campaign = campaigns.find((c) => c.id === id);
      const backendId = (campaign as any)?.backendId || (campaign as any)?._id;
      const campaignParam = backendId ? String(backendId) : String(id);
      const shareUrl = `${base}?campaign=${encodeURIComponent(campaignParam)}`;
      const write = async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({
            type: "success",
            title: "Link copied",
            description: "Share link copied to clipboard",
          });
        } catch {
          // Fallback via temporary input
          const el = document.createElement("textarea");
          el.value = shareUrl;
          el.style.position = "fixed";
          el.style.left = "-9999px";
          document.body.appendChild(el);
          el.select();
          try {
            document.execCommand("copy");
            toast({
              type: "success",
              title: "Link copied",
              description: "Share link copied to clipboard",
            });
          } catch {
            toast({
              type: "warning",
              title: "Copy failed",
              description: "Unable to copy link. Please copy manually.",
            });
          } finally {
            document.body.removeChild(el);
          }
        }
      };
      write();
    } catch {
      toast({
        type: "warning",
        title: "Copy failed",
        description: "Unable to copy link. Please copy manually.",
      });
    }
  };

  const buildSocialLinks = (c: Campaign) => {
    const stableId = (c as any).backendId || (c as any)._id || c.id;
    const base = `${window.location.origin}/?campaign=${encodeURIComponent(
      String(stableId)
    )}`;
    const text = encodeURIComponent(`${c.title} — ${c.description}`);
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        base
      )}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        base
      )}&text=${text}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(
        base
      )}`,
      email: `mailto:?subject=${encodeURIComponent(
        c.title
      )}&body=${text}%0A%0A${encodeURIComponent(base)}`,
    };
  };

  /* -------------------- comments -------------------------- */
  const addComment = async (campaignId: number) => {
    if (!commentDraft) return;
    const backendId =
      (selectedCampaign as any)?.backendId || (selectedCampaign as any)?._id;
    if (!backendId) {
      toast({
        type: "info",
        title: "Not synced",
        description: "Select a server-backed campaign to comment.",
      });
      return;
    }
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast({
        type: "info",
        title: "Login required",
        description: "Please log in to comment.",
      });
      return;
    }
    try {
      await apiCreateComment(
        String(backendId),
        { message: commentDraft },
        token
      );
      // Re-fetch backend comments to reflect the new comment accurately
      try {
        const commentsRes = await getCampaignComments(String(backendId), 1, 20);
        if (commentsRes?.success)
          setBackendComments((commentsRes.data as any)?.comments || []);
      } catch {}
      setCommentDraft("");
    } catch (e: any) {
      toast({
        type: "error",
        title: "Comment failed",
        description: e?.message || "Failed to post comment.",
      });
    }
  };
  const [commentDraft, setCommentDraft] = useState("");

  /* ---------------- URL auto-open for shared links ----------------- */
  useEffect(() => {
    if (autoOpenHandled) return;
    const params = new URLSearchParams(window.location.search);
    const campaignParam = params.get("campaign");
    if (!campaignParam) return;

    // Try to match by backend id first (string), fall back to numeric local id
    let found: Campaign | undefined;
    // backend id match
    found = campaigns.find(
      (c: any) =>
        String((c as any).backendId || (c as any)._id) === String(campaignParam)
    );
    if (!found) {
      // try as numeric UI-local id
      const localId = parseInt(campaignParam, 10);
      if (!Number.isNaN(localId)) {
        found = campaigns.find((c) => c.id === localId);
      }
    }

    if (found) {
      // block auto-open if inactive or not approved
      const inactive = !found.is_active;
      const unapproved = (found as any).is_verified === false;
      if (inactive || unapproved) {
        setAutoOpenHandled(true);
        return;
      }
      setSelectedCampaign(found);
      setShowDonationModal(true);
      setAutoOpenHandled(true);
    }
    // If not found yet, effect will run again when campaigns change
  }, [campaigns, autoOpenHandled, setSelectedCampaign, setShowDonationModal]);

  /* ---------------- expose ctx ---------------------------- */
  const value: AppContextType = {
    activeTab,
    setActiveTab,
    campaigns,
    setCampaigns,
    donations,
    setDonations,
    comments,
    setComments,
    selectedCampaign,
    setSelectedCampaign,
    walletConnected,
    connectWallet,
    disconnectWallet,
    userAddress,
    userName,
    setUserName,
    showDonationModal,
    setShowDonationModal,
    showCreateModal,
    setShowCreateModal,
    showThankYou,
    setShowThankYou,
    donationAmount,
    setDonationAmount,
    donationMessage,
    setDonationMessage,
    selectedPayment,
    setSelectedPayment,
    formatAmount,
    formatDate,
    getDaysLeft,
    getProgressPercentage,
    handleDonate,
    handleCreateCampaign: () => {
      /* actual creation happens inside CreateCampaignModal component for validation */
    },
    handleImageUpload,
    copyShareLink,
    buildSocialLinks,
    addComment,
    leaderboard,
    // backend details for selected backend campaign
    detailsLoading,
    detailsError,
    backendRecentDonations,
    backendComments,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
