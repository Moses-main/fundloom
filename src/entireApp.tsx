// App.tsx
// Reworked CharityChain app — keeps your theme and existing features and adds:
// - Multi-payment options
// - Campaign templates + image upload (client-side)
// - Social sharing integration
// - Donor engagement (thank you popup, donor list)
// - Transparency (simple report view)
// - Leaderboard & badges
// - Discussion/comments per campaign
// - Categories & filters
// - Persists campaigns/donations/discussions to localStorage
//
// Note: This file is intentionally single-file for ease of drop-in. For production,
// split into components, add proper state management and backend endpoints.

// import "./App.css";
import React, { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Users,
  Target,
  Calendar,
  Wallet,
  Search,
  Filter,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Clock,
  // User,
  Share2,
  Plus,
  CreditCard,
  Smartphone,
  Banknote,
  MessageSquare,
  Award,
  ExternalLink,
} from "lucide-react";
import { Button } from "./components/ui/Button";

/* ----------------------------- Type Definitions --------------------------- */
type PaymentMethod = "crypto" | "card" | "bank" | "mobile";

interface Charity {
  name: string;
  description: string;
  wallet_address: string;
  is_verified: boolean;
  total_raised: number;
  campaigns_count: number;
  registration_date: number;
}

interface Campaign {
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
  image?: string | null; // data URL
  category?: string;
  template?: string;
  // simple "usage" data for transparency demo
  funds_used?: { [key: string]: number };
}

interface Donation {
  id: number;
  donor_address: string;
  donor_name?: string;
  campaign_id: number;
  amount: number;
  timestamp: number;
  donor_message: string;
  payment_method: PaymentMethod;
}

interface Comment {
  id: number;
  campaign_id: number;
  author: string;
  message: string;
  timestamp: number;
}

/* ------------------------------- Mock Data -------------------------------- */
// Seed data for initial state
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

/* ------------------------------ Helpers ---------------------------------- */
// localStorage keys
const LS_KEYS = {
  campaigns: "cc_campaigns_v1",
  donations: "cc_donations_v1",
  comments: "cc_comments_v1",
  leaderboard: "cc_leaderboard_v1",
};

