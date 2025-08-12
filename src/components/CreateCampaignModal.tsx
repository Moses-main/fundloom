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
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

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
  const [newCategory, setNewCategory] = useState("Charity");
  const [newTemplate, setNewTemplate] = useState("default");

  const handleImageUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setNewImage(String(e.target?.result || null));
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    if (!newTitle || !newDescription || !newTarget || !newDeadline) {
      alert("Please fill all fields to create a campaign.");
      return;
    }
    const nextId =
      Math.max(
        0,
        ...(JSON.parse(localStorage.getItem("cc_campaigns_v1") || "[]")?.map(
          (c: any) => c.id
        ) || [0])
      ) + 1;
    const campaign = {
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
    setCampaigns((prev: any) => [campaign, ...prev]);
    setNewTitle("");
    setNewDescription("");
    setNewTarget("");
    setNewDeadline("");
    setNewImage(null);
    setShowCreateModal(false);
    setSelectedCampaign(campaign);
    setActiveTab("campaigns");
    // push campaign param for share
    if (window.history && window.history.pushState) {
      const base = window.location.origin + window.location.pathname;
      window.history.pushState({}, "", `${base}?campaign=${campaign.id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Create a Campaign</h3>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
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
              onChange={(e: any) => handleImageUpload(e.target.files?.[0])}
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
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium"
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
  );
};

export default CreateCampaignModal;
