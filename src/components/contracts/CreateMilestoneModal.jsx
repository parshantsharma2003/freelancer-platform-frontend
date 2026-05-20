import { useState } from "react";
import { milestoneAPI } from "../../services/api";

const CreateMilestoneModal = ({ contractId, onClose, refresh }) => {
  const [milestones, setMilestones] = useState([
    { title: "", description: "", amount: "", dueDate: "" }
  ]);
  const [error, setError] = useState("");

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { title: "", description: "", amount: "", dueDate: "" }
    ]);
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const submitMilestones = async () => {
    try {
      setError("");

      const hasInvalidMilestone = milestones.some((milestone) => (
        !milestone.title?.trim() ||
        !milestone.description?.trim() ||
        !milestone.dueDate ||
        !Number.isFinite(Number(milestone.amount)) ||
        Number(milestone.amount) <= 0
      ));

      if (hasInvalidMilestone) {
        setError("Please fill title, description, amount, and deadline for each milestone.");
        return;
      }

      const normalizedMilestones = milestones.map((milestone) => ({
        ...milestone,
        title: milestone.title.trim(),
        description: milestone.description.trim(),
        amount: Number(milestone.amount)
      }));

      await milestoneAPI.createMilestones({
        contractId,
        milestones: normalizedMilestones
      });

      refresh();
      onClose();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to create milestones");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded-lg w-[600px]">

        <h2 className="text-xl font-bold mb-4">Create Milestones</h2>

        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}

        {milestones.map((m, i) => (

          <div key={i} className="grid grid-cols-1 gap-2 mb-4">

            <input
              className="border p-2"
              placeholder="Title"
              value={m.title}
              onChange={(e) =>
                updateMilestone(i, "title", e.target.value)
              }
            />

            <textarea
              className="border p-2 min-h-[84px]"
              placeholder="Description"
              value={m.description}
              onChange={(e) =>
                updateMilestone(i, "description", e.target.value)
              }
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                className="border p-2"
                type="number"
                min="1"
                placeholder="Amount"
                value={m.amount}
                onChange={(e) =>
                  updateMilestone(i, "amount", e.target.value)
                }
              />

              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Deadline</p>
                <input
                  className="border p-2 w-full"
                  type="date"
                  value={m.dueDate}
                  onChange={(e) =>
                    updateMilestone(i, "dueDate", e.target.value)
                  }
                />
              </div>
            </div>

          </div>

        ))}

        <div className="flex justify-between mt-4">

          <button
            onClick={addMilestone}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            + Add Milestone
          </button>

          <button
            onClick={submitMilestones}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create
          </button>

        </div>

      </div>

    </div>
  );
};

export default CreateMilestoneModal;