// safe parse
const readJSON = <T,>(k: string, fallback: T) => {
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

/* ------------------------------ Main App --------------------------------- */
const Entire: React.FC = () => {
  // tabs
  const [activeTab, setActiveTab] = useState<
    "campaigns" | "donate" | "charity" | "profile"
  >("campaigns");

  // persisted states (campaigns, donations, comments)
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
  const [userName, setUserName] = useState<string>(""); // donor name when donating
  const [searchTerm, setSearchTerm] = useState("");
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentMethod>("crypto");
  const [showThankYou, setShowThankYou] = useState<null | Donation>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create campaign form states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<string>("Charity");
  const [newTemplate, setNewTemplate] = useState<string>("default");

  // Discussion state for new comment
  const [newComment, setNewComment] = useState("");

  // leaderboard & badges derived from donations — saved in localStorage optionally
  const leaderboard = useMemo(() => {
    // compute top donors globally by sum of amounts
    const sums: Record<string, { name: string; total: number; count: number }> =
      {};
    donations.forEach((d) => {
      const key = d.donor_address || d.donor_name || "anonymous";
      if (!sums[key])
        sums[key] = { name: d.donor_name || key, total: 0, count: 0 };
      sums[key].total += d.amount;
      sums[key].count += 1;
    });

    const arr = Object.entries(sums).map(([addr, obj]) => ({
      address: addr,
      name: obj.name,
      total: obj.total,
      count: obj.count,
    }));

    arr.sort((a, b) => b.total - a.total);
    return arr;
  }, [donations]);

  /* --------------------------- Persist to storage ------------------------- */
  useEffect(() => {
    localStorage.setItem(LS_KEYS.campaigns, JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.donations, JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.comments, JSON.stringify(comments));
  }, [comments]);

  /* --------------------------- Wallet functions -------------------------- */
  const connectWallet = async () => {
    // mock wallet connect
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

  /* ---------------------------- Formatting ------------------------------- */
  const formatAmount = (amount: number) => {
    // keep your original pattern (K)
    if (Math.abs(amount) >= 1000) {
      return (amount / 1000).toFixed(1) + "K";
    }
    return amount.toString();
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString();

  const getDaysLeft = (deadline: number) => {
    const days = Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getProgressPercentage = (raised: number, target: number) =>
    Math.min((raised / target) * 100, 100);

  /* --------------------------- Donation logic ---------------------------- */
  const handleDonate = (simulateProcessing = true) => {
    if (!selectedCampaign || !donationAmount) return;

    // Create donation record
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

    // If simulated processing step (e.g., card / bank), we can fake success after short timeout
    // For crypto, we just accept immediately (since wallet is mocked)
    if (simulateProcessing && selectedPayment !== "crypto") {
      // fake a spinner or delay here — but we won't block UI, just set timeout
      setTimeout(() => {
        completeDonation(newDonation);
      }, 900);
    } else {
      completeDonation(newDonation);
    }
  };

  const completeDonation = (donation: Donation) => {
    setDonations((s) => [...s, donation]);

    // update campaign totals
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

    // show thank you
    setShowThankYou(donation);

    // reset donation modal fields
    setDonationAmount("");
    setDonationMessage("");
    setSelectedPayment("crypto");

    // close donation modal
    setShowDonationModal(false);
  };

  /* ------------------------- Create campaign logic ----------------------- */
  const handleImageUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewImage((e.target?.result as string) || null);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCampaign = () => {
    // validation
    if (!newTitle || !newDescription || !newTarget || !newDeadline) {
      alert("Please fill all fields to create a campaign.");
      return;
    }

    const nextId =
      campaigns.length > 0 ? Math.max(...campaigns.map((c) => c.id)) + 1 : 1;

    const campaign: Campaign = {
      id: nextId,
      charity_address: userAddress || "0x0",
      title: newTitle,
      description: newDescription,
      target_amount: parseFloat(newTarget),
      raised_amount: 0,
      deadline: new Date(newDeadline).getTime(),
      is_active: true,
      created_at: Date.now(),
      total_donors: 0,
      image: newImage,
      category: newCategory,
      template: newTemplate,
      funds_used: {},
    };

    // add to top (prominent)
    setCampaigns((prev) => [campaign, ...prev]);

    // clear fields
    setNewTitle("");
    setNewDescription("");
    setNewTarget("");
    setNewDeadline("");
    setNewImage(null);
    setShowCreateModal(false);
    setActiveTab("campaigns");

    // push campaign param to url for quick share
    if (window.history && window.history.pushState) {
      const base = window.location.origin + window.location.pathname;
      window.history.pushState({}, "", `${base}?campaign=${campaign.id}`);
    }
  };

  /* ----------------------------- Sharing --------------------------------- */
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

  // social share URLs
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

  /* ---------------------------- Campaign open ---------------------------- */
  const openCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDonationModal(true);

    // push campaign param
    if (window.history && window.history.pushState) {
      const base = window.location.origin + window.location.pathname;
      window.history.pushState({}, "", `${base}?campaign=${campaign.id}`);
    }
  };

  /* ---------------------- URL-based auto-open on mount ------------------- */
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
  }, []); // run only once

  /* ------------------------ Discussion / Comments ------------------------ */
  const addComment = (campaignId: number) => {
    if (!newComment) return;
    const comment: Comment = {
      id: comments.length + 1,
      campaign_id: campaignId,
      author: userName || userAddress || "Guest",
      message: newComment,
      timestamp: Date.now(),
    };
    setComments((s) => [...s, comment]);
    setNewComment("");
  };

  /* --------------------------- Filtering -------------------------------- */
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const categories = useMemo(() => {
    const set = new Set<string>();
    campaigns.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ["All", ...Array.from(set)];
  }, [campaigns]);

  /* --------------------------- Derived Data ------------------------------ */
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || campaign.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const topDonors = leaderboard.slice(0, 5);

  /* --------------------------- UI Render -------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  CharityChain
                </h1>
                <p className="text-sm text-gray-600">
                  Transparent Giving, Verified Impact
                </p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              {["campaigns", "donate", "charity", "profile"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === tab
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {walletConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "campaigns" && (
          <div>
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Raised
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      ₦
                      {formatAmount(
                        campaigns.reduce((s, c) => s + c.raised_amount, 0)
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Campaigns
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {campaigns.length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Donors
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {donations.length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Impact Score
                    </p>
                    <p className="text-3xl font-bold text-gray-900">98%</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Search, Filter, Create */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2">
                  <Filter className="h-4 w-4 mr-2" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-sm bg-transparent outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Create Campaign</span>
                </button>
              </div>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create card (first) */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="h-48 bg-gradient-to-br from-white to-gray-50 relative flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="mx-auto mt-60 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
                      <Plus className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl  font-bold text-gray-900 mt-4">
                      Start a Campaign
                    </h3>
                    <p className="text-gray-600 text-sm mt-2">
                      Create a new campaign and share it with your community.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                      >
                        Create Campaign
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-48 relative">
                    {campaign.image ? (
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="object-cover w-full h-48"
                      />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div className="absolute top-4 left-4">
                          <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                            {getDaysLeft(campaign.deadline)} days left
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {campaign.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {campaign.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900">
                          ₦{formatAmount(campaign.raised_amount)} raised
                        </span>
                        <span className="text-gray-600">
                          of ₦{formatAmount(campaign.target_amount)}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getProgressPercentage(
                              campaign.raised_amount,
                              campaign.target_amount
                            )}%`,
                          }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{campaign.total_donors} donors</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(campaign.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => openCampaign(campaign)}
                        disabled={!walletConnected}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {walletConnected
                          ? "Donate Now"
                          : "Connect Wallet to Donate"}
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyShareLink(campaign.id)}
                          className="w-12 h-12 rounded-xl flex items-center justify-center bg-white border border-gray-200 hover:shadow-sm"
                          title="Copy campaign link"
                        >
                          <Share2 className="h-5 w-5 text-gray-600" />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => {
                              const social = buildSocialLinks(campaign);
                              // open a small window for FB for example
                              window.open(social.facebook, "_blank");
                            }}
                            className="w-12 h-12 rounded-xl flex items-center justify-center bg-white border border-gray-200 hover:shadow-sm"
                            title="Share to Facebook"
                          >
                            <ExternalLink className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* small advanced actions */}
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            // quick "view report" modal could be a separate modal
                            // For simplicity, we open the campaign and set donation modal off
                            setSelectedCampaign(campaign);
                            setShowDonationModal(false);
                            setActiveTab("charity");
                          }}
                          className="flex items-center space-x-1"
                        >
                          <Target className="h-4 w-4" />
                          <span>View Report</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="px-2 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-600">
                          {campaign.category}
                        </span>
                        <button
                          title="Discuss"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setActiveTab("donate");
                          }}
                        >
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard / Badges (simple) */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Top Donors</h4>
                <div className="space-y-3">
                  {topDonors.map((d) => (
                    <div
                      key={d.address}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Award className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {d.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {d.address}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        ₦{formatAmount(d.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Top Campaigns
                </h4>
                <div className="space-y-3">
                  {campaigns
                    .slice()
                    .sort((a, b) => b.raised_amount - a.raised_amount)
                    .slice(0, 5)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {c.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {c.total_donors} donors
                          </div>
                        </div>
                        <div className="text-sm font-semibold">
                          ₦{formatAmount(c.raised_amount)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm">
                    Supporter
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm">
                    Generous
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm">
                    Community Builder
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DONATE tab acts as campaign detail + discussion */}
        {activeTab === "donate" && selectedCampaign && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-start space-x-6">
                <div className="w-1/3">
                  {selectedCampaign.image ? (
                    <img
                      src={selectedCampaign.image}
                      alt={selectedCampaign.title}
                      className="rounded-xl w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="h-48 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500" />
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCampaign.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedCampaign.description}
                  </p>

                  <div className="mt-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{selectedCampaign.total_donors} donors</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(selectedCampaign.created_at)}</span>
                      </div>
                    </div>

                    <div className="mt-4 w-full bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                        style={{
                          width: `${getProgressPercentage(
                            selectedCampaign.raised_amount,
                            selectedCampaign.target_amount
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <div className="mt-3 text-sm text-gray-700">
                      <strong>Raised:</strong> ₦
                      {formatAmount(selectedCampaign.raised_amount)} / ₦
                      {formatAmount(selectedCampaign.target_amount)}
                    </div>

                    {/* quick actions */}
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => {
                          setShowDonationModal(true);
                          setActiveTab("campaigns");
                        }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl"
                      >
                        Donate
                      </button>
                      <button
                        onClick={() => copyShareLink(selectedCampaign.id)}
                        className="bg-white border border-gray-200 px-4 py-2 rounded-xl"
                      >
                        Share
                      </button>
                      <div className="flex items-center space-x-2">
                        <a
                          href={buildSocialLinks(selectedCampaign).twitter}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-500"
                        >
                          Tweet
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report / Transparency */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-gray-900">
                  Transparency Report
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  A short breakdown of how funds are being used (demo data)
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {selectedCampaign.funds_used &&
                  Object.entries(selectedCampaign.funds_used).length > 0 ? (
                    Object.entries(selectedCampaign.funds_used).map(
                      ([k, v]) => (
                        <div
                          key={k}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm"
                        >
                          <div className="text-gray-600">{k}</div>
                          <div className="mt-1 font-semibold">
                            ₦{formatAmount(v)}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-sm text-gray-500">
                      No detailed expenses recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Discussion board & donors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Discussion</h4>

                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {comments
                    .filter((c) => c.campaign_id === selectedCampaign.id)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="p-3 border border-gray-100 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{c.author}</div>
                          <div className="text-xs text-gray-400">
                            {formatDate(c.timestamp)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 mt-1">
                          {c.message}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="flex space-x-3">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Join the discussion..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl"
                  />
                  <button
                    onClick={() => addComment(selectedCampaign.id)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl"
                  >
                    Comment
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Recent Donors
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {donations
                    .filter((d) => d.campaign_id === selectedCampaign.id)
                    .slice()
                    .reverse()
                    .map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {d.donor_name || d.donor_address}
                          </div>
                          <div className="text-xs text-gray-500">
                            {d.donor_message}
                          </div>
                        </div>
                        <div className="text-sm font-semibold">
                          ₦{formatAmount(d.amount)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile tab: donation history */}
        {activeTab === "profile" && walletConnected && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your Donation History
              </h2>
              <div className="space-y-4">
                {donations
                  .filter((d) => d.donor_address === userAddress)
                  .map((donation) => {
                    const campaign = campaigns.find(
                      (c) => c.id === donation.campaign_id
                    );
                    return (
                      <div
                        key={donation.id}
                        className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl"
                      >
                        <div className="bg-green-100 p-2 rounded-lg">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {campaign?.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            ₦{formatAmount(donation.amount)} donated
                          </p>
                          {donation.donor_message && (
                            <p className="text-sm text-gray-700 italic">
                              "{donation.donor_message}"
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(donation.timestamp)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CreditCard className="h-3 w-3" />
                              <span>{donation.payment_method}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Donation Modal (shared) */}
      {showDonationModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Make a Donation
              </h3>
              <button
                onClick={() => {
                  setShowDonationModal(false);
                  setSelectedCampaign(null);
                  if (window.history && window.history.replaceState) {
                    const cleanUrl =
                      window.location.origin + window.location.pathname;
                    window.history.replaceState({}, "", cleanUrl);
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                {selectedCampaign.title}
              </h4>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{
                    width: `${getProgressPercentage(
                      selectedCampaign.raised_amount,
                      selectedCampaign.target_amount
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                ₦{formatAmount(selectedCampaign.raised_amount)} of ₦
                {formatAmount(selectedCampaign.target_amount)} raised
              </p>
            </div>

            {/* donation form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your name (optional)
                </label>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How should we address you?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Amount (₦)
                </label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Leave a message of support..."
                />
              </div>

              {/* Payment methods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedPayment("crypto")}
                    className={`px-3 py-2 rounded-xl border ${
                      selectedPayment === "crypto"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4" />
                      <span className="text-sm">Crypto</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedPayment("card")}
                    className={`px-3 py-2 rounded-xl border ${
                      selectedPayment === "card"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm">Card</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedPayment("bank")}
                    className={`px-3 py-2 rounded-xl border ${
                      selectedPayment === "bank"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Banknote className="h-4 w-4" />
                      <span className="text-sm">Bank</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedPayment("mobile")}
                    className={`px-3 py-2 rounded-xl border ${
                      selectedPayment === "mobile"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">Mobile</span>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Crypto will use your connected wallet (mocked).
                  Card/bank/mobile are simulated for demo purposes.
                </p>
              </div>

              <button
                onClick={() => handleDonate(true)}
                disabled={!donationAmount}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Confirm Donation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thank-you modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-4">Thank you!</h3>
            <p className="text-sm text-gray-600 mt-2">
              Your donation of ₦{formatAmount(showThankYou.amount)} has been
              received. A receipt will be sent (simulated).
            </p>
            <div className="mt-4">
              <button
                onClick={() => setShowThankYou(null)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Create a Campaign
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Campaign title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe the campaign"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Amount (₦)
                  </label>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    placeholder="e.g. 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  >
                    <option>Charity</option>
                    <option>Education</option>
                    <option>Health</option>
                    <option>Creative</option>
                    <option>Personal</option>
                    <option>Event</option>
                    <option>Small Business</option>
                    <option>Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template
                  </label>
                  <select
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  >
                    <option value="default">Default</option>
                    <option value="impact">Impact (bold)</option>
                    <option value="medical">Medical</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  className="w-full"
                />
                {newImage && (
                  <img
                    src={newImage}
                    alt="preview"
                    className="mt-3 rounded-lg w-full h-36 object-cover"
                  />
                )}
              </div>

              <div className="flex space-x-3 mt-2">
                <button
                  onClick={handleCreateCampaign}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-white border border-gray-200 py-3 rounded-xl font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entire;
