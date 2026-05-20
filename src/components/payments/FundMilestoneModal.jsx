import { useState } from "react";
import { paymentAPI } from "../../services/api";

const FundMilestoneModal = ({ contractId, milestone, onClose, refresh }) => {

  const [loading, setLoading] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState("stripe");
  const [error, setError] = useState("");

  const fundMilestone = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await paymentAPI.createPayment({
        contractId,
        milestoneId: milestone._id,
        amount: milestone.amount,
        type: "deposit",
        paymentGateway
      });

      const clientSecret = res.data.data.clientSecret;

      if (paymentGateway === "stripe" && clientSecret) {
        alert("Stripe funding recorded and escrow is now held.");
      } else {
        alert("Milestone funded successfully");
      }

      refresh();
      onClose();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to fund milestone");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded-lg w-[400px]">

        <h2 className="text-lg font-bold mb-4">
          Fund Milestone
        </h2>

        <p className="mb-3">{milestone.title}</p>

        <p className="mb-4 font-semibold">
          Amount: ${milestone.amount}
        </p>

        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}

        <label className="block mb-3 text-sm font-medium text-gray-700">
          Payment Method
          <select
            className="mt-1 w-full border rounded px-3 py-2"
            value={paymentGateway}
            onChange={(event) => setPaymentGateway(event.target.value)}
          >
            <option value="stripe">Stripe</option>
            <option value="razorpay">Razorpay</option>
          </select>
        </label>

        {paymentGateway === "stripe" && (
          <p className="mb-3 text-xs text-gray-500">
            Stripe will create the escrow record and mark the milestone funded immediately.
          </p>
        )}

        {paymentGateway === "razorpay" && (
          <p className="mb-3 text-xs text-gray-500">
            Razorpay funding is recorded as held in escrow immediately in this flow.
          </p>
        )}

        <button
          onClick={fundMilestone}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Processing..." : `Pay with ${paymentGateway === "stripe" ? "Stripe" : "Razorpay"}`}
        </button>

        <button
          onClick={onClose}
          className="mt-3 text-gray-500 w-full"
        >
          Cancel
        </button>

      </div>

    </div>
  );
};

export default FundMilestoneModal;