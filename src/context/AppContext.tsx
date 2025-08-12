// import React, { createContext, useContext, useState, ReactNode } from "react";

// export type Campaign = {
//   id: string;
//   title: string;
//   description: string;
//   category: string;
//   targetAmount: number;
//   raisedAmount: number;
//   imageUrl: string;
//   owner: string;
// };

// export type Donation = {
//   id: string;
//   campaignId: string;
//   donor: string;
//   amount: number;
//   date: string;
// };

// type Theme = "light" | "dark";

// type AppContextType = {
//   activeTab: "campaigns" | "donate" | "profile";
//   setActiveTab: (tab: AppContextType["activeTab"]) => void;
//   walletConnected: boolean;
//   walletAddress: string | null;
//   connectWallet: () => void;
//   disconnectWallet: () => void;
//   theme: Theme;
//   toggleTheme: () => void;

//   campaigns: Campaign[];
//   addCampaign: (campaign: Campaign) => void;
//   selectedCampaign: Campaign | null;
//   setSelectedCampaign: (c: Campaign | null) => void;

//   donations: Donation[];
//   addDonation: (donation: Donation) => void;

//   showCreateModal: boolean;
//   setShowCreateModal: (show: boolean) => void;

//   showDonationModal: boolean;
//   setShowDonationModal: (show: boolean) => void;

//   showThankYouModal: boolean;
//   setShowThankYouModal: (show: boolean) => void;
// };

// const AppContext = createContext<AppContextType | undefined>(undefined);

// export const useAppContext = () => {
//   const context = useContext(AppContext);
//   if (!context)
//     throw new Error("useAppContext must be used within AppProvider");
//   return context;
// };

// export const AppProvider = ({ children }: { children: ReactNode }) => {
//   const [activeTab, setActiveTab] =
//     useState<AppContextType["activeTab"]>("campaigns");
//   const [walletConnected, setWalletConnected] = useState(false);
//   const [walletAddress, setWalletAddress] = useState<string | null>(null);
//   const [theme, setTheme] = useState<Theme>("light");

//   // Dummy campaigns
//   const [campaigns, setCampaigns] = useState<Campaign[]>([
//     {
//       id: "1",
//       title: "Save the Rainforest",
//       description: "Help us protect the rainforest ecosystem",
//       category: "Environment",
//       targetAmount: 10000,
//       raisedAmount: 4500,
//       imageUrl: "https://placekitten.com/400/250",
//       owner: "0x123...",
//     },
//     {
//       id: "2",
//       title: "Clean Ocean Initiative",
//       description: "Reduce ocean pollution by supporting cleanup",
//       category: "Environment",
//       targetAmount: 20000,
//       raisedAmount: 15000,
//       imageUrl: "https://placekitten.com/401/251",
//       owner: "0x456...",
//     },
//   ]);
//   const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
//     null
//   );

//   // Dummy donations
//   const [donations, setDonations] = useState<Donation[]>([
//     {
//       id: "d1",
//       campaignId: "1",
//       donor: "0xabc...",
//       amount: 100,
//       date: new Date().toISOString(),
//     },
//   ]);

//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showDonationModal, setShowDonationModal] = useState(false);
//   const [showThankYouModal, setShowThankYouModal] = useState(false);

//   const connectWallet = () => {
//     // dummy wallet connect
//     setWalletConnected(true);
//     setWalletAddress("0xYourWalletAddress");
//   };

//   const disconnectWallet = () => {
//     setWalletConnected(false);
//     setWalletAddress(null);
//   };

//   const toggleTheme = () => {
//     setTheme((t) => (t === "light" ? "dark" : "light"));
//   };

//   const addCampaign = (campaign: Campaign) => {
//     setCampaigns((prev) => [...prev, campaign]);
//   };

//   const addDonation = (donation: Donation) => {
//     setDonations((prev) => [...prev, donation]);
//   };

//   return (
//     <AppContext.Provider
//       value={{
//         activeTab,
//         setActiveTab,
//         walletConnected,
//         walletAddress,
//         connectWallet,
//         disconnectWallet,
//         theme,
//         toggleTheme,
//         campaigns,
//         addCampaign,
//         selectedCampaign,
//         setSelectedCampaign,
//         donations,
//         addDonation,
//         showCreateModal,
//         setShowCreateModal,
//         showDonationModal,
//         setShowDonationModal,
//         showThankYouModal,
//         setShowThankYouModal,
//       }}
//     >
//       {children}
//     </AppContext.Provider>
//   );
// };

// src/context/AppContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

/* ---------------------- localStorage helpers ---------------------- */
const LS_KEYS = {
  campaigns: "cc_campaigns_v1",
  donations: "cc_donations_v1",
  comments: "cc_comments_v1",
};

const readJSON = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

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
    image: null,
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
    image: null,
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
    image: null,
    category: "Health",
    template: "medical",
    funds_used: { equipment: 30000, staff: 12000 },
  },
];

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
  activeTab: "campaigns" | "donate" | "charity" | "profile";
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
    useState<AppContextType["activeTab"]>("campaigns");

  // persisted states
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    readJSON<Campaign[]>(LS_KEYS.campaigns, SEED_CAMPAIGNS)
  );
  const [donations, setDonations] = useState<Donation[]>(() =>
    readJSON<Donation[]>(LS_KEYS.donations, SEED_DONATIONS)
  );
  const [comments, setComments] = useState<Comment[]>(() =>
    readJSON<Comment[]>(LS_KEYS.comments, SEED_COMMENTS)
  );

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

  // persist to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEYS.campaigns, JSON.stringify(campaigns));
  }, [campaigns]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.donations, JSON.stringify(donations));
  }, [donations]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.comments, JSON.stringify(comments));
  }, [comments]);

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
  const handleDonate = (simulateProcessing = true) => {
    if (!selectedCampaign || !donationAmount) return;

    const newDonation: Donation = {
      id: donations.length + 1,
      donor_address:
        userAddress || `anon-${Math.random().toString(36).slice(2, 8)}`,
      donor_name: userName || undefined,
      campaign_id: selectedCampaign.id,
      amount: parseFloat(donationAmount),
      timestamp: Date.now(),
      donor_message: donationMessage,
      payment_method: selectedPayment,
    };

    if (simulateProcessing && selectedPayment !== "crypto") {
      setTimeout(() => completeDonation(newDonation), 900);
    } else {
      completeDonation(newDonation);
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
      const base = window.location.origin + window.location.pathname;
      const shareUrl = `${base}?campaign=${id}`;
      navigator.clipboard.writeText(shareUrl);
      alert("Campaign link copied to clipboard!");
    } catch {
      alert("Unable to copy link. Please copy manually.");
    }
  };

  const buildSocialLinks = (c: Campaign) => {
    const base = `${
      window.location.origin + window.location.pathname
    }?campaign=${c.id}`;
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
  const addComment = (campaignId: number) => {
    if (!commentDraft) return;
    const comment: Comment = {
      id: comments.length + 1,
      campaign_id: campaignId,
      author: userName || userAddress || "Guest",
      message: commentDraft,
      timestamp: Date.now(),
    };
    setComments((s) => [...s, comment]);
    setCommentDraft("");
  };
  const [commentDraft, setCommentDraft] = useState("");

  /* ---------------- URL auto-open on mount ----------------- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const campaignParam = params.get("campaign");
    if (campaignParam) {
      const id = parseInt(campaignParam, 10);
      if (!isNaN(id)) {
        const found = campaigns.find((c) => c.id === id);
        if (found) {
          setSelectedCampaign(found);
          setShowDonationModal(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
