// import React, { useState } from "react";
// import { useAppContext } from "../context/AppContext";

// export default function CreateCampaignModal() {
//   const {
//     setShowCreateModal,
//     addCampaign,
//     walletAddress,
//     setSelectedCampaign,
//     setActiveTab,
//   } = useAppContext();

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [category, setCategory] = useState("Charity");
//   const [targetAmount, setTargetAmount] = useState<number | "">("");
//   const [imageUrl, setImageUrl] = useState<string>("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!title || !description || !targetAmount) {
//       alert("Please fill required fields");
//       return;
//     }

//     const campaign = {
//       id: Date.now().toString(),
//       title,
//       description,
//       category,
//       targetAmount: Number(targetAmount),
//       raisedAmount: 0,
//       imageUrl: imageUrl || `https://picsum.photos/seed/${Date.now()}/800/450`,
//       owner: walletAddress || "0x0",
//     };

//     addCampaign(campaign);
//     setShowCreateModal(false);
//     setTitle("");
//     setDescription("");
//     setCategory("Charity");
//     setTargetAmount("");
//     setImageUrl("");
//     // select new campaign and go to donate page
//     setSelectedCampaign(campaign);
//     setActiveTab("donate");
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
//       >
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-semibold">Create a Campaign</h3>
//           <button
//             type="button"
//             onClick={() => setShowCreateModal(false)}
//             className="text-gray-500 hover:text-gray-700"
//             aria-label="Close"
//           >
//             ×
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="text-sm block mb-1">Title</label>
//             <input
//               className="w-full px-3 py-2 border rounded"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//             />
//           </div>

//           <div>
//             <label className="text-sm block mb-1">Category</label>
//             <select
//               className="w-full px-3 py-2 border rounded"
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//             >
//               <option>Charity</option>
//               <option>Education</option>
//               <option>Health</option>
//               <option>Creative</option>
//               <option>Community</option>
//               <option>Event</option>
//             </select>
//           </div>

//           <div className="md:col-span-2">
//             <label className="text-sm block mb-1">Description</label>
//             <textarea
//               className="w-full px-3 py-2 border rounded"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               rows={4}
//               required
//             />
//           </div>

//           <div>
//             <label className="text-sm block mb-1">Target Amount (USD)</label>
//             <input
//               type="number"
//               min={1}
//               className="w-full px-3 py-2 border rounded"
//               value={targetAmount}
//               onChange={(e) =>
//                 setTargetAmount(
//                   e.target.value === "" ? "" : Number(e.target.value)
//                 )
//               }
//               required
//             />
//           </div>

