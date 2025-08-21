import React, { useRef } from "react";
import { Campaign, useAppContext } from "../context/AppContext";
import {
  Users,
  Calendar,
  Share2,
  ExternalLink,
  MessageSquare,
  Target,
} from "lucide-react";
import { useToast } from "./ui/ToastProvider";
import { uploadImage, updateCampaign, postCampaignWithdraw } from "../lib/api";
import { getCampaignDetails } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const {
    getDaysLeft,
    getProgressPercentage,
    formatAmount,
    setSelectedCampaign,
    setShowDonationModal,
    setActiveTab,
    copyShareLink,
    buildSocialLinks,
    setCampaigns,
  } = useAppContext() as any;
  const { show: toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const onUploadClick = () => fileRef.current?.click();

  const handleFileSelected = async (file?: File) => {
    try {
      if (!file) return;
      const MAX_BYTES = 5 * 1024 * 1024; // 5MB
      if (!file.type?.startsWith("image/")) {
        toast({
          type: "warning",
          title: "Invalid file",
          description: "Please select a valid image file.",
        });
        return;
      }
      if (file.size > MAX_BYTES) {
        toast({
          type: "warning",
          title: "Image too large",
          description: "Please choose an image under 5MB.",
        });
        return;
      }
      const token = localStorage.getItem("auth_token") || undefined;
      if (!token) {
        toast({
          type: "info",
          title: "Login required",
          description: "Please log in to update the campaign image.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = String(e.target?.result || "");
        try {
          const up = await uploadImage(
            { file: dataUrl, folder: "fundloom/campaigns" },
            token
          );
          const newUrl = (up as any)?.data?.url;
          if (!newUrl) throw new Error("Upload failed");
          await updateCampaign(String(campaign.id), { image: newUrl }, token);
          setCampaigns((prev: Campaign[]) =>
            prev.map((c) =>
              c.id === campaign.id ? { ...c, image: newUrl } : c
            )
          );
          toast({
            type: "success",
            title: "Image updated",
            description: "Campaign cover image has been updated.",
          });
        } catch (err: any) {
          toast({
            type: "error",
            title: "Failed to set image",
            description: err?.message || String(err),
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      toast({
        type: "error",
        title: "Upload error",
        description: e?.message || String(e),
      });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    const token = localStorage.getItem("auth_token") || undefined;
    if (!token) {
      toast({
        type: "info",
        title: "Login required",
        description: "Please log in to remove the campaign image.",
      });
      return;
    }
    try {
      await updateCampaign(String(campaign.id), { image: null }, token);
      setCampaigns((prev: Campaign[]) =>
        prev.map((c) => (c.id === campaign.id ? { ...c, image: null } : c))
      );
      toast({
        type: "success",
        title: "Image removed",
        description: "Campaign cover image has been cleared.",
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Failed to remove image",
        description: err?.message || String(err),
      });
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="h-48 relative">
        {/* Hidden file input for uploads */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e: any) => handleFileSelected(e.target.files?.[0])}
        />
        {campaign.image ? (
          <img
            src={campaign.image}
            alt={campaign.title}
            className="object-cover w-full h-48"
          />
        ) : (
          <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-4 left-4">
              <span className="bg-card/90 text-foreground px-3 py-1 rounded-full text-xs font-medium">
                {getDaysLeft(campaign.deadline)} days left
              </span>
            </div>
          </div>
        )}

        {/* Top-right controls: Upload button; Remove icon when image exists */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onUploadClick}
            className="px-3 py-1.5 text-xs rounded-full bg-white/90 dark:bg-gray-900/80 border border-border hover:bg-white dark:hover:bg-gray-900"
            title="Upload image"
          >
            Upload
          </button>
          {campaign.image && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/90 dark:bg-gray-900/80 border border-border hover:bg-white dark:hover:bg-gray-900"
              title="Remove image"
              aria-label="Remove image"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
          {campaign.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {campaign.description}
        </p>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">
              ${formatAmount(campaign.raised_amount)} raised
            </span>
            <span className="text-muted-foreground">
              of ${formatAmount(campaign.target_amount)}
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
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

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{campaign.total_donors} donors</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          {(() => {
            const inactive = !campaign.is_active;
            const unapproved = (campaign as any).is_verified === false;
            const disabled = inactive || unapproved;
            const btnClasses = `flex-1 py-3 rounded-xl font-medium transition-all shadow-lg ${
              disabled
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
            }`;
            return (
              <button
                disabled={disabled}
                onClick={async () => {
                  // Always re-check live backend status before allowing donation
                  const backendId =
                    (campaign as any).backendId || (campaign as any)._id;
                  if (backendId) {
                    try {
                      const details = await getCampaignDetails(
                        String(backendId)
                      );
                      const bc = (details as any)?.data?.campaign;
                      if (bc) {
                        const nowInactive = bc.isActive === false;
                        const nowUnapproved =
                          Boolean(bc?.verification?.isVerified) === false;
                        // reflect latest into UI state
                        setCampaigns((prev: Campaign[]) =>
                          prev.map((c) =>
                            c.id === campaign.id
                              ? {
                                  ...c,
                                  is_active: bc.isActive ?? c.is_active,
                                  // @ts-ignore
                                  is_verified: Boolean(
                                    bc?.verification?.isVerified ?? false
                                  ),
                                }
                              : c
                          )
                        );
                        if (nowInactive || nowUnapproved) {
                          const reason = nowInactive
                            ? "This campaign is inactive. Donations are disabled."
                            : "This campaign is not approved yet. Donations are disabled.";
                          toast({
                            type: "info",
                            title: "Donations disabled",
                            description: reason,
                          });
                          return;
                        }
                      }
                    } catch {
                      // If check fails, be conservative: block and inform user
                      toast({
                        type: "warning",
                        title: "Unable to verify campaign status",
                        description: "Please try again later.",
                      });
                      return;
                    }
                  } else {
                    // No backend id -> cannot accept donations
                    toast({
                      type: "info",
                      title: "Not available",
                      description:
                        "This campaign isn't available for donations yet.",
                    });
                    return;
                  }
                  setSelectedCampaign(campaign);
                  setShowDonationModal(true);
                }}
                className={btnClasses}
              >
                Donate Now
              </button>
            );
          })()}

          {(() => {
            // Owner-only donors button
            const creatorId = (campaign as any).creatorId;
            const backendId =
              (campaign as any).backendId || (campaign as any)._id;
            const isOwner =
              !!user?.id &&
              !!creatorId &&
              String(user.id) === String(creatorId);
            if (!isOwner) return null;
            return (
              <button
                type="button"
                onClick={() => {
                  if (!backendId) {
                    toast({
                      type: "info",
                      title: "Not available",
                      description:
                        "This campaign isn't synced with the server yet.",
                    });
                    return;
                  }
                  navigate(
                    `/campaigns/${encodeURIComponent(String(backendId))}/donors`
                  );
                }}
                className="px-4 py-3 rounded-xl font-medium bg-card border border-border hover:shadow-sm"
                title="View donors"
              >
                View Donors
              </button>
            );
          })()}

          {(() => {
            // Owner-only withdraw button
            const creatorId = (campaign as any).creatorId;
            const backendId =
              (campaign as any).backendId || (campaign as any)._id;
            const isOwner =
              !!user?.id &&
              !!creatorId &&
              String(user.id) === String(creatorId);
            if (!isOwner) return null;

            const goalMet =
              Number(campaign.raised_amount) >= Number(campaign.target_amount);
            const deadlinePassed = (() => {
              try {
                const d = new Date(campaign.deadline);
                return !isNaN(d.getTime()) && d.getTime() < Date.now();
              } catch {
                return false;
              }
            })();
            const isWithdrawn = Boolean(
              (campaign as any).is_withdrawn ?? (campaign as any).isWithdrawn
            );
            const eligible = (goalMet || deadlinePassed) && !isWithdrawn;

            if (!eligible) return null;

            return (
              <button
                type="button"
                onClick={async () => {
                  if (!backendId) {
                    toast({
                      type: "info",
                      title: "Not available",
                      description:
                        "This campaign isn't synced with the server yet.",
                    });
                    return;
                  }
                  try {
                    const res = await postCampaignWithdraw(String(backendId));
                    if (res?.success) {
                      // Reflect in UI
                      setCampaigns((prev: Campaign[]) =>
                        prev.map((c) =>
                          c.id === campaign.id
                            ? {
                                ...c,
                                // mark withdrawn and deactivate
                                // @ts-ignore
                                is_withdrawn: true,
                                is_active: false,
                              }
                            : c
                        )
                      );
                      toast({
                        type: "success",
                        title: "Withdrawal successful",
                        description: "Funds have been withdrawn.",
                      });
                    } else {
                      throw new Error(res?.message || "Withdrawal failed");
                    }
                  } catch (err: any) {
                    toast({
                      type: "error",
                      title: "Withdrawal failed",
                      description: err?.message || String(err),
                    });
                  }
                }}
                className="px-3 py-1 rounded-xl font-medium bg-green-600 text-white hover:bg-green-700"
                title="Withdraw funds"
              >
                Withdraw
              </button>
            );
          })()}

          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyShareLink(campaign.id)}
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-card border border-border hover:shadow-sm"
              title="Copy campaign link"
            >
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              onClick={() =>
                window.open(buildSocialLinks(campaign).facebook, "_blank")
              }
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-card border border-border hover:shadow-sm"
              title="Share to Facebook"
            >
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
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
            <span className="px-2 py-1 rounded-full bg-muted border border-border text-muted-foreground">
              {campaign.category}
            </span>
            <button
              title="Discuss"
              onClick={() => {
                setSelectedCampaign(campaign);
                setActiveTab("donate");
              }}
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
