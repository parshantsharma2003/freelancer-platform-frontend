import { formatCurrency, formatDate } from "../../lib/utils";
import { useState } from "react";
import SubmitWorkModal from "./SubmitWorkModal";

const MilestoneCard = ({
  milestone,
  user,
  onFund,
  onSubmit,
  onApprove,
  onRelease,
  refresh // Added refresh prop to be passed to the modal
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  return (
    <div className="border p-4 rounded-lg flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{milestone.title}</h3>
        <p className="text-sm text-gray-600">
          Due: {formatDate(milestone.dueDate)}
        </p>
        <p className="text-sm">Status: {milestone.status}</p>
      </div>

      <div className="flex gap-2">
        {user.role === "client" &&
          milestone.status === "pending" &&
          !milestone.escrow?.isHeld && (
            <button onClick={() => onFund(milestone)} className="btn-primary">
              Fund
            </button>
          )}

        {/* Updated Freelancer Button to trigger Modal */}
        {user.role === "freelancer" &&
          milestone.status === "pending" &&
          milestone.escrow?.isHeld && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn-success"
            >
              Submit Work
            </button>
          )}

        {user.role === "client" && milestone.status === "submitted" && (
          <button
            onClick={() => onApprove(milestone._id)}
            className="btn-warning"
          >
            Approve
          </button>
        )}

        {user.role === "client" && milestone.status === "approved" && (
          <button
            onClick={() => onRelease(milestone._id)}
            className="btn-purple"
          >
            Release Payment
          </button>
        )}
      </div>

      <div className="font-semibold">{formatCurrency(milestone.amount)}</div>

      {/* Logic to display the SubmitWorkModal */}
      {showSubmitModal && (
        <SubmitWorkModal
          milestone={milestone}
          refresh={refresh}
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
};

export default MilestoneCard;