//           <div>
//             <label className="text-sm block mb-1">
//               Cover Image URL (optional)
//             </label>
//             <input
//               className="w-full px-3 py-2 border rounded"
//               value={imageUrl}
//               onChange={(e) => setImageUrl(e.target.value)}
//               placeholder="https://..."
//             />
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end space-x-3">
//           <button
//             type="button"
//             onClick={() => setShowCreateModal(false)}
//             className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
//           >
//             Create
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// src/components/CreateCampaignModal.tsx
import React, { useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { createCampaign, uploadImage } from "../lib/api";
import { useToast } from "./ui/ToastProvider";

const CreateCampaignModal: React.FC = () => {
  const {
    setShowCreateModal,
    setCampaigns,
    userAddress,
    setSelectedCampaign,
    setActiveTab,
  } = useAppContext();
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newImagePath, setNewImagePath] = useState<string>("");
  const [newCategory, setNewCategory] = useState("Charity");
  const [newTemplate, setNewTemplate] = useState("default");
  const { show: toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file?: File) => {
    if (!file) return;
    const MAX_BYTES = 5 * 1024 * 1024; // 5MB
    if (!file.type?.startsWith("image/")) {
      toast({ type: "warning", title: "Invalid file", description: "Please select a valid image file." });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ type: "warning", title: "Image too large", description: "Please choose an image under 5MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setNewImage(String(e.target?.result || null));
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!newTitle || !newDescription || !newTarget || !newDeadline) {
      toast({ type: "warning", title: "Missing fields", description: "Please fill all fields to create a campaign." });
      return;
    }
    // Basic client-side validations aligned with backend Joi
    if (newTitle.trim().length < 5) {
      toast({ type: "warning", title: "Title too short", description: "Title must be at least 5 characters long" });
      return;
    }
    if (newDescription.trim().length < 20) {
      toast({ type: "warning", title: "Description too short", description: "Description must be at least 20 characters long" });
      return;
    }
    const targetNum = parseFloat(newTarget);
    if (isNaN(targetNum) || targetNum < 1000) {
      toast({ type: "warning", title: "Invalid target", description: "Target amount must be at least ₦1,000" });
      return;
    }
    // Normalize deadline to end-of-day to avoid timezone edge cases causing "past" dates
    const deadlineLocal = new Date(`${newDeadline}T23:59:59`);
    const deadlineIso = deadlineLocal.toISOString();
    if (deadlineLocal.getTime() <= Date.now()) {
      toast({ type: "warning", title: "Invalid deadline", description: "Deadline must be in the future" });
      return;
    }
    // Normalize image inputs
    const imagePathTrim = (newImagePath || "").trim();
    let imageToUse = (imagePathTrim && imagePathTrim) || newImage || null;
    // Require authentication for creation
    const token = localStorage.getItem("auth_token") || undefined;
    if (!token) {
      toast({ type: "info", title: "Login required", description: "Please log in to create a campaign." });
      return;
    }
    let backendCampaign: any | null = null;
    if (token) {
      try {
        // If an image is provided, upload to Cloudinary first
        if (imageToUse) {
          try {
            let payload: { file?: string; url?: string } | null = null;
            if (newImage && newImage.startsWith("data:")) {
              payload = { file: newImage };
            } else if (imagePathTrim && imagePathTrim.startsWith("http")) {
              payload = { url: imagePathTrim };
            } else if (imagePathTrim && imagePathTrim.startsWith("/")) {
              // Relative public path: fetch and convert to data URL for upload
              const rel = imagePathTrim;
              try {
                const resp = await fetch(rel);
                if (resp.ok) {
                  const blob = await resp.blob();
                  const toDataUrl = (b: Blob) =>
                    new Promise<string>((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(String(reader.result));
                      reader.onerror = reject;
                      reader.readAsDataURL(b);
                    });
                  const dataUrl = await toDataUrl(blob);
                  payload = { file: dataUrl };
                } else {
                  // Fallback to absolute URL of the public asset
                  payload = { url: `${window.location.origin}${rel}` } as any;
                }
              } catch (e) {
                // Fallback to absolute URL of the public asset
                payload = { url: `${window.location.origin}${rel}` } as any;
              }
            }

            // Only call upload API if we constructed a valid payload
            if (payload && (payload.file || payload.url)) {
              const up = await uploadImage({ ...payload, folder: 'fundloom/campaigns' }, token);
              const uploadedUrl = (up as any)?.data?.url;
              if (uploadedUrl) imageToUse = uploadedUrl;
            }
          } catch (e) {
            console.warn("Image upload failed, proceeding without image:", (e as any)?.message || e);
            // Do NOT send base64 or invalid image in campaign payload; drop image to avoid large bodies and validation surprises
            imageToUse = null;
            toast({ type: "warning", title: "Image upload failed", description: "We couldn't upload your image. You can proceed without an image or try another file/URL." });
          }
        }
        // Only include charityAddress if it matches backend's Ethereum address pattern
        const ethAddrRegex = /^0x[a-fA-F0-9]{40}$/;
        const payload: any = {
          title: newTitle.trim(),
          description: newDescription.trim(),
          category: newCategory,
          targetAmount: targetNum,
          deadline: deadlineIso,
          // Never send base64 data URLs to the create endpoint; only include a URL
          ...(imageToUse && !String(imageToUse).startsWith("data:")
            ? { image: imageToUse }
            : {}),
          template: newTemplate as any,
        };
        if (userAddress && ethAddrRegex.test(userAddress)) {
          payload.charityAddress = userAddress;
        }
        const res = await createCampaign(payload, token);
        backendCampaign = res?.data?.campaign || null;
      } catch (e: any) {
        console.error("Campaign creation failed:", e?.message || e);
        toast({ type: "error", title: "Create failed", description: e?.message || "Failed to create campaign. Please try again." });
        return;
      }
    }

    // Ensure we have a backend campaign
    if (!backendCampaign) {
      toast({ type: "error", title: "No campaign", description: "Failed to create campaign on the server. Please try again." });
      return;
    }

    // Map backend campaign into local Campaign shape and update state
    const campaign = {
      id: Date.now(),
      charity_address: backendCampaign.charityAddress || userAddress || "0x0",
      title: backendCampaign.title,
      description: backendCampaign.description,
      target_amount: backendCampaign.targetAmount,
      raised_amount: backendCampaign.raisedAmount ?? 0,
      deadline: new Date(backendCampaign.deadline).getTime(),
      is_active: backendCampaign.isActive ?? true,
      created_at: new Date(backendCampaign.createdAt).getTime(),
      total_donors: backendCampaign.totalDonors ?? 0,
      image: backendCampaign.image || imageToUse,
      category: backendCampaign.category,
      template: backendCampaign.template || newTemplate,
      funds_used: Object.fromEntries(
        backendCampaign.fundsUsed ? Array.from(Object.entries(backendCampaign.fundsUsed)) : []
      ),
      backendId: backendCampaign._id,
    } as any;
    setCampaigns((prev: any) => [campaign, ...prev]);
    setNewTitle("");
    setNewDescription("");
    setNewTarget("");
    setNewDeadline("");
    setNewImage(null);
    setShowCreateModal(false);
    setSelectedCampaign(campaign);
    setActiveTab("campaigns");
    toast({ type: "success", title: "Campaign created", description: "Your campaign has been created successfully." });
    // push campaign param for share
    if (window.history && window.history.pushState) {
      const base = window.location.origin + window.location.pathname;
      window.history.pushState({}, "", `${base}?campaign=${campaign.id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create a Campaign</h3>
          <button
            onClick={() => setShowCreateModal(false)}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Title
            </label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
              placeholder="Campaign title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Description
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
              rows={4}
              placeholder="Describe the campaign"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Target Amount (₦)
              </label>
              <input
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                placeholder="e.g. 50000"
                min={1000}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Deadline
              </label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option>Charity</option>
                <option>Education</option>
                <option>Health</option>
                <option>Creative</option>
                <option>Personal</option>
                <option>Event</option>
                <option>Small Business</option>
                <option>Community</option>
                <option>Emergency</option>
                <option>Environment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Template
              </label>
              <select
                value={newTemplate}
                onChange={(e) => setNewTemplate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="default">Default</option>
                <option value="impact">Impact (bold)</option>
                <option value="medical">Medical</option>
                <option value="creative">Creative</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Cover Image (optional)
            </label>
            {/* Hidden file input triggered by button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e: any) => handleImageUpload(e.target.files?.[0])}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 text-sm"
              >
                Upload Image
              </button>
              {newImage && (
                <span className="text-xs text-gray-500 dark:text-gray-400">Image selected</span>
              )}
            </div>
            {newImage && (
              <div className="relative mt-3">
                <img
                  src={newImage}
                  alt="preview"
                  className="rounded-lg w-full h-36 object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setNewImage(null); setNewImagePath(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 bg-white/80 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            )}
            <div className="mt-3">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Or use a public image path or URL (e.g. /students-coding.png)
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={newImagePath}
                  onChange={(e) => setNewImagePath(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="/your-public-image.png or https://..."
                />
                {newImagePath && (
                  <button
                    type="button"
                    onClick={() => setNewImagePath("")}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Clear image URL"
                    aria-label="Clear image URL"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-2">
            <button
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 py-3 rounded-xl font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignModal;
