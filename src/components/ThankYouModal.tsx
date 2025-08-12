// src/components/ThankYouModal.tsx
import React from "react";
import { CheckCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const ThankYouModal: React.FC = () => {
  const { showThankYou, setShowThankYou, formatAmount } = useAppContext();
  if (!showThankYou) return null;

  return (
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
  );
};

export default ThankYouModal